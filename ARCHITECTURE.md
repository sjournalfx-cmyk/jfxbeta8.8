# JournalFX SaaS Architecture Documentation

## Date: April 30, 2026
## Purpose: Comprehensive technical documentation of JournalFX's architecture, tiers, and infrastructure

---

## Executive Summary

JournalFX is a SaaS trading journal application targeting South African forex traders. The application provides trade journaling, analytics, and MT4/MT5 synchronization. This document outlines the complete architecture including tier structure, infrastructure, and implementation strategy.

---

## Subscription Tiers

### Tier Overview

| Tier | Price | Target User | MT5 Connection | Infrastructure |
|------|-------|-------------|----------------|----------------|
| **Free** | R0 | Beginners, casual traders | None | Supabase only |
| **Pro** | R149/mo | Serious traders | Desktop Bridge (.exe) | User's own PC |
| **Premium** | R279/mo | Full-time traders | Broker Connect (VPS Backend) | Contabo VPS Pool |

---

### FREE TIER (R0/month)

**Purpose:** User acquisition and onboarding

**Features:**
- Manual trade journal entry
- 50 trades/month limit
- Basic analytics (win rate, P&L)
- Single device sync
- Basic charts and drawings

**Infrastructure Cost:** R0 (pure Supabase)
**Profit Model:** Convert to paid tiers via upsell

---

### PRO TIER (R149/month)

**Purpose:** Self-service auto-sync for users with their own infrastructure

**Features:**
- Desktop Bridge (downloaded .exe)
- Auto-sync trades every 1-3 seconds
- Unlimited trades
- Advanced analytics
- Multi-device sync
- Export to CSV/Excel
- Trade journal with emotions/sessions
- Setup tracking

**MT5 Connection Method:**
- User downloads Desktop Bridge .exe
- Runs on user's Windows PC
- Connects to local MT5 terminal
- Bridges to JournalFX frontend via WebSocket
- No browser tab required
- PC must be on for sync

**Infrastructure Cost:** R0 (user uses their own PC)
**Profit Model:** 100% margin (pure profit)

**Technical Requirements (User):**
- Windows PC (Windows 10+)
- MT5 terminal installed
- Internet connection
- Desktop Bridge .exe installed

---

### PREMIUM TIER (R279/month)

**Purpose:** Hassle-free auto-sync for serious traders who want 24/7 sync without installing anything

**Features:**
- Broker Connect (browser-based, no .exe)
- Auto-sync via managed VPS backend
- Instant 1-second updates
- Priority support
- Trading sessions + emotions tracking
- Export to MT4/MT5 format
- Advanced backtesting
- Team collaboration (coming soon)
- All Pro tier features

**MT5 Connection Method:**
- User enters MT5 credentials in JournalFX
- Backend connects to user's MT5 via VPS
- No local installation required
- Works from any device (phone, tablet, PC)
- 24/7 sync (VPS runs continuously)

**Infrastructure Cost:** ~R35-40/user (Contabo pool)
**Profit Model:** ~R240/user/month margin

---

## Infrastructure Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        JournalFX Cloud                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Frontend (Vercel)                     │   │
│  │                 React + TypeScript + Vite                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Backend API (VPS)                       │   │
│  │                  Python FastAPI                          │   │
│  │               MT5 Connection Pool Manager                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│         ┌─────────────────────┼─────────────────────┐          │
│         ▼                     ▼                     ▼          │
│  ┌───────────┐          ┌───────────┐         ┌───────────┐   │
│  │   User    │          │   User    │         │   User    │   │
│  │   MT5     │          │   MT5     │         │   MT5     │   │
│  │  (Pro)    │          │ (Premium) │         │ (Premium) │   │
│  │  .exe     │          │   VPS     │         │   VPS     │   │
│  └───────────┘          └───────────┘         └───────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Frontend

**Platform:** Vercel

| Component | Technology | Cost |
|-----------|------------|------|
| Hosting | Vercel Hobby | Free |
| Hosting | Vercel Pro | R340/mo |
| Framework | React 19 + TypeScript | - |
| Build | Vite | - |
| Styling | Tailwind CSS v4 | - |
| Database | Supabase | R440/mo (Pro) |

**Frontend Responsibilities:**
- User interface (all screens)
- Trade journal CRUD
- Analytics dashboard
- MT5 credential input (Premium)
- Real-time position display
- Settings and profile management

---

### Backend

**Platform:** Contabo VPS

| Spec | Plan | Price |
|------|------|-------|
| RAM | 8 GB | €10/mo (~R200) |
| CPU | 4 cores | - |
| Storage | 200 GB | - |
| Bandwidth | Unmetered | - |
| OS | Ubuntu 22.04 | - |

**Backend Responsibilities:**
- MT5 connection management
- Connection pooling (multiple users per MT5)
- Auto-sync polling (every 1-3 seconds)
- Real-time WebSocket updates
- Authentication (API keys)
- User session management

---

### Database

**Platform:** Supabase

| Plan | Price | Users |
|------|-------|-------|
| Free | R0 | 50k rows, 1GB |
| Pro | R440/mo | 250k rows, 8GB |
| Enterprise | R1,750/mo | Unlimited |

**Database Responsibilities:**
- User accounts + authentication
- Trade journal storage
- Profiles and settings
- Goals and milestones
- Notes and tags
- Analytics calculations

---

## MT5 Connection Methods

### Method 1: Desktop Bridge (Pro Tier)

**Architecture:**
```
┌─────────────────────────────────────────┐
│        User Windows PC                   │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │       Desktop Bridge (.exe)      │    │
│  │  - Python-based executable       │    │
│  │  - Runs in system tray           │    │
│  │  - Auto-starts with Windows      │    │
│  └─────────────────────────────────┘    │
│                  │                       │
│                  ▼                       │
│  ┌─────────────────────────────────┐    │
│  │        MT5 Terminal              │    │
│  │  - Must be logged in             │    │
│  │  - On user's PC                  │    │
│  └─────────────────────────────────┘    │
│                  │                       │
│                  ▼ (WebSocket)           │
│  ┌─────────────────────────────────┐    │
│  │      JournalFX Frontend         │    │
│  │      (Vercel)                   │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Pros:**
- 24/7 sync (even with browser closed)
- Low latency (direct connection)
- User controls their own data
- 100% profit margin

**Cons:**
- Windows only
- Must download/install software
- User's PC must be on
- Security concerns (unknown .exe)

---

### Method 2: Broker Connect (Premium Tier)

**Architecture:**
```
┌─────────────────────────────────────────────────────────────────┐
│                           JournalFX Cloud                        │
│                                                                  │
│  ┌───────────────────┐        ┌───────────────────────────────┐ │
│  │  Frontend (Vercel)│        │  Backend API (Contabo VPS)   │ │
│  │  React + Supabase │◄──────►│  Python FastAPI               │ │
│  └───────────────────┘  HTTPS  │  MT5 Connection Pool Manager  │ │
│                               └───────────────────────────────┘ │
│                                           │                     │
│                         ┌─────────────────┼─────────────────┐  │
│                         ▼                 ▼                 ▼  │
│                   ┌───────────┐     ┌───────────┐     ┌───────────┐
│                   │  MT5 #1   │     │  MT5 #2   │     │  MT5 #3   │
│                   │ 4 users   │     │ 4 users   │     │ 4 users   │
│                   │  (Pool)   │     │  (Pool)   │     │  (Pool)   │
│                   └───────────┘     └───────────┘     └───────────┘
│                         ▲                 ▲                 ▲
│                         │                 │                 │
│                    User MT5          User MT5           User MT5
│                    (or own VPS)      (or own VPS)      (or own VPS)
└──────────────────────────────────────────��──────────────────────┘
```

**Pros:**
- No installation required
- Works on any device
- 24/7 sync (VPS always on)
- Better user experience
- Cross-platform

**Cons:**
- You manage infrastructure
- Slightly higher latency (through your VPS)
- Connection pool complexity
- Cost per user (R35-40/mo)

---

## MT5 Connection Pool Architecture

### Pool Manager Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    MT5 Connection Pool                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Pool Manager                          │   │
│  │                                                         │   │
│  │  - Tracks available MT5 slots                            │   │
│  │  - Health check every 30 seconds                         │   │
│  │  - Auto-assign new users to available MT5                │   │
│  │  - Handle failover if MT5 goes down                      │   │
│  │  - Load balancing across MT5 instances                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│         ┌─────────────────────┼─────────────────────┐          │
│         ▼                     ▼                     ▼          │
│  ┌───────────┐          ┌───────────┐         ┌───────────┐ │
│  │  MT5 #1   │          │  MT5 #2   │         │  MT5 #3   │ │
│  │  4 users  │          │  4 users  │         │  4 users  │ │
│  │  ✓ Online │          │  ✓ Online │         │  ⚠ Warning│ │
│  └───────────┘          └───────────┘         └───────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Contabo Server Specifications

| Spec | 8 GB RAM | 16 GB RAM | 32 GB RAM |
|------|----------|-----------|-----------|
| Price | €10/mo | €20/mo | €40/mo |
| MT5 per Server | 4-6 | 8-12 | 16-24 |
| Users per Server | 16-24 | 32-48 | 64-96 |
| Cost per User | ~R35 | ~R25 | ~R20 |

### Auto-Assignment Logic

```
1. User subscribes to Premium (R279/mo)
2. User enters MT5 credentials in JournalFX
3. Backend tries to connect with provided credentials
4. If success:
   a. Check for existing user assignment
   b. If none, assign to available MT5 slot
   c. Return success with assigned MT5 info
5. If failure:
   a. Return clear error message
   b. Suggest checking credentials
6. Health check runs every 30 seconds:
   a. If MT5 goes down:
      - Mark slot as unavailable
      - Alert user
      - Don't assign new users
   b. If MT5 comes back:
      - Re-enable slot
      - Resume auto-sync
```

---

## Profitability Analysis

### Revenue Projections

| Tier | Price | Users Needed | Monthly Revenue |
|------|-------|--------------|-----------------|
| Free | R0 | 100 | R0 |
| Pro | R149 | 20 | R2,980 |
| Premium | R279 | 20 | R5,580 |
| **Total** | | 140 | **R8,560** |

### Cost Breakdown

| Item | Monthly Cost |
|------|-------------|
| Vercel (Hobby) | R0 |
| Supabase (Pro) | R440 |
| Contabo VPS (8GB, 2x) | R400 |
| Total Infrastructure | **R840** |

### Profit Margins

| Tier | Revenue | Infrastructure | Profit | Margin |
|------|---------|----------------|--------|--------|
| Free | R0 | R0 | R0 | N/A |
| Pro | R149/user | R0 | R149/user | **100%** |
| Premium | R279/user | R35/user | R244/user | **87%** |

### Break-Even Analysis

- **Break-even:** 3 Premium users OR 6 Pro users
- **At 20 Premium users:** R8,560 revenue - R840 cost = **R7,720 profit**
- **At 100 Premium users:** R27,900 revenue - R1,200 cost = **R26,700 profit**

---

## MT5 Python Package Reference

### Available Functions

#### Connection
| Function | Description |
|----------|-------------|
| `initialize()` | Connect to MT5 terminal |
| `shutdown()` | Disconnect from terminal |
| `version()` | Get MT5 terminal version |
| `terminal_info()` | Get terminal status/parameters |
| `last_error()` | Get last error message |

#### Account Info
| Function | Description |
|----------|-------------|
| `account_info()` | Get balance, equity, margin |
| `account_info_integer()` | Integer properties |
| `account_info_double()` | Double properties |

#### Symbols & Prices
| Function | Description |
|----------|-------------|
| `symbols_total()` | Total symbols count |
| `symbols_get()` | Symbols list |
| `symbol_info()` | Symbol details |
| `symbol_info_tick()` | Current bid/ask |

#### Orders
| Function | Description |
|----------|-------------|
| `orders_total()` | Pending orders count |
| `orders_get()` | Get pending orders |
| `order_send()` | Send new order |
| `order_check()` | Check order validity |

#### Positions
| Function | Description |
|----------|-------------|
| `positions_total()` | Open positions count |
| `positions_get()` | Get open positions |

#### History
| Function | Description |
|----------|-------------|
| `history_deals_total()` | Closed trades count |
| `history_deals_get()` | Get closed trades |

#### Market Data
| Function | Description |
|----------|-------------|
| `copy_rates_from()` | Get OHLC bars |
| `copy_ticks_from()` | Get tick data |

### NOT Available (MT5 Limitation)
- Economic calendar events
- Central bank data
- News feeds
- Market holidays (only session times)

---

## Implementation Roadmap

### Phase 1: Foundation (Current)
- [x] Basic journal CRUD
- [x] MT5 Broker Connect (local)
- [x] Credential persistence
- [x] Auto-login system

### Phase 2: Tier System
- [ ] Implement pricing page
- [ ] Create tier comparison UI
- [ ] Stripe/PayStack integration
- [ ] User tier management

### Phase 3: Pro Tier (Desktop Bridge)
- [ ] Package Python as .exe (PyInstaller)
- [ ] Create WebSocket bridge server
- [ ] Update frontend to support bridge
- [ ] Auto-update mechanism

### Phase 4: Premium Tier (VPS Backend)
- [ ] Set up Contabo VPS
- [ ] Deploy Python FastAPI backend
- [ ] Implement connection pool
- [ ] Create auto-assignment logic
- [ ] Health monitoring

### Phase 5: Polish
- [ ] Email notifications
- [ ] Mobile optimization
- [ ] Team features
- [ ] API for third-party tools

---

## Competitive Analysis

### Pricing Comparison

| Feature | TradeZella | Edgewonk | JournalFX |
|---------|------------|----------|-----------|
| Manual Entry | $9.99/mo | $19/mo | R0 (Free) |
| Auto-Sync | $19.99/mo | $29/mo | R149 (Pro) |
| Broker Connect | N/A | N/A | R279 (Premium) |
| Multi-Account | $29.99/mo | $39/mo | Coming Soon |

### Differentiators
- South African market focus
- MT4/MT5 support
- Affordable pricing
- Pro tier (Desktop Bridge) for users who want control
- Premium tier (Broker Connect) for users who want convenience

---

## Technical Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 19, Vite, TypeScript | User Interface |
| Styling | Tailwind CSS v4 | Design System |
| Database | Supabase (PostgreSQL) | User Data |
| Auth | Supabase Auth | Authentication |
| Storage | Supabase Storage | Files/Images |
| Backend | Python FastAPI | MT5 Connection Pool |
| Hosting (Frontend) | Vercel | CDN, Deployment |
| Hosting (Backend) | Contabo VPS | MT5 Connections |
| Payments | Stripe/PayStack | Subscriptions |

---

## Appendix

### Contabo VPS Setup

**Recommended Configuration:**
- 2x VPS at €10/mo each (€20 total)
- Ubuntu 22.04 LTS
- SSH key authentication
- UFW firewall (only ports 22, 80, 443)
- Fail2Ban for security
- Automated backups (weekly)

**Initial Setup Commands:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install python3 python3-pip python3-venv

# Create user for MT5 service
sudo useradd -m -s /bin/bash mt5service

# Install required packages
pip3 install fastapi uvicorn MetaTrader5 websockets
```

### Supabase Tables

**profiles** - User profile data
**trades** - Trade journal entries
**goals** - Goal tracking
**notes** - Notes and tags
**sessions** - Trading sessions
**mt5_connections** - Connection metadata (Premium)

### File Structure

```
jfxbetav7/
├── components/
│   ├── BrokerConnect.tsx      # MT5 connection UI
│   ├── DesktopBridge/         # Pro tier component
│   └── Pricing/               # Tier comparison
├── services/
│   ├── dataService.ts         # Supabase operations
│   └── mt5Service.ts          # MT5 API calls
├── scripts/
│   ├── mt5.py                 # MT5 connection script
│   └── backend/               # VPS backend code
├── hooks/
│   └── useMT5.ts              # MT5 state management
└── types.ts                   # TypeScript definitions
```

---

## Notes

- **Last Updated:** April 30, 2026
- **Author:** JournalFX Dev Team
- **Version:** 1.0
- **Status:** Planning Complete