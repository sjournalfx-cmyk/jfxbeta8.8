import React, { useState, useRef, useEffect } from 'react';
import mermaid from 'mermaid';
import { motion } from 'motion/react';
import { 
    List, CheckCircle2, Check, StickyNote, Wand2, 
    ZoomIn, ZoomOut, Maximize2, Minimize2, 
    RotateCcw, Move, X, Download
} from 'lucide-react';

export type ChecklistStatus = 'todo' | 'doing' | 'done' | 'blocked';

export type ChecklistItem = {
    text: string;
    checked: boolean;
    status?: ChecklistStatus;
    indentLevel?: number;
};

const MERMAID_DIRECTIVE_PATTERN = /^(graph\s|flowchart\s|sequenceDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|pie\s|journey\s|mindmap\s)/i;
const MERMAID_TYPE_DIRECTIVES: Record<string, string> = {
    FLOWCHART: 'graph TD',
    SEQUENCE: 'sequenceDiagram',
    STATE: 'stateDiagram-v2',
    GANTT: 'gantt',
    ER: 'erDiagram'
};

const MERMAID_KEYWORD_LINE_PATTERN = /^(graph\s|flowchart\s|sequenceDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|pie\s|journey\s|mindmap\s|title\b|participant\b|actor\b|autonumber\b|subgraph\b|end\b|alt\b|opt\b|loop\b|par\b|rect\b|activate\b|deactivate\b|break\b|critical\b|section\b|classDef\b|class\b|style\b|linkStyle\b|click\b|note\b|accTitle\b|accDescr\b)/i;
const MERMAID_RELATIONSHIP_PATTERN = /(-->|==>|-.->|---|:::|->>|-->>|<<->>|<--|<==|==|-.|~~)/;
const MERMAID_NODE_DECLARATION_PATTERN = /^[A-Za-z0-9_][\w-]*\s*[\[{(]/;
const MERMAID_ER_RELATION_PATTERN = /(\|\|--o\{|\|\|--\|\{|\}o--\|\||\}o--o\{|\|o--o\{|\|o--\|\||\}|\{)/;
const MERMAID_GANTT_TASK_PATTERN = /^[^:\n][^:\n]*:\s*[A-Za-z0-9_][\w-]*\s*,/;
const MERMAID_TYPE_LABEL_PATTERN = /^(diagram|flowchart|sequence|state|gantt|er)(?:\s+diagram)?\b[:\s-]*/i;
const LEGACY_FLOWCHART_NODE_PATTERN = /^([A-Za-z0-9_]+)=>\s*([a-z]+)(?::\s*(.+))?$/i;
const LEGACY_FLOWCHART_EDGE_SEGMENT_PATTERN = /^([A-Za-z0-9_]+)(?:\(([^)]+)\))?$/;

const toMermaidFlowchartNode = (id: string, legacyType: string, label?: string) => {
    const safeLabel = (label || id).trim().replace(/"/g, '&quot;');
    switch (legacyType.toLowerCase()) {
        case 'start':
            return `${id}([${safeLabel}])`;
        case 'end':
            return `${id}([${safeLabel}])`;
        case 'condition':
            return `${id}{${safeLabel}}`;
        case 'inputoutput':
            return `${id}[/${safeLabel}/]`;
        case 'subroutine':
            return `${id}[[${safeLabel}]]`;
        case 'operation':
        default:
            return `${id}[${safeLabel}]`;
    }
};

const normalizeLegacyFlowchartLayout = (source: string, type?: string) => {
    if ((type || '').toUpperCase() !== 'FLOWCHART') return null;
    if (!/=>/.test(source) || !/->/.test(source)) return null;

    const lines = source
        .replace(/;/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    const nodeLines: string[] = [];
    const edgeLines: string[] = [];
    const declaredNodes = new Set<string>();

    for (const line of lines) {
        const nodeMatch = line.match(LEGACY_FLOWCHART_NODE_PATTERN);
        if (nodeMatch) {
            declaredNodes.add(nodeMatch[1]);
            nodeLines.push(toMermaidFlowchartNode(nodeMatch[1], nodeMatch[2], nodeMatch[3]));
            continue;
        }

        if (!line.includes('->')) continue;
        const segments = line.split('->').map((segment) => segment.trim()).filter(Boolean);
        if (segments.length < 2) continue;

        let previous = segments[0].match(LEGACY_FLOWCHART_EDGE_SEGMENT_PATTERN);
        if (!previous) continue;

        for (let index = 1; index < segments.length; index += 1) {
            const current = segments[index].match(LEGACY_FLOWCHART_EDGE_SEGMENT_PATTERN);
            if (!current) continue;

            const previousId = previous[1];
            const currentId = current[1];
            const branchLabel = previous[2]?.trim();

            if (declaredNodes.has(previousId) && declaredNodes.has(currentId)) {
                edgeLines.push(branchLabel ? `${previousId} -->|${branchLabel}| ${currentId}` : `${previousId} --> ${currentId}`);
            }

            previous = current;
        }
    }

    if (nodeLines.length === 0 || edgeLines.length === 0) return null;
    return ['graph TD', ...nodeLines, ...edgeLines].join('\n').trim();
};

const normalizeFlowchartEdgeLabels = (source: string, type?: string) => {
    if ((type || '').toUpperCase() !== 'FLOWCHART' && !/^(graph|flowchart)\b/i.test(source.trim())) {
        return source;
    }

    return source.replace(/\|([^|\n]+)\|/g, (_, label: string) => {
        const sanitized = label
            .replace(/[()[\]{}]/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();

        return `|${sanitized}|`;
    });
};

const sanitizeFlowchartLabelText = (label: string) => label
    .replace(/[()[\]{}]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

const normalizeFlowchartNodeLabels = (source: string, type?: string) => {
    if ((type || '').toUpperCase() !== 'FLOWCHART' && !/^(graph|flowchart)\b/i.test(source.trim())) {
        return source;
    }

    return source
        .replace(/(\b[A-Za-z0-9_]+\s*\(\[)([^\]\n]+)(\]\))/g, (_, open: string, label: string, close: string) => `${open}${sanitizeFlowchartLabelText(label)}${close}`)
        .replace(/(\b[A-Za-z0-9_]+\s*\[\[)([^\]\n]+)(\]\])/g, (_, open: string, label: string, close: string) => `${open}${sanitizeFlowchartLabelText(label)}${close}`)
        .replace(/(\b[A-Za-z0-9_]+\s*\[\/)([^/\n]+)(\/\])/g, (_, open: string, label: string, close: string) => `${open}${sanitizeFlowchartLabelText(label)}${close}`)
        .replace(/(\b[A-Za-z0-9_]+\s*\[)([^\]\n]+)(\])/g, (_, open: string, label: string, close: string) => `${open}${sanitizeFlowchartLabelText(label)}${close}`)
        .replace(/(\b[A-Za-z0-9_]+\s*\{)([^}\n]+)(\})/g, (_, open: string, label: string, close: string) => `${open}${sanitizeFlowchartLabelText(label)}${close}`);
};

const normalizeInlineDirectiveLayout = (source: string, type?: string) => {
    const trimmed = source.trim();
    if (!trimmed) return trimmed;

    if ((type || '').toUpperCase() === 'GANTT' || /^gantt\b/i.test(trimmed)) {
        let normalized = trimmed
            .replace(/^gantt\s+/i, 'gantt\n')
            .replace(/\s+(title|dateFormat|axisFormat|tickInterval|excludes)\b/g, '\n$1')
            .replace(/\s+(section)\b/g, '\n\n$1')
            .replace(/\n{3,}/g, '\n\n');

        const lines = normalized.split('\n');
        const rebuilt: string[] = [];
        for (const line of lines) {
            const current = line.trim();
            if (!current) {
                if (rebuilt[rebuilt.length - 1] !== '') rebuilt.push('');
                continue;
            }

            if (MERMAID_GANTT_TASK_PATTERN.test(current) || /^(gantt|title\b|dateFormat\b|axisFormat\b|tickInterval\b|excludes\b|section\b)/i.test(current)) {
                rebuilt.push(current);
                continue;
            }

            const taskMatch = current.match(/^(.+?\s*:\s*[A-Za-z0-9_][\w-]*,\s*[\d-]{10},\s*\d+[a-z]*)\s+(.*)$/i);
            if (taskMatch) {
                rebuilt.push(taskMatch[1].trim());
                rebuilt.push(taskMatch[2].trim());
                continue;
            }

            rebuilt.push(current);
        }

        return rebuilt.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    }

    return trimmed;
};

const decodeMermaidEntities = (value: string) => value
    .replace(/&gt;/gi, '>')
    .replace(/&lt;/gi, '<')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, ' ');

const normalizeMermaidSource = (rawCode: string) => decodeMermaidEntities(rawCode)
    .replace(/\r\n/g, '\n')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\[\/?WIDGET:[^\]]+\]/gi, '')
    .replace(/\[SECTION:[^\]]+\]/gi, '')
    .replace(/^\s*syntax error in text\s*$/gim, '')
    .replace(/^\s*mermaid version\s+[^\n]*$/gim, '')
    .trim();

const dedupeCandidates = (candidates: string[]) => {
    const seen = new Set<string>();
    return candidates.filter((candidate) => {
        const normalized = candidate.trim();
        if (!normalized || seen.has(normalized)) {
            return false;
        }
        seen.add(normalized);
        return true;
    });
};

const looksLikeMermaidSyntax = (line: string, type?: string) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (MERMAID_KEYWORD_LINE_PATTERN.test(trimmed)) return true;
    if (MERMAID_RELATIONSHIP_PATTERN.test(trimmed)) return true;
    if (MERMAID_NODE_DECLARATION_PATTERN.test(trimmed)) return true;
    if (MERMAID_ER_RELATION_PATTERN.test(trimmed) && /\b[A-Za-z0-9_]+\b/.test(trimmed)) return true;
    if ((type || '').toUpperCase() === 'GANTT' && MERMAID_GANTT_TASK_PATTERN.test(trimmed)) return true;
    return false;
};

const removeStandaloneProseLines = (lines: string[], type?: string) => {
  const proseLike = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (MERMAID_TYPE_LABEL_PATTERN.test(trimmed) && !MERMAID_DIRECTIVE_PATTERN.test(trimmed)) return true;
    return !looksLikeMermaidSyntax(trimmed, type);
  };

  const hasSyntaxLine = lines.some((line) => !proseLike(line) && line.trim().length > 0);
  if (!hasSyntaxLine) {
    return lines;
  }

  return lines.filter((line) => !proseLike(line));
};

export const buildMermaidCandidates = (rawCode: string, type?: string) => {
    const normalized = normalizeMermaidSource(rawCode);
    const trimmed = normalized.replace(/```mermaid/gi, '```').trim();
    const candidates: string[] = [];
    const baseCandidate = trimmed.replace(/```/g, '').trim();
    const inlineNormalized = normalizeInlineDirectiveLayout(baseCandidate, type);
    const legacyFlowchartNormalized = normalizeLegacyFlowchartLayout(baseCandidate, type);

    const fencedMatch = trimmed.match(/```(?:mermaid)?\s*([\s\S]*?)```/i);
    if (fencedMatch?.[1]) {
        candidates.push(normalizeFlowchartNodeLabels(normalizeFlowchartEdgeLabels(fencedMatch[1].trim(), type), type));
    }

    candidates.push(normalizeFlowchartNodeLabels(normalizeFlowchartEdgeLabels(baseCandidate, type), type));
    if (inlineNormalized && inlineNormalized !== baseCandidate) {
        candidates.push(normalizeFlowchartNodeLabels(normalizeFlowchartEdgeLabels(inlineNormalized, type), type));
    }
    if (legacyFlowchartNormalized) {
        candidates.push(normalizeFlowchartNodeLabels(normalizeFlowchartEdgeLabels(legacyFlowchartNormalized, type), type));
    }

    const lines = trimmed
        .replace(/```/g, '')
        .split('\n')
        .map((line) => line.trimEnd());
    const firstDirectiveIndex = lines.findIndex((line) => MERMAID_DIRECTIVE_PATTERN.test(line.trim()));

    if (firstDirectiveIndex >= 0) {
        candidates.push(lines.slice(firstDirectiveIndex).join('\n').trim());
    }

    const cleanedLines = lines
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .filter((line) => !/^title\s*$/i.test(line))
        .filter((line) => !/^mermaid version/i.test(line))
        .filter((line) => !/^here(?:'s| is)\b/i.test(line))
        .filter((line) => !/^diagram\b[:\s-]/i.test(line))
        .filter((line) => !/^flowchart\b[:\s-]/i.test(line))
        .filter((line) => !/^sequence(?:\s+diagram)?\b[:\s-]/i.test(line))
        .filter((line) => !/^state(?:\s+diagram)?\b[:\s-]/i.test(line))
        .filter((line) => !/^gantt(?:\s+diagram)?\b[:\s-]/i.test(line))
        .filter((line) => !/^er(?:\s+diagram)?\b[:\s-]/i.test(line))
        .filter((line) => !/^note\b[:\s-]/i.test(line));

    const cleaned = cleanedLines.join('\n').trim();
    if (cleaned) {
        candidates.push(normalizeFlowchartNodeLabels(normalizeFlowchartEdgeLabels(cleaned, type), type));
    }

    const proseTrimmed = removeStandaloneProseLines(lines, type)
        .map((line) => line.trim())
        .filter(Boolean)
        .join('\n')
        .trim();

    if (proseTrimmed) {
        candidates.push(normalizeFlowchartNodeLabels(normalizeFlowchartEdgeLabels(proseTrimmed, type), type));
    }

    const normalizedProseTrimmed = normalizeInlineDirectiveLayout(proseTrimmed, type);
    if (normalizedProseTrimmed && normalizedProseTrimmed !== proseTrimmed) {
        candidates.push(normalizeFlowchartNodeLabels(normalizeFlowchartEdgeLabels(normalizedProseTrimmed, type), type));
    }

    const legacyFlowchartFromProse = normalizeLegacyFlowchartLayout(proseTrimmed, type);
    if (legacyFlowchartFromProse) {
        candidates.push(normalizeFlowchartNodeLabels(normalizeFlowchartEdgeLabels(legacyFlowchartFromProse, type), type));
    }

    const fallbackDirective = MERMAID_TYPE_DIRECTIVES[(type || '').toUpperCase()];
    if (fallbackDirective && cleaned && !MERMAID_DIRECTIVE_PATTERN.test(cleaned.split('\n')[0] || '')) {
        candidates.push(normalizeFlowchartNodeLabels(normalizeFlowchartEdgeLabels(`${fallbackDirective}\n${cleaned}`.trim(), type), type));
    }

    return dedupeCandidates(candidates);
};

const clearMermaidErrorArtifacts = (root: ParentNode = document) => {
    root.querySelectorAll('[id^="dmermaid-"], .mermaid-error, .error-icon, .error-text').forEach((node) => {
        node.remove();
    });
};

const formatMermaidError = (error: unknown) => {
    if (error instanceof Error) {
        return error.message.split('\n')[0].trim();
    }

    return 'Unknown Mermaid render error.';
};

// Checklist Widget Component
export const ChecklistWidget = ({
    title,
    items,
    isDarkMode
}: {
    title: string,
    items: ChecklistItem[],
    isDarkMode: boolean
}) => {
    const [localItems, setLocalItems] = useState(items);

    useEffect(() => {
        setLocalItems(items);
    }, [items]);

    const toggleItem = (index: number) => {
        const nextStatus = (status?: ChecklistStatus, checked = false): Pick<ChecklistItem, 'status' | 'checked'> => {
            if (!status) {
                return { checked: !checked };
            }

            switch (status) {
                case 'todo':
                    return { status: 'doing', checked: false };
                case 'doing':
                    return { status: 'done', checked: true };
                case 'done':
                    return { status: 'blocked', checked: false };
                case 'blocked':
                default:
                    return { status: 'todo', checked: false };
            }
        };

        const newItems = localItems.map((item, i) => (
            i === index
                ? { ...item, ...nextStatus(item.status, item.checked) }
                : item
        ));
        setLocalItems(newItems);
    };

    const completedCount = localItems.filter((item) => item.checked || item.status === 'done').length;
    const activeCount = localItems.filter((item) => item.status === 'doing').length;
    const blockedCount = localItems.filter((item) => item.status === 'blocked').length;
    const progress = localItems.length > 0 
        ? (completedCount / localItems.length) * 100 
        : 0;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full overflow-hidden rounded-[28px] border ${
                isDarkMode 
                    ? 'bg-black/70 border-white/8 shadow-2xl shadow-black/20' 
                    : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'
            }`}
        >
            {/* Header */}
            <div className={`px-4 py-3 border-b flex items-center justify-between ${
                isDarkMode ? 'border-white/8 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/80'
            }`}>
                <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
                        <List size={14} />
                    </div>
                    <div>
                        <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
                        {title || 'Checklist'}
                        </span>
                        <div className={`mt-0.5 text-[9px] uppercase tracking-[0.18em] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                            {completedCount}/{localItems.length || 0} done
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] ${
                        isDarkMode ? 'bg-white/5 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                        {Math.round(progress)}% complete
                    </span>
                    <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] ${
                        isDarkMode ? 'bg-white/5 text-cyan-300' : 'bg-cyan-50 text-cyan-700'
                    }`}>
                        {activeCount} active
                    </span>
                    {blockedCount > 0 && (
                        <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] ${
                            isDarkMode ? 'bg-white/5 text-rose-300' : 'bg-rose-50 text-rose-700'
                        }`}>
                            {blockedCount} blocked
                        </span>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className={`h-0.5 w-full ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400"
                />
            </div>

            {/* Items */}
            <div className="p-2.5 space-y-1.5">
                {localItems.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => toggleItem(i)}
                        style={{ paddingLeft: `${12 + (item.indentLevel || 0) * 18}px` }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group text-left ${
                            item.status === 'done' || item.checked
                                ? (isDarkMode ? 'bg-emerald-500/8 text-zinc-500' : 'bg-emerald-50/70 text-slate-400')
                                : item.status === 'doing'
                                    ? (isDarkMode ? 'bg-cyan-500/10 text-cyan-100 ring-1 ring-cyan-500/20' : 'bg-cyan-50 text-cyan-900 ring-1 ring-cyan-200')
                                    : item.status === 'blocked'
                                        ? (isDarkMode ? 'bg-rose-500/8 text-rose-100 ring-1 ring-rose-500/20' : 'bg-rose-50 text-rose-900 ring-1 ring-rose-200')
                                        : (isDarkMode ? 'hover:bg-white/6 text-zinc-200 border border-white/5' : 'hover:bg-white text-slate-700 shadow-sm border border-transparent hover:border-slate-200')
                        }`}
                    >
                        <div className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            item.status === 'done' || item.checked
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : item.status === 'doing'
                                    ? 'bg-cyan-500 border-cyan-500 text-white'
                                    : item.status === 'blocked'
                                        ? 'bg-rose-500 border-rose-500 text-white'
                                        : (isDarkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white group-hover:border-emerald-500/50')
                        }`}>
                            {item.status === 'done' || item.checked
                                ? <Check size={12} strokeWidth={4} />
                                : item.status === 'doing'
                                    ? <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                    : item.status === 'blocked'
                                        ? <X size={12} strokeWidth={3.5} />
                                        : null}
                        </div>
                        <span className={`text-xs font-medium text-left flex-1 leading-5 ${
                            item.status === 'done' || item.checked ? 'line-through opacity-55' : ''
                        }`}>
                            {item.text}
                        </span>
                        {item.status && (
                            <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] ${
                                item.status === 'done'
                                    ? isDarkMode ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                                    : item.status === 'doing'
                                        ? isDarkMode ? 'bg-cyan-500/10 text-cyan-300' : 'bg-cyan-100 text-cyan-700'
                                        : item.status === 'blocked'
                                            ? isDarkMode ? 'bg-rose-500/10 text-rose-300' : 'bg-rose-100 text-rose-700'
                                            : isDarkMode ? 'bg-white/5 text-zinc-400' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {item.status}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </motion.div>
    );
};

// Preset templates for common trading diagrams
export const DIAGRAM_PRESETS = {
    decision: {
        FLOWCHART: `graph TD
    A[Market Open] --> B{Price > EMA?}
    B -->|Yes| C[Check Trend]
    B -->|No| D[Wait for Signal]
    C --> E{Momentum Alignment?}
    E -->|Yes| F[Enter Trade]
    E -->|No| G[Skip Trade]
    F --> H{Trade Winning?}
    H -->|Yes| I[Trail Stop]
    H -->|No| J[Check Time]
    J --> K{Time > Session End?}
    K -->|Yes| L[Close Trade]
    K -->|No| M[Hold]`,
        SEQUENCE: `sequenceDiagram
    participant Price as Price Action
    participant Signal as Signal Gen
    participant Execute as Execution
    participant Risk as Risk Manager
    
    Price->>Signal: Price Updates
    Signal->>Execute: Signal Triggered
    Execute->>Risk: Check Limits
    Risk->>Execute: Approved
    Execute->>Price: Order Filled
    Price-->>Risk: P&L Update`
    },
    psychology: {
        FLOWCHART: `graph TD
    A[Start Session] --> B{Emotional State?}
    B -->|Tilted| C[Pause Trading]
    C --> D[Deep Breaths]
    D --> E[Review Rules]
    E --> F{Ready to Reset?}
    F -->|Yes| G[Resume Trading]
    F -->|No| H[End Session]
    B -->|Calm| G
    G --> I{Trade Result?}
    I -->|Win| J[Note Success]
    I -->|Loss| K[Analyze Mistake]
    J --> A
    K --> L{Repeat Mistake?}
    L -->|Yes| M[Tighten Rules]
    L -->|No| A
    M --> A`
    },
    scaling: {
        GANTT: `gantt
    title 90-Day Scaling Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1
    Base Risk (1R)       :a1, 2024-01-01, 30d
    Test Stability        :a2, after a1, 20d
    section Phase 2
    1.25R Implementation :b1, after a2, 30d
    Review Performance   :b2, after b1, 10d
    section Phase 3
    1.5R Scaling         :c1, after b2, 30d
    Final Assessment     :c2, after c1, 10d`
    }
};

export const CHECKLIST_PRESETS = {
    entry: [
        "Market aligns with daily bias",
        "Price at key structure level",
        "Confirm momentum direction",
        "Check news/events calendar",
        "Risk/Reward minimum 1:2",
        "Position size calculated",
        "Stop loss placed at logical level",
        "Take profit target identified"
    ],
    exit: [
        "Hit profit target - Exit full",
        "Hit stop loss - Accept loss",
        "Time exit - Session end",
        "Trailing stop activated",
        "News event approaching",
        "Technical reversal signal"
    ],
    psychology: [
        "Are you trading the plan?",
        "Is your mind clear?",
        "Did you check your P&L?",
        "Are you emotionally stable?",
        "Is this a revenge trade?",
        "Have you taken breaks?",
        "Is your focus sharp?",
        "Are you following rules?"
    ],
    risk: [
        "Max risk per trade: 1-2%",
        "Max daily loss: 6%",
        "Max open positions: 3",
        "Correlation check done",
        "Lot size verified",
        "Account balance confirmed"
    ]
};

// Mermaid Widget Component
export const MermaidWidget = ({ code, type, isDarkMode, onSave, onFix }: { code: string, type: string, isDarkMode: boolean, onSave?: () => void, onFix?: (type: string, code: string) => void }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorDetail, setErrorDetail] = useState<string | null>(null);
    const [normalizedPreview, setNormalizedPreview] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isRendering, setIsRendering] = useState(false);
    const [draftCode, setDraftCode] = useState(code);

    useEffect(() => {
        setDraftCode(code);
    }, [code]);

    useEffect(() => {
        let isMounted = true;
        const renderDiagram = async () => {
            if (!containerRef.current || !isMounted) return;
            setIsRendering(true);
            let lastTriedCandidate: string | null = null;
            try {
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                    containerRef.current.style.width = '';
                    containerRef.current.style.maxWidth = '';
                }
                clearMermaidErrorArtifacts();
                setError(null);
                setErrorDetail(null);
                setNormalizedPreview(null);
                
                mermaid.initialize({
                    startOnLoad: false,
                    theme: isDarkMode ? 'dark' : 'default',
                    securityLevel: 'loose',
                    fontFamily: 'Inter',
                    fontSize: 14,
                    themeVariables: {
                        primaryColor: isDarkMode ? '#334155' : '#f8fafc',
                        primaryTextColor: isDarkMode ? '#e2e8f0' : '#0f172a',
                        primaryBorderColor: isDarkMode ? '#475569' : '#cbd5e1',
                        lineColor: isDarkMode ? '#64748b' : '#cbd5e1',
                        secondaryColor: isDarkMode ? '#1e293b' : '#eef2f7',
                        tertiaryColor: isDarkMode ? '#0f172a' : '#e2e8f0'
                    }
                });

                // Mermaid may inject its own parser error SVG/text into the DOM on failed renders.
                // Suppress that while we probe candidate variants and rely on our own error UI instead.
                const previousParseError = (mermaid as any).parseError;
                (mermaid as any).parseError = () => {};

                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const candidates = buildMermaidCandidates(draftCode, type);
                let svg: string | null = null;
                let renderError: unknown = null;
                let selectedCandidate: string | null = null;

                try {
                    for (const candidate of candidates) {
                        try {
                            clearMermaidErrorArtifacts();
                            lastTriedCandidate = candidate;
                            await mermaid.parse(candidate);
                            const rendered = await mermaid.render(`${id}-${Math.random().toString(36).slice(2, 6)}`, candidate);
                            svg = rendered.svg;
                            selectedCandidate = candidate;
                            break;
                        } catch (candidateError) {
                            renderError = candidateError;
                            selectedCandidate = candidate;
                        }
                    }
                } finally {
                    (mermaid as any).parseError = previousParseError;
                    clearMermaidErrorArtifacts();
                }

                if (!svg) {
                    throw renderError ?? new Error('No valid Mermaid candidate could be rendered.');
                }
                
                if (containerRef.current && isMounted) {
                    containerRef.current.innerHTML = svg;
                    const svgElement = containerRef.current.querySelector('svg');
                    if (svgElement) {
                        const bBox = svgElement.getBBox();
                        const intrinsicWidth = Math.max(Math.ceil(bBox.width || 0), 300);
                        svgElement.removeAttribute('height');
                        svgElement.style.width = `${intrinsicWidth}px`;
                        svgElement.style.maxWidth = 'none';
                        svgElement.style.height = 'auto';
                        svgElement.style.display = 'block';
                        containerRef.current.style.width = `${intrinsicWidth}px`;
                        containerRef.current.style.maxWidth = 'none';

                        if (wrapperRef.current) {
                            const containerWidth = wrapperRef.current.clientWidth;
                            const containerHeight = wrapperRef.current.clientHeight;
                            
                            const scaleX = containerWidth / intrinsicWidth;
                            const scaleY = containerHeight / Math.max(bBox.height, 200);
                            const initialScale = Math.min(Math.min(scaleX, scaleY), 1.2);
                            
                            setScale(Math.max(initialScale, 0.3));
                        }
                    }
                    setError(null);
                    setErrorDetail(null);
                    setNormalizedPreview(selectedCandidate);
                }
            } catch (e: any) {
                console.error("Mermaid Render Error", e);
                if (isMounted) {
                    setError("Diagram syntax error. Please check the normalized Mermaid below.");
                    setErrorDetail(formatMermaidError(e));
                    const candidates = buildMermaidCandidates(draftCode, type);
                    setNormalizedPreview(lastTriedCandidate || candidates[0] || draftCode);
                }
            } finally {
                if (isMounted) setIsRendering(false);
            }
        };

        const timeoutId = setTimeout(renderDiagram, 200);
        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [draftCode, isDarkMode, isFullScreen, type]);

    const handleDownload = () => {
        const svg = containerRef.current?.querySelector('svg');
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `jfx-architect-${type.toLowerCase()}-${Date.now()}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const fitDiagram = () => setScale(1);
    const zoomStep = 0.1;
    const handleZoomIn = () => setScale((current) => Math.min(4, current + zoomStep));
    const handleZoomOut = () => setScale((current) => Math.max(0.2, current - zoomStep));

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || isFullScreen) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setScale(s => Math.min(4, Math.max(0.2, s + delta)));
        }
    };

    const WidgetContent = (
        <div className={`flex flex-col h-full ${isFullScreen ? 'p-6' : ''}`}>
            <div className="w-full flex items-center justify-between gap-4 mb-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-white/5 border-white/10 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        <Wand2 size={16} />
                    </div>
                    <div>
                        <h4 className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                            {type} diagram
                        </h4>
                        <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
                            Live preview
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleZoomOut}
                        className={`p-2 rounded-lg border transition-colors ${isDarkMode ? 'border-white/10 text-zinc-400 hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        title="Zoom out"
                        aria-label="Zoom out"
                    >
                        <ZoomOut size={14} />
                    </button>
                    <button
                        onClick={handleZoomIn}
                        className={`p-2 rounded-lg border transition-colors ${isDarkMode ? 'border-white/10 text-zinc-400 hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        title="Zoom in"
                        aria-label="Zoom in"
                    >
                        <ZoomIn size={14} />
                    </button>
                    <button
                        onClick={fitDiagram}
                        className={`p-2 rounded-lg border transition-colors ${isDarkMode ? 'border-white/10 text-zinc-400 hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        title="Reset zoom"
                    >
                        <RotateCcw size={14} />
                    </button>
                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className={`p-2 rounded-lg border transition-colors ${isDarkMode ? 'border-white/10 text-zinc-300 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        title={isFullScreen ? 'Exit full screen' : 'Expand'}
                    >
                        {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    </button>
                </div>
            </div>

            <div className={`relative flex-1 overflow-hidden rounded-2xl border ${
                isDarkMode ? 'border-white/10 bg-[#0b0d10]' : 'border-slate-200 bg-white'
            } ${isFullScreen ? 'min-h-[70vh]' : 'min-h-[420px]'}`}>
                {isRendering && (
                    <div className={`absolute inset-0 z-10 flex items-center justify-center ${isDarkMode ? 'bg-[#0b0d10]/70' : 'bg-white/70'}`}>
                        <div className={`text-[10px] uppercase tracking-[0.2em] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                            Rendering
                        </div>
                    </div>
                )}

                <div
                    ref={wrapperRef}
                    className={`relative h-full w-full overflow-hidden ${isDarkMode ? 'bg-[#0b0d10]' : 'bg-slate-50'}`}
                    onWheel={handleWheel}
                >
                    <motion.div
                        drag
                        dragMomentum={false}
                        className="absolute inset-0 flex cursor-grab items-start justify-start p-10 active:cursor-grabbing"
                        style={{ scale, transformOrigin: '0 0' }}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale }}
                    >
                        <div ref={containerRef} className="mermaid-render-container block max-w-full" />
                    </motion.div>
                </div>

                {error && (
                    <div className={`absolute inset-0 overflow-auto p-6 ${isDarkMode ? 'bg-[#0b0d10]/94' : 'bg-white/94'}`}>
                        <div className="mx-auto max-w-3xl">
                            <p className={`text-sm ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>{error}</p>
                            {errorDetail && (
                                <p className={`mt-2 text-xs ${isDarkMode ? 'text-rose-300' : 'text-rose-700'}`}>{errorDetail}</p>
                            )}
                            {normalizedPreview && (
                                <div className={`mt-4 rounded-xl border p-4 text-left ${isDarkMode ? 'border-white/10 bg-black/30' : 'border-slate-200 bg-slate-50'}`}>
                                    <div className={`mb-2 text-[10px] uppercase tracking-[0.18em] ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
                                        Normalized Mermaid
                                    </div>
                                    <pre className={`overflow-auto whitespace-pre-wrap break-words text-xs leading-6 ${isDarkMode ? 'text-zinc-200' : 'text-slate-700'}`}>
                                        {normalizedPreview}
                                    </pre>
                                </div>
                            )}
                            {onFix && (
                                <button
                                    onClick={() => onFix(type, code)}
                                    className={`mt-4 rounded-lg px-4 py-2 text-[10px] uppercase tracking-[0.14em] border transition-colors ${isDarkMode ? 'border-white/10 text-zinc-200 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                >
                                    Retry
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-3 flex items-center justify-between">
                <div className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                    Drag to pan. Ctrl + wheel to zoom.
                </div>
                <button
                    onClick={handleDownload}
                    className={`text-[10px] uppercase tracking-[0.14em] ${isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-400 hover:text-slate-700'}`}
                >
                    Export SVG
                </button>
            </div>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full p-4 sm:p-5 flex flex-col rounded-2xl border overflow-hidden ${
                isDarkMode 
                    ? 'bg-black border-white/8' 
                    : 'bg-white border-slate-200'
            }`}
        >
            {WidgetContent}
        </motion.div>
    );
};
