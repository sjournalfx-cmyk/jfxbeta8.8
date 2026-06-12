import React from 'react';
import { ArrowRight, Wrench, Monitor, Clock, Zap, Mail, Bug } from 'lucide-react';

interface BetaSplashProps {
  onContinue: () => void;
}

const items = [
  { icon: Wrench, label: 'Active Development' },
  { icon: Monitor, label: 'Desktop Only' },
  { icon: Mail, label: 'Email Feedback' },
  { icon: Clock, label: 'Data May Change' },
  { icon: Bug, label: 'Report Bug' },
  { icon: Zap, label: 'Free During Beta' },
];

const ACCENT = 'text-teal-400';
const ACCENT_BG = 'bg-teal-500/20';

const BetaSplash: React.FC<BetaSplashProps> = ({ onContinue }) => {
  return (
    <div className="relative min-h-dvh w-full bg-[#000000] text-white flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/15 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[700px] h-[700px] bg-[#FF4F01]/8 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Beta Badge - Top Left */}
      <div className="fixed top-5 left-5 sm:top-6 sm:left-6 z-20 text-white/70 text-[14px] font-black uppercase tracking-[0.3em]">
        BETA
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8 py-14 flex flex-col items-center text-center animate-in fade-in duration-700">

        {/* Brand */}
        <h1 className="text-[56px] sm:text-[72px] font-black tracking-tight leading-[0.95] mb-7">
          JFX JOURNAL
        </h1>

        {/* Hero Message — one concise line */}
        <p className="text-[23px] sm:text-[28px] font-semibold text-zinc-100 max-w-3xl leading-snug mb-14">
          Your early feedback shapes what this tool becomes.
        </p>

        {/* Info Grid — 2-column grid, readable on small screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 mb-14">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 justify-center sm:justify-start"
              >
                <div className={`w-8 h-8 rounded-lg ${ACCENT_BG} flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={ACCENT} />
                </div>
                <span className="text-[14px] font-bold text-zinc-300 whitespace-nowrap">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <button
          onClick={onContinue}
          className="inline-flex items-center gap-3 px-12 py-5 bg-[#FF4F01] hover:bg-[#E64601] text-white rounded-2xl font-black text-[16px] shadow-xl shadow-[#FF4F01]/25 transition-all hover:scale-[1.03] hover:shadow-[#FF4F01]/40 active:scale-[0.97]"
        >
          Continue to App
          <ArrowRight size={24} />
        </button>

      </div>
    </div>
  );
};

export default BetaSplash;
