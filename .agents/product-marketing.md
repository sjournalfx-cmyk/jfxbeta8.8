# JournalFX — Product Marketing Context

*Last updated: 2026-06-03*

## 1. Product Overview
**One-liner:** A trading journal for forex traders who want to log every trade, sync from MetaTrader 5, and use analytics + psychology tracking to actually improve.

**What it does:** JournalFX lets forex traders record and review their trading activity with rich analytics (win rate, profit factor, drawdown, equity curve, symbol/session/time heatmaps), sync trades automatically from MT5 via a Desktop Bridge, capture psychology data (mindset, plan adherence, mistakes), and get AI-assisted trade and note workflows.

**Product category:** Forex trading journal / trading analytics SaaS. (How customers search: "forex trade journal," "MT5 journal," "trading psychology tracker," "trade analytics dashboard.")

**Product type:** B2C SaaS web app + desktop companion (Windows .exe bridge).

**Business model:** Freemium subscription, 3 tiers, dual currency (ZAR primary, USD secondary):
- **Free (R0 / $0)** — manual entry, 50 trades/mo, basic analytics
- **Pro (R149/mo / ~$8/mo)** — Desktop Bridge auto-sync, unlimited trades, advanced analytics, multi-device
- **Premium (R279/mo / ~$15/mo)** — Broker Connect VPS sync, AI insights, voice notes, headless MT5

## 2. Target Audience
**Target users:** Individual retail forex traders, MT5-primary. **Primary market: South Africa (ZAR pricing). Secondary: global English-speaking MT5 traders (USD display).**

**Decision-maker:** The trader themselves (solo buyer, no B2B buying committee).

**Primary use case:** A trader who already has a strategy but feels they can't tell if it's actually working — wants to log trades, see if they're profitable after costs, identify psychology leaks, and stop repeating mistakes.

**Jobs to be done:**
- "Help me know if my strategy is actually profitable, not just whether individual trades win."
- "Stop me from repeating the same emotional mistakes (FOMO, revenge trading, etc.)."
- "Log my trades automatically so I don't have to do it by hand after every session."

**Use cases (from current code/marketing):**
- Day trader (rapid entries, session-based review)
- Swing trader (multi-day holds, position management)
- Scalper (high-frequency, micro-analysis)
- Position trader (long-term, macro view)

## 3. Personas
Since this is B2C, capturing trader archetypes instead of buyer roles:

| Persona | Cares about | Challenge | Value we promise |
|---|---|---|---|
| Disciplined Improver | Real edge, not noise; rule adherence | "I follow rules but can't tell if I'm profitable after costs" | "Show me whether my edge is real, with data" |
| Psychology-First Trader | Mindset, tilt, revenge trading | "I blow up accounts emotionally even when I have a strategy" | "Track and visualize psychology leaks before they cost you" |
| Part-Time Quant | Numbers, stats, session/symbol analysis | "I trade 2 hours a day and don't know if my setup works" | "Auto-sync from MT5 + session/symbol/time heatmaps" |

*Note: Too early in beta to narrow to a single ICP. All three archetypes are valid beta targets.*

## 4. Problems & Pain Points
**Core problem:** Most retail forex traders don't know if they're actually profitable after spreads/commissions, and they keep repeating the same psychological mistakes. They try Excel, Notes apps, or no journal at all — and get no useful feedback.

**Why current solutions fall short:**
- **Spreadsheets:** Manual, error-prone, no analytics, no psychology, no MT5 sync
- **Notes apps (Notion, Evernote):** No trade-specific analytics, no chart integration, no sync
- **Other journals (TradeZella, Edgewonk, Tradervue):** Often expensive, MT4/MT5 sync is clunky, weak on psychology, US$-priced so expensive for SA market
- **Doing nothing:** "I'll remember" — but you don't, and patterns stay invisible

**What it costs them:**
- Money: bleeding accounts from repeated mistakes; paying $30–50/mo for non-SA-friendly journals
- Time: 10–30 min/day manually logging trades
- Opportunity: years spent "trading" without ever getting clarity on edge

**Emotional tension:** Shame from blowing accounts, frustration at not improving, imposter syndrome about whether the strategy works, fear that the problem is them and not the strategy.

## 5. Competitive Landscape
**Direct:** TradeZella, Edgewonk, Tradervue, Trademetria, FX Blue — same problem, similar web app model
- Fall short: often US$-priced (expensive for ZAR traders), MT5 sync is plugin/import-based not live, weak psychology tracking, no AI workflow, generic global UX not tuned for SA

**Secondary:** Spreadsheets, Notion templates, MyFXBook (more social/track-record than journal)
- Fall short: no guided workflow, no analytics, no sync, no psychology structure

**Indirect:** Not journaling at all, or relying on broker statements
- Falls short: zero feedback loop, can't see patterns

## 6. Differentiation
**Key differentiators (ordered by strength):**
1. **Psychology-first analytics** — Tilt Score, Psychological Slip, mindset-by-P&L, plan adherence as first-class widgets. No competitor uses these exact terms.
2. **MT5 Desktop Bridge** — live auto-sync from a local MT5 terminal (not CSV import, not manual entry)
3. **AI-assisted review** — Gemini + OpenAI embedded in trade and note workflows (e.g., "Review my last 10 trades and tell me what I'm doing wrong on EUR/USD")
4. **SA-localized pricing** — R149/R279 makes JournalFX 50–70% cheaper than TradeZella for SA users
5. **Time/symbol/session heatmaps** — built-in pattern detection, not a bolt-on chart

**How we do it differently:** Psychology is not an afterthought, sync is live (not import), pricing matches the buying power of the primary market, AI is embedded in the journal workflow.

**Why that's better:** Traders can act on real patterns, not guess. The journal tells them "your London breakout trades win 68% but your NY FOMO trades lose — and you take 4x more FOMO trades" — instead of just listing trades.

**Why customers choose us:** For SA MT5 traders specifically, no other tool combines live MT5 sync + rich psychology tracking + ZAR pricing in one place. For global traders, the psychology-first framing is a fresh angle in a sea of feature-listing competitors.

## 7. Objections & Anti-Personas
| Objection | Response |
|---|---|
| "I already use a spreadsheet / TradeZella" | "Spreadsheets don't show you psychological slip or session heatmaps. We sync from MT5 live so you stop manual entry. And we're priced in Rands, not dollars." |
| "Another journal won't fix my trading" | "Correct — journaling doesn't trade for you. But traders who review weekly improve 2x faster than those who don't. We make the review 5 minutes, not 30." |
| "Is my data safe?" | "Supabase-backed, encryption in transit and at rest, you can export everything as CSV/Excel anytime." |

**Anti-persona:**
- Stock/options/crypto-only traders (we're forex + MT5 focused)
- "Set and forget" signal-copy followers (no journaling mindset)
- HFT/algo traders (sub-second needs; this is for discretionary traders)
- Anyone looking for a broker, not a journal (we're not a broker)

## 8. Switching Dynamics (JTBD)
**Push:** Frustration with manual logging, no clarity on edge, US$ journals eating into P&L, weak psychology tracking in current tools.

**Pull:** Live MT5 sync, ZAR pricing, psychology heatmaps, AI-assisted review, modern UI, SA-aware positioning.

**Habit:** "I've been using Excel for 2 years, switching is effort"; "TradeZella is what I know"; "I don't have time to set up a new tool."

**Anxiety:** "What if my data gets lost in the move?" → Easy CSV export. "What if it doesn't work with my broker's MT5?" → MT5 is the protocol; most brokers work. "What if I pay and it dies?" → Free tier + 30-day refund policy (verify this exists).

## 9. Customer Language
**How they describe the problem (forex-trader vernacular):**
- "I keep blowing my account on revenge trades"
- "My win rate looks fine but my RR is trash"
- "I can't tell if my edge is real or if I'm just lucky this month"
- "Logging trades by hand every night is killing me"
- "I have a strategy but no way to actually measure it"
- "MT5 to journal workflow is painful"

**How they describe us (placeholder until we have real users):**
- "It's like TradeZella but built for SA traders and it actually syncs from MT5"

**Hero copy bank:**
- Primary: "The trading journal that catches what your broker statement can't."
- Alt 1: "Tilt score, psychological slip, mindset-by-P&L. Track what your broker can't see."
- Alt 2: "Built for MT5 traders who want to know if their edge is real."

**Words to use:** journal, log, review, edge, discipline, mindset, MT5, sync, session, RR (risk-reward), plan adherence, equity curve, drawdown, lot size, tilt, slip

**Words to avoid:** "guru," "secret strategy," "guaranteed," "passive income," "easy money" — forex niche is allergic to guru language and platform credibility is fragile

**Glossary:**
| Term | Meaning |
|---|---|
| MT5 | MetaTrader 5 — the dominant forex trading platform |
| R:R / RR | Risk-to-reward ratio (e.g., 1:2 = risking $1 to make $2) |
| P&L / PnL | Profit and loss |
| Session | London / NY / Asian / Overlap — global forex market hours |
| Edge | A trader's statistical advantage over random outcomes |
| Plan adherence | Did the trader follow their own rules on this trade? |
| Tilt | Emotional/imprecise trading after a loss |
| Lot | Standardized trade size unit in forex |
| Tilt Score | App's measure of emotional trading behavior over time |
| Psychological Slip | Repeated psychology failures visible across trades |

## 10. Brand Voice
**Tone:** Confident, calm, professional. Trader-to-trader, not coach-to-student. No hype, no "10x your account" energy.

**Style:** Direct, specific, evidence-led. Show numbers and screenshots, not adjectives.

**Personality:** Disciplined, transparent, slightly technical, SA-aware but global-ready.

## 11. Proof Points
**Metrics (current):** Pre-beta — no real user metrics yet. Target: ≥40% of beta testers log ≥20 trades in first 30 days; ≥25% refer at least 1 trader.

**Customers:** None yet (pre-beta).

**Testimonials:** Currently uses a placeholder ("Sarah Chen, Professional Trader, 8 years") in the landing page. **Action required:** Label clearly as a placeholder (e.g., "Sample testimonial — real tester quotes coming soon") or replace with a "Beta tester quotes coming soon" card once the cohort is active.

**Value themes:**
| Theme | Proof |
|---|---|
| Psychology-first analytics | Tilt Score, Psychological Slip, mindset-by-P&L, plan adherence all built in code |
| Live MT5 sync | Desktop Bridge .exe architecture exists; tech stack supports it |
| AI workflows | Gemini + OpenAI integration in code; "Review my last 10 trades" prompt in landing page |
| SA-localized pricing | R149/R279 tiers in code |
| Modern UX | Landing page uses advanced charts (heatmap, treemap, radar, equity curve) |

## 12. Goals
**Business goal:** Get 10–50 active beta testers in the next 30–60 days, validate that they sync trades from MT5 and review weekly, collect 5+ real testimonials for public launch.

**Conversion action:** "Request Beta Access" — **email + trading style (Day / Swing / Scalp / Position)** only. MT5 broker name captured later via in-product onboarding, not at signup (lower friction).

**Current metrics:** None yet (no analytics installed — flagged as required step before driving any acquisition traffic).
