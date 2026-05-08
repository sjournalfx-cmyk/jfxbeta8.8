import { describe, expect, it } from 'vitest';

import { buildMermaidCandidates } from './AIWidgets';

describe('buildMermaidCandidates', () => {
  it('preserves valid flowchart node syntax without bracket rewriting', () => {
    const [candidate] = buildMermaidCandidates('graph TD\nA[Start] --> C[Check Risk]', 'FLOWCHART');

    expect(candidate).toContain('C[Check Risk]');
    expect(candidate).not.toContain('{Check Risk');
  });

  it('extracts fenced mermaid blocks from chat output', () => {
    const candidates = buildMermaidCandidates(
      "Here's your diagram:\n```mermaid\ngraph TD\nA[Plan] --> B[Execute]\n```\nUse it before London open.",
      'FLOWCHART'
    );

    expect(candidates[0]).toBe('graph TD\nA[Plan] --> B[Execute]');
  });

  it('adds a directive when the widget metadata provides the diagram type', () => {
    const candidates = buildMermaidCandidates('A[Entry] --> B[Stop Loss]', 'FLOWCHART');

    expect(candidates).toContain('graph TD\nA[Entry] --> B[Stop Loss]');
  });

  it('removes leaked widget wrappers and escaped newlines', () => {
    const candidates = buildMermaidCandidates(
      '[WIDGET:MERMAID:FLOWCHART]graph TD\\nA[Bias] --> B[Setup][/WIDGET:MERMAID]',
      'FLOWCHART'
    );

    expect(candidates[0]).toBe('graph TD\nA[Bias] --> B[Setup]');
  });

  it('strips leaked syntax banners and version text before rendering', () => {
    const candidates = buildMermaidCandidates(
      'Syntax error in text\nmermaid version 10.9.5\ngraph TD\nA[Start] --> B[Execute]',
      'FLOWCHART'
    );

    expect(candidates[0]).toBe('graph TD\nA[Start] --> B[Execute]');
  });

  it('removes standalone prose lines that break mermaid parsing', () => {
    const candidates = buildMermaidCandidates(
      'sequenceDiagram\nTrade Idea Workflow\nparticipant Trader\nTrader->>AnalysisTool: Generate market hypothesis',
      'SEQUENCE'
    );

    expect(candidates).toContain('sequenceDiagram\nparticipant Trader\nTrader->>AnalysisTool: Generate market hypothesis');
  });

  it('drops flowchart title prose lines even when they contain punctuation', () => {
    const candidates = buildMermaidCandidates(
      'graph TD\nTrade Idea: London Session (A+ Setup)\nA[Bias] --> B[Trigger]',
      'FLOWCHART'
    );

    expect(candidates).toContain('graph TD\nA[Bias] --> B[Trigger]');
  });

  it('preserves gantt task rows while removing non-mermaid headings', () => {
    const candidates = buildMermaidCandidates(
      'gantt\nScaling Roadmap: Q2\nsection Phase 1\nBase Risk (1R) :a1, 2024-01-01, 30d',
      'GANTT'
    );

    expect(candidates).toContain('gantt\nsection Phase 1\nBase Risk (1R) :a1, 2024-01-01, 30d');
  });

  it('normalizes inline gantt directives into valid multiline mermaid', () => {
    const candidates = buildMermaidCandidates(
      'gantt title 5-Day Scaling Plan dateFormat YYYY-MM-DD axisFormat %d %b\nsection Day 1 - Review\nAnalyze last 30 trades :a1, 2026-05-06, 1d',
      'GANTT'
    );

    expect(candidates).toContain(
      'gantt\ntitle 5-Day Scaling Plan\ndateFormat YYYY-MM-DD\naxisFormat %d %b\n\nsection Day 1 - Review\nAnalyze last 30 trades :a1, 2026-05-06, 1d'
    );
  });

  it('translates legacy flowchart.js syntax into Mermaid flowchart syntax', () => {
    const candidates = buildMermaidCandidates(
      'st=>start: Start Trading\nop1=>operation: Analyze Session\ncond1=>condition: London or New York?\ne=>end: Stop\nst->op1->cond1\ncond1(yes)->e\ncond1(no)->op1',
      'FLOWCHART'
    );

    expect(candidates).toContain(
      'graph TD\nst([Start Trading])\nop1[Analyze Session]\ncond1{London or New York?}\ne([Stop])\nst --> op1\nop1 --> cond1\ncond1 -->|yes| e\ncond1 -->|no| op1'
    );
  });

  it('sanitizes punctuation-heavy flowchart edge labels that Mermaid rejects', () => {
    const candidates = buildMermaidCandidates(
      'graph TD\nA[Session Scan] -->|London (best PnL)| B[Proceed]',
      'FLOWCHART'
    );

    expect(candidates).toContain('graph TD\nA[Session Scan] -->|London best PnL| B[Proceed]');
  });

  it('sanitizes parentheses inside flowchart node labels that Mermaid rejects', () => {
    const candidates = buildMermaidCandidates(
      'graph TD\nA[Apply Risk per Trade (set % of balance)] --> B[Proceed]',
      'FLOWCHART'
    );

    expect(candidates).toContain('graph TD\nA[Apply Risk per Trade set % of balance] --> B[Proceed]');
  });
});
