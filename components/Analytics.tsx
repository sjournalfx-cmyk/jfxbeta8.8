import React, { useMemo, useState, useEffect } from 'react';
import { Trade, UserProfile, EASession, CashTransaction } from '../types';
import {
    TrendingUp, Info, Activity,
    Target, LineChart, Shield, X, Printer, Gauge, Zap, TrendingDown, LayoutDashboard, LayoutGrid, Coins, AlertTriangle, Lightbulb, CircleCheck
} from 'lucide-react';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';

import { PLByMindsetWidget } from './analytics/PLByMindsetWidget';

import { PerformanceBySession } from './analytics/PerformanceBySession';
import { ReportView } from './analytics/ReportView';
import { PerformanceByPairWidget } from './analytics/PerformanceByPairWidget';
import { CurrencyStrengthMeter } from './analytics/CurrencyStrengthMeter';
import { PairDistributionTreemapWidget } from './analytics/PairDistributionTreemapWidget';
import { EquityCurveWidget } from './analytics/EquityCurveWidget';
import { LargestWinLossWidget } from './analytics/LargestWinLossWidget';
import { MomentumStreakWidget } from './analytics/MomentumStreakWidget';
import { SymbolPerformanceWidget } from './analytics/SymbolPerformanceWidget';
import { DrawdownOverTimeWidget } from './analytics/DrawdownOverTimeWidget';
import { StrategyPerformancePieChart } from './analytics/StrategyPerformancePieChart';
import { TradingMistakesBarChartWidget } from './analytics/TradingMistakesBarChartWidget';
import { OutcomeDistributionWidget } from './analytics/OutcomeDistributionWidget';
import { RobustnessLab } from './analytics/RobustnessLab';
import { PerformanceMatrixWidget } from './analytics/PerformanceMatrixWidget';
import { ComparisonView } from './analytics/ComparisonView';
import { TradeGradeDistributionWidget } from './analytics/TradeGradeDistributionWidget';
import { PsychologicalSlipWidget } from './analytics/PsychologicalSlipWidget';
import { TimeAnalysisMatrixWidget } from './analytics/TimeAnalysisMatrixWidget';
import { DetailedStatistics } from './analytics/DetailedStatistics';
import { PLByPlanAdherenceWidget } from './analytics/PLByPlanAdherenceWidget';
import { CashTransactionsView } from './analytics/CashTransactionsView';
import { APP_CONSTANTS, normalizePlan } from '../lib/constants';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableWidget } from './ui/SortableWidget';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { calculateStats } from '../lib/statsUtils';
import { getCompletedTrades, sortTradesChronologically } from '../lib/analyticsUtils';

const safePnL = (value: unknown): number => {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : 0;
};

type BarChartPoint = {
    label: string;
    value: number;
};

const MINDSETS = ['Confident', 'Neutral', 'Hesitant', 'Anxious', 'FOMO'];

function DonutChart({ value }: { value: number }) {
    const radius = 55;
    const circumference = 2 * Math.PI * radius;
    const arcRatio = 0.75; 
    const arcLength = circumference * arcRatio;
    const gapLength = circumference - arcLength;

    const progressLength = (value / 100) * arcLength;
    const progressGap = circumference - progressLength;

    return (
        <div className="relative flex justify-center items-center w-full">
            <svg className="h-[220px] w-[220px]" viewBox="0 0 140 140" aria-hidden="true">
                <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="#171717"
                    strokeWidth="16"
                    fill="transparent"
                    strokeDasharray={`${arcLength} ${gapLength}`}
                    strokeLinecap="butt"
                    transform="rotate(135 70 70)"
                />
                <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="#2563eb"
                    strokeWidth="16"
                    fill="transparent"
                    strokeDasharray={`${progressLength} ${progressGap}`}
                    strokeLinecap="butt"
                    transform="rotate(135 70 70)"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-[38%]">
                <div className="flex items-end justify-center gap-1 leading-none">
                    <span className="text-[46px] font-bold text-[#2563eb]">{value}</span>
                    <span className="pb-1 text-[20px] font-semibold text-[#cbd5e1]">/100</span>
                </div>
                <div className="mt-2 text-[13px] font-semibold text-[#cbd5e1]">
                    {value >= 90 ? 'Excellent' : value >= 75 ? 'Good' : value >= 60 ? 'Developing' : 'Needs Work'}
                </div>
            </div>
        </div>
);
};

interface AnalyticsProps {
  isDarkMode: boolean;
  trades: Trade[];
  userProfile: UserProfile;
  onViewChange: (view: string) => void;
  eaSession?: EASession | null;
  cashTransactions?: CashTransaction[];
}

const Analytics: React.FC<AnalyticsProps> = ({ isDarkMode, trades: rawTrades = [], userProfile, eaSession, cashTransactions = [] }) => {
    const trades = useMemo(() => {
        return sortTradesChronologically(rawTrades);
    }, [rawTrades]);

    const completedTrades = useMemo(() => getCompletedTrades(trades), [trades]);

    const [activeInfo, setActiveInfo] = useState<{ title: string, content: string } | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [scoreToggled, setScoreToggled] = useState(false);
    
    const currencySymbol = userProfile?.currencySymbol || '$';

    const [allWidgetsOrder, setAllWidgetsOrder] = useLocalStorage('analytics_bento_order', [
      'winRate', 'profitFactor', 'grossProfit', 'grossLoss',
      'equityCurve', 'drawdown',
      'streakMomentum', 'symbolPerformance', 'largestWinLoss', 'currencyStrength', 'matrix', 'tradeExit',
      'outcomeDist', 'tiltScore', 'riskReward', 'plMindset', 'plAdherence', 'tradeGrade', 'psychSlip', 'timeMatrix'
    ]);

    const reportWidgets = useMemo(() => {
        return Array.from(new Set([
            ...allWidgetsOrder,
            'timeAnalysis',
            'performanceMatrix',
            'perfByPair',
            'strategyPerf',
            'executionTable'
        ]));
    }, [allWidgetsOrder]);

    const stats = useMemo(() => {
        return calculateStats(trades);
    }, [trades]);

    const effectiveInitialBalance = useMemo(() => {
        const currentPlan = normalizePlan(userProfile.plan);
        const isPro = currentPlan === APP_CONSTANTS.PLANS.HOBBY;
        const isPremium = currentPlan === APP_CONSTANTS.PLANS.STANDARD;
        if ((isPro || isPremium) && eaSession?.data?.account?.balance !== undefined) {
             const totalPnL = completedTrades.reduce((acc, t) => acc + safePnL(t.pnl), 0);
             return eaSession.data.account.balance - totalPnL;
        }
        return userProfile?.initialBalance || 0;
    }, [userProfile, eaSession, completedTrades]);

    const equityData = useMemo(() => {
        const safeTrades = completedTrades;
        let cumulative = effectiveInitialBalance;
        const data = [cumulative];
        safeTrades.forEach(t => {
            cumulative += safePnL(t.pnl);
            data.push(cumulative);
        });
        return data;
    }, [completedTrades, effectiveInitialBalance]);

    const psychologySummary = useMemo(() => {
        const planBuckets: Record<'Followed Exactly' | 'Minor Deviation' | 'Major Deviation' | 'No Plan', { wins: number; total: number; pnl: number }> = {
            'Followed Exactly': { wins: 0, total: 0, pnl: 0 },
            'Minor Deviation': { wins: 0, total: 0, pnl: 0 },
            'Major Deviation': { wins: 0, total: 0, pnl: 0 },
            'No Plan': { wins: 0, total: 0, pnl: 0 },
        };

        const mindsetBuckets: Record<string, { total: number; pnl: number }> = {};
        completedTrades.forEach((trade) => {
            const adherence = trade.planAdherence || 'No Plan';
            const pnl = safePnL(trade.pnl);
            planBuckets[adherence].total += 1;
            planBuckets[adherence].pnl += pnl;
            if (pnl > 0) {
                planBuckets[adherence].wins += 1;
            }

            const mindset = trade.mindset || 'Neutral';
            if (!mindsetBuckets[mindset]) {
                mindsetBuckets[mindset] = { total: 0, pnl: 0 };
            }
            mindsetBuckets[mindset].total += 1;
            mindsetBuckets[mindset].pnl += pnl;
        });

        const followed = planBuckets['Followed Exactly'];
        const major = planBuckets['Major Deviation'];
        const revengePnl = major.total > 0 ? Math.abs(major.pnl / major.total) : 0;
        const followedWinRate = followed.total > 0 ? (followed.wins / followed.total) * 100 : 0;
        const allOtherBuckets = ['Minor Deviation', 'Major Deviation', 'No Plan'] as const;
        const offPlanTrades = allOtherBuckets.reduce((sum, key) => sum + planBuckets[key].total, 0);
        const offPlanWins = allOtherBuckets.reduce((sum, key) => sum + planBuckets[key].wins, 0);
        const offPlanWinRate = offPlanTrades > 0 ? (offPlanWins / offPlanTrades) * 100 : 0;
        const adherenceLift = followed.total > 0 ? followedWinRate - offPlanWinRate : 0;

        const confidentAvg = mindsetBuckets.Confident?.total ? mindsetBuckets.Confident.pnl / mindsetBuckets.Confident.total : 0;
        const fomoAvg = mindsetBuckets.FOMO?.total ? mindsetBuckets.FOMO.pnl / mindsetBuckets.FOMO.total : 0;
        const fomoCost = mindsetBuckets.FOMO?.total ? confidentAvg - fomoAvg : 0;

        return {
            revengePnl: Math.round(revengePnl * 100) / 100,
            adherenceLift: Math.round(adherenceLift * 100) / 100,
            fomoCost: Math.round(fomoCost * 1000) / 1000,
        };
    }, [completedTrades]);

    const disciplineScore = useMemo(() => {
        if (!completedTrades.length) return 78;

        const score = completedTrades.reduce((total, trade) => {
            switch (trade.planAdherence) {
                case 'Followed Exactly':
                    return total + 100;
                case 'Minor Deviation':
                    return total + 78;
                case 'Major Deviation':
                    return total + 30;
                case 'No Plan':
                    return total + 10;
                default:
                    return total + 55;
            }
        }, 0) / completedTrades.length;

        return Math.round(score);
    }, [completedTrades]);

    const mindsetChartPoints = useMemo<BarChartPoint[]>(() => {
        const labels = MINDSETS;
        return labels.map((label) => ({
            label,
            value: Math.round(
                completedTrades
                    .filter((trade) => (trade.mindset || 'Neutral') === label)
                    .reduce((sum, trade) => sum + safePnL(trade.pnl), 0) * 100
            ) / 100,
        }));
    }, [completedTrades]);

    const radarData = useMemo(() => {
        const avgPnLByMindset = MINDSETS.map((mindset) => {
            const tradesWithMindset = completedTrades.filter((trade) => (trade.mindset || 'Neutral') === mindset);
            const totalPnL = tradesWithMindset.reduce((sum, trade) => sum + safePnL(trade.pnl), 0);
            const count = tradesWithMindset.length;
            return count > 0 ? totalPnL / count : 0;
        });

        const max = Math.max(...avgPnLByMindset.map(Math.abs), 1);
        const normalized = avgPnLByMindset.map((v) => Math.round((v / max) * 40));

        const colors = ['#7ae2b1', '#c0c5cc', '#c0c5cc', '#c0c5cc', '#c0c5cc'];

        return MINDSETS.map((name, i) => ({
            name,
            pl: normalized[i],
            fill: colors[i],
        }));
    }, [completedTrades]);

    const planAdherenceChartPoints = useMemo<BarChartPoint[]>(() => {
        const buckets = [
            { label: 'Followed Plan', key: 'Followed Exactly' },
            { label: 'Minor Deviation', key: 'Minor Deviation' },
            { label: 'Major Deviation', key: 'Major Deviation' },
            { label: 'No Plan', key: 'No Plan' },
        ] as const;

        return buckets.map((bucket) => ({
            label: bucket.label,
            value: Math.round(
                completedTrades
                    .filter((trade) => (trade.planAdherence || 'No Plan') === bucket.key)
                    .reduce((sum, trade) => sum + safePnL(trade.pnl), 0) * 100
            ) / 100,
        }));
    }, [completedTrades]);

const renderPsychologyLayout = () => (
        <div className="space-y-6 pb-20">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,2.05fr)]">
                <section className="flex min-h-[380px] flex-col rounded-[20px] border border-[#1f1f1f] bg-[#000000] px-7 py-7 shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[18px] font-bold text-white">{scoreToggled ? 'Performance Radar' : 'Tilt Score'}</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[15px] font-medium text-[#cbd5e1]">{scoreToggled ? 'Radar' : 'Score'}</span>
                            <button
                                onClick={() => setScoreToggled(!scoreToggled)}
                                className={`relative h-[26px] w-[48px] rounded-full transition-colors ${scoreToggled ? 'bg-[#2563eb]' : 'bg-[#1f2937]'}`}
                                aria-label="Toggle tilt score display"
                            >
                                <span
                                    className={`absolute top-[3px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-transform ${scoreToggled ? 'translate-x-[24px]' : 'translate-x-[3px]'}`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-center gap-5 pt-3">
                        {scoreToggled ? (
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 13 }} />
                                        <PolarRadiusAxis
                                            angle={90}
                                            domain={[-20, 40]}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            tickCount={7}
                                        />
                                        <Radar name="Performance" dataKey="pl" stroke="#4f46e5" strokeWidth={2} fill="#4f46e5" fillOpacity={0.15} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <>
                                <DonutChart value={disciplineScore} />
                                <p className="max-w-[340px] text-center text-[14px] leading-7 text-[#cbd5e1]">
                                    {disciplineScore >= 90
                                        ? 'Your rule-following is strong. Keep protecting that consistency.'
                                        : disciplineScore >= 75
                                            ? 'Your discipline is developing well. Focus on maintaining consistency in your trading approach.'
                                            : disciplineScore >= 60
                                                ? 'Your discipline is improving, but emotional execution is still leaking returns.'
                                                : 'Your discipline is inconsistent. Tighten your process before adding size.'}
                                </p>
                            </>
                        )}
                    </div>
                </section>

                <section className="flex min-h-[380px] flex-col rounded-[20px] border border-[#1f1f1f] bg-[#000000] px-7 py-7 shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                    <h2 className="mb-6 text-[18px] font-bold text-white">Key Insights & Warnings</h2>

                    <div className="space-y-5">
                        <div className="flex gap-4 rounded-[10px] border-l-[5px] border-[#ef4444] bg-[#080808] px-5 py-5">
                            <AlertTriangle className="mt-[2px] h-[18px] w-[18px] flex-shrink-0 text-[#ef4444]" strokeWidth={2.4} />
                            <div>
                                <h3 className="mb-2 text-[16px] font-medium text-white">Revenge Trading Pattern Detected</h3>
                                <p className="text-[15px] leading-7 text-[#cbd5e1]">
                                    You have a tendency to enter larger trades immediately after a loss, leading to an average of <span className="font-medium text-[#ff5a5a]">{currencySymbol}{psychologySummary.revengePnl.toFixed(2)} per revenge trade</span>. Consider taking a break after a losing trade.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 rounded-[10px] border-l-[5px] border-[#eab308] bg-[#080808] px-5 py-5">
                            <Lightbulb className="mt-[2px] h-[18px] w-[18px] flex-shrink-0 text-[#eab308]" strokeWidth={2.4} />
                            <div>
                                <h3 className="mb-2 text-[16px] font-medium text-white">Cost of FOMO</h3>
                                <p className="text-[15px] leading-7 text-[#cbd5e1]">
                                    Trades marked with 'FOMO' mindset underperform by <span className="font-medium text-[#f59e0b]">{psychologySummary.fomoCost.toFixed(3)}%</span> compared to trades where you felt 'Confident'. Sticking to your setup criteria is crucial.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 rounded-[10px] border-l-[5px] border-[#22c55e] bg-[#080808] px-5 py-5">
                            <CircleCheck className="mt-[2px] h-[18px] w-[18px] flex-shrink-0 text-[#22c55e]" strokeWidth={2.4} />
                            <div>
                                <h3 className="mb-2 text-[16px] font-medium text-white">Plan Adherence Pays Off</h3>
                                <p className="text-[15px] leading-7 text-[#cbd5e1]">
                                    When you follow your plan exactly, your win rate increases by <span className="font-medium text-[#16a34a]">{psychologySummary.adherenceLift.toFixed(2)}%</span>. Your discipline is directly correlated with profitability.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                {/* P/L by Mindset */}
                <PLByMindsetWidget trades={completedTrades} isDarkMode={isDarkMode} currencySymbol={currencySymbol} />

                {/* P/L by Plan Adherence */}
                <PLByPlanAdherenceWidget trades={completedTrades} isDarkMode={isDarkMode} currencySymbol={currencySymbol} />
            </div>
        </div>
    );

    const renderWidget = (id: string) => {
        switch (id) {
            case 'winRate': return <div className={`h-full p-6 rounded-[24px] border flex flex-col justify-between ${isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-slate-200 shadow-md'}`}><span className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2"><Target size={14} className="text-indigo-500" /> Win Rate</span><div className="text-2xl font-black">{Number(stats.winRate).toFixed(1)}%</div></div>;
            case 'profitFactor': return <div className={`h-full p-6 rounded-[24px] border flex flex-col justify-between ${isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-slate-200 shadow-md'}`}><span className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2"><Gauge size={14} className="text-indigo-500" /> Profit Factor</span><div className="text-2xl font-black">{Number(stats.profitFactor).toFixed(1)}</div></div>;
            case 'grossProfit': return <div className={`h-full p-6 rounded-[24px] border flex flex-col justify-between ${isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-slate-200 shadow-md'}`}><span className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2"><TrendingUp size={14} className="text-emerald-500" /> Gross Profit</span><div className="text-2xl font-black text-emerald-500">+{currencySymbol}{stats.grossProfit.toLocaleString()}</div></div>;
            case 'grossLoss': return <div className={`h-full p-6 rounded-[24px] border flex flex-col justify-between ${isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-slate-200 shadow-md'}`}><span className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2"><TrendingDown size={14} className="text-rose-500" /> Gross Loss</span><div className="text-2xl font-black text-rose-500">-{currencySymbol}{stats.grossLoss.toLocaleString()}</div></div>;
            case 'equityCurve': return <EquityCurveWidget trades={completedTrades} equityData={equityData} isDarkMode={isDarkMode} currencySymbol={currencySymbol} />;
            case 'drawdown': return <DrawdownOverTimeWidget trades={completedTrades} isDarkMode={isDarkMode} userProfile={userProfile} startingBalance={effectiveInitialBalance} />;
            case 'streakMomentum': return <MomentumStreakWidget trades={completedTrades} isDarkMode={isDarkMode} />;
            case 'symbolPerformance': return <SymbolPerformanceWidget trades={completedTrades} isDarkMode={isDarkMode} currencySymbol={currencySymbol} />;
            case 'largestWinLoss': return <LargestWinLossWidget trades={completedTrades} isDarkMode={isDarkMode} currencySymbol={currencySymbol} />;
            case 'currencyStrength': return <CurrencyStrengthMeter isDarkMode={isDarkMode} trades={completedTrades} />;
            case 'outcomeDist': return <OutcomeDistributionWidget trades={completedTrades} isDarkMode={isDarkMode} />;
            case 'tiltScore': return null;
            case 'riskReward': return <div className={`h-full p-8 rounded-[32px] border ${isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-slate-200 shadow-md'}`}><h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Activity size={20} className="text-indigo-500" /> Risk/Reward</h3><div className="space-y-6"><div className="flex justify-between items-end"><span className="text-sm opacity-60">Avg Win</span><span className="text-xl font-black text-emerald-500">{currencySymbol}{Math.round(stats.avgWin).toLocaleString()}</span></div><div className="flex justify-between items-end"><span className="text-sm opacity-60">Avg Loss</span><span className="text-xl font-black text-rose-500">{currencySymbol}{Math.round(stats.avgLoss).toLocaleString()}</span></div></div></div>;
            case 'plMindset': return null;
            case 'plAdherence': return null;
            case 'matrix': return <PerformanceMatrixWidget trades={completedTrades} isDarkMode={isDarkMode} currencySymbol={currencySymbol} />;
            case 'tradeGrade': return <TradeGradeDistributionWidget trades={completedTrades} isDarkMode={isDarkMode} />;
            case 'psychSlip': return <PsychologicalSlipWidget trades={completedTrades} isDarkMode={isDarkMode} currencySymbol={currencySymbol} />;
            case 'timeMatrix': return <TimeAnalysisMatrixWidget trades={completedTrades} isDarkMode={isDarkMode} currencySymbol={currencySymbol} />;
            default: return null;
        }
    };

    const getColSpan = (id: string) => {
        switch (id) {
            case 'equityCurve': return 'col-span-12 lg:col-span-8';
            case 'drawdown': return 'col-span-12 lg:col-span-4';
            case 'winRate': case 'profitFactor': case 'grossProfit': case 'grossLoss': return 'col-span-12 sm:col-span-6 lg:col-span-3';
            case 'riskReward': case 'tradeGrade': return 'col-span-12 md:col-span-6 lg:col-span-4';
            case 'matrix': case 'psychSlip': case 'timeMatrix': return 'col-span-12';
            default: return 'col-span-12 md:col-span-6 lg:col-span-4';
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;
        setAllWidgetsOrder((items) => {
            const oldIndex = items.indexOf(String(active.id));
            const newIndex = items.indexOf(String(over.id));
            return arrayMove(items, oldIndex, newIndex);
        });
    };

    const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'psychology' | 'advanced' | 'comparison' | 'cash' | 'reports' | 'session'>('overview');

    const tabDefinitions = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'trades', label: 'Trade Analysis', icon: LineChart },
        { id: 'psychology', label: 'Psychology', icon: Target },
        { id: 'session', label: 'Session', icon: Zap },
        { id: 'advanced', label: 'Advanced', icon: Gauge },
        { id: 'comparison', label: 'Reports', icon: Activity },
        { id: 'reports', label: 'Comparison', icon: Shield },
        { id: 'cash', label: 'Transactions', icon: Coins }
    ];

    const widgetCategories = {
        overview: ['winRate', 'profitFactor', 'grossProfit', 'grossLoss', 'equityCurve', 'drawdown', 'currencyStrength', 'riskReward', 'tradeGrade'],
        trades: ['symbolPerformance', 'largestWinLoss', 'outcomeDist'],
        psychology: ['psychSlip', 'streakMomentum', 'tiltScore', 'plMindset', 'plAdherence'],
        advanced: []
    };

    const renderCategoryWidgets = (category: string) => {
        const widgetIds = widgetCategories[category as keyof typeof widgetCategories] || [];
        return (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20 auto-rows-min">
                        {widgetIds.map(id => (
                            <SortableWidget key={id} id={id} className={getColSpan(id)}>
                                {renderWidget(id)}
                            </SortableWidget>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        );
    };

    const renderOverviewLayout = () => (
        <div className="space-y-6 pb-20">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {['winRate', 'profitFactor', 'grossProfit', 'grossLoss'].map((id) => (
                    <div key={id} className="min-h-[90px]">
                        {renderWidget(id)}
                    </div>
                ))}
                <div className="min-h-[90px]">
                    <div className={`h-full p-5 rounded-[20px] border flex flex-col justify-between ${isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-slate-200 shadow-md'}`}>
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-1.5"><TrendingUp size={12} className="text-emerald-500" /> Total P&L</span>
                        <div className="text-xl font-black text-emerald-500">{currencySymbol}{stats.netProfit.toLocaleString()}</div>
                    </div>
                </div>
                <div className="min-h-[90px]">
                    <div className={`h-full p-5 rounded-[20px] border flex flex-col justify-between ${isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-slate-200 shadow-md'}`}>
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-1.5"><Activity size={12} className="text-indigo-500" /> Risk/Reward</span>
                        <div className="text-xl font-black">{stats.avgWin > 0 && stats.avgLoss < 0 ? (Math.abs(stats.avgWin) / Math.abs(stats.avgLoss)).toFixed(2) : '0.00'}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="min-h-[120px]">
                    <MomentumStreakWidget trades={completedTrades} isDarkMode={isDarkMode} />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-3 min-h-[340px]">
                    {renderWidget('equityCurve')}
                </div>
                <div className="xl:col-span-2 min-h-[340px]">
                    {renderWidget('drawdown')}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="min-h-[220px]">
                    {renderWidget('currencyStrength')}
                </div>
                <div className="min-h-[220px]">
                    {renderWidget('tradeGrade')}
                </div>
            </div>
        </div>
    );

    const pageIsLight = !isDarkMode && activeTab !== 'psychology';
    const pageBackgroundClass = activeTab === 'psychology'
        ? 'bg-[#000000] text-zinc-200'
        : pageIsLight
            ? 'bg-[#F8FAFC] text-slate-900'
            : 'bg-[#050505] text-zinc-200';

    return (
        <div className={`w-full h-full overflow-y-auto custom-scrollbar p-6 lg:p-10 font-sans ${pageBackgroundClass}`}>
            <header className="mb-8 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-3xl font-black tracking-tight mb-2 ${pageIsLight ? 'text-slate-950' : 'text-zinc-100'}`}>Performance Analytics</h1>
                    </div>
                </div>
                <div className={`flex gap-1 p-1.5 rounded-xl border overflow-x-auto ${pageIsLight ? 'bg-slate-100 border-slate-200' : 'bg-[#111] border-zinc-800'}`}>
                    {tabDefinitions.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id 
                                ? (pageIsLight ? 'bg-white text-black shadow-sm' : 'bg-zinc-800 text-white shadow-lg') 
                                : (pageIsLight ? 'text-slate-500 hover:text-slate-700' : 'text-zinc-500 hover:text-zinc-300')}`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {activeTab === 'overview' && renderOverviewLayout()}
            
            {activeTab === 'trades' && (
                <div className="space-y-6 pb-20">
                    <div className="grid grid-cols-1 gap-4">
                        <SymbolPerformanceWidget trades={completedTrades} isDarkMode={isDarkMode} currencySymbol={currencySymbol} />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <PairDistributionTreemapWidget trades={completedTrades} isDarkMode={isDarkMode} currencySymbol={currencySymbol} />
                    </div>
                </div>
            )}

            {activeTab === 'psychology' && renderPsychologyLayout()}

            {activeTab === 'advanced' && (
                <div className="space-y-6 pb-20">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="min-h-[280px]">
                            <StrategyPerformancePieChart trades={completedTrades} isDarkMode={isDarkMode} currencySymbol={currencySymbol} />
                        </div>
                        <div className="min-h-[280px]">
                            <TradingMistakesBarChartWidget trades={completedTrades} isDarkMode={isDarkMode} />
                        </div>
                    </div>
                    <div className="min-h-[320px]">
                        <PerformanceMatrixWidget trades={completedTrades} isDarkMode={isDarkMode} currencySymbol={currencySymbol} />
                    </div>
                </div>
            )}

            {activeTab === 'comparison' && (
                <div className="space-y-8 pb-20">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Detailed Performance Report</h2>
                        <button
                            disabled
                            aria-disabled="true"
                            onClick={(e) => e.preventDefault()}
                            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed opacity-50 ${isDarkMode ? 'bg-zinc-800 text-white' : 'bg-black text-white'}`}
                        >
                            <Printer size={18} />
                            Generate PDF Report
                        </button>
                    </div>

                    <DetailedStatistics
                        stats={stats}
                        userProfile={userProfile}
                        isDarkMode={isDarkMode}
                    />

                    <div className={isDarkMode ? 'opacity-50' : 'opacity-100'}>
                        <ReportView
                            trades={completedTrades}
                            isDarkMode={isDarkMode}
                            userProfile={userProfile}
                            monthStr={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                            selectedWidgets={reportWidgets}
                            equityData={equityData}
                            stats={stats}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'reports' && <ComparisonView trades={completedTrades} isDarkMode={isDarkMode} currencySymbol={currencySymbol} />}

            {activeTab === 'cash' && (
                <CashTransactionsView
                    isDarkMode={isDarkMode}
                    userProfile={userProfile}
                    cashTransactions={cashTransactions}
                />
            )}

            {activeTab === 'session' && (
                <div className="space-y-12 pb-20">
                    <PerformanceBySession
                        trades={completedTrades}
                        isDarkMode={isDarkMode}
                        currencySymbol={currencySymbol}
                    />

                    <TimeAnalysisMatrixWidget 
                        trades={completedTrades} 
                        isDarkMode={isDarkMode} 
                        currencySymbol={currencySymbol} 
                    />

                    <div className="flex justify-center pt-8 border-t border-zinc-500/10">
                        <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em] italic">
                            All times are calculated in SAST (Africa/Johannesburg)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
