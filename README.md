# Sage Vault — The Smartest DeFi Savings Account

> *"The smartest way to save, grow, and protect your money — powered by YO's risk-adjusted yields and guided by an intelligent AI co-pilot that understands you."*

[![Built with YO Protocol](https://img.shields.io/badge/Built%20with-YO%20Protocol-059669?style=flat-square)](https://yo.xyz)
[![Network: Base](https://img.shields.io/badge/Network-Base-0052FF?style=flat-square)](https://base.org)
[![Network: Ethereum](https://img.shields.io/badge/Network-Ethereum-627EEA?style=flat-square)](https://ethereum.org)
[![Network: Arbitrum](https://img.shields.io/badge/Network-Arbitrum-28A0F0?style=flat-square)](https://arbitrum.io)

---

## What is Sage Vault?

Sage Vault is a consumer-grade DeFi savings application built on [YO Protocol](https://yo.xyz). It combines YO's battle-tested, risk-adjusted yield infrastructure with an intelligent AI co-pilot — **Sage** — that builds a personalized savings strategy for each user and executes it onchain with a single tap.

It targets everyday savers who want inflation-beating returns without DeFi complexity — especially users in high-inflation regions (emerging markets, etc.) where stable, USD-denominated yield matters most.

---

## User Flow

```mermaid
flowchart TD
    A([User visits Sage Vault]) --> B{First visit?}
    B -- Yes --> C[Onboarding Quiz\n4 questions: goal · risk · income · horizon]
    B -- No --> G
    C --> D[Sage AI generates\npersonalized allocation plan]
    D --> E[Dashboard shows\nSage Recommendation Card]
    E --> F[User taps Deposit →\non recommended vault]
    F --> G[Connect Wallet\nMetaMask · Coinbase · Injected]
    G --> H[Deposit Modal\nEnter USDC amount]
    H --> I[useDeposit hook\nApprove USDC]
    I --> J[useDeposit hook\nDeposit to YO Vault on Base]
    J --> K[Transaction confirmed\nBasescan link shown]
    K --> L[Dashboard updates\nLive position + P&L]
    L --> M[Portfolio page\nYield projector · Tx history · Allocations]
```

---

## Architecture

```mermaid
graph TB
    subgraph Frontend ["Frontend — React + TypeScript + Vite"]
        UI[Pages & Components]
        SAGE[Sage AI Context\nPersonalized advice engine]
        HOOKS[Custom Hooks\nuseWallet · useVaultStats · useVaultSnapshot]
    end

    subgraph YO_SDK ["@yo-protocol/react SDK"]
        YP[YieldProvider]
        DEP[useDeposit]
        RED[useRedeem]
        POS[useUserPositions]
        PERF[useUserPerformance]
        HIST[useUserHistory]
        ALLOC[useVaultAllocations]
        PREV[usePreviewDeposit\nusePreviewRedeem]
        VAULTS[useVaults]
    end

    subgraph CHAIN ["Onchain — Base · Ethereum · Arbitrum"]
        VAULT_USD[yoUSD Vault\nStable USDC yield]
        VAULT_ETH[yoETH Vault\nETH-denominated yield]
        VAULT_BTC[yoBTC Vault\nBTC-denominated yield]
        MORPHO[Morpho]
        LIDO[Lido]
        PENDLE[Pendle]
    end

    subgraph WALLET ["Wallet Layer — Wagmi"]
        MM[MetaMask]
        CB[Coinbase Wallet]
        INJ[Injected]
    end

    UI --> YO_SDK
    UI --> SAGE
    UI --> HOOKS
    YP --> DEP & RED & POS & PERF & HIST & ALLOC & PREV & VAULTS
    DEP & RED --> VAULT_USD & VAULT_ETH & VAULT_BTC
    VAULT_USD & VAULT_ETH & VAULT_BTC --> MORPHO & LIDO & PENDLE
    WALLET --> YO_SDK
```

---

## YO SDK Integration

This project uses `@yo-protocol/react` and `@yo-protocol/core` throughout. Below is every hook used and where:

| Hook | Used In | Purpose |
|---|---|---|
| `YieldProvider` | `main.tsx` | Wraps entire app, provides SDK context |
| `useDeposit` | `DepositModal.tsx` | Full approve → deposit → confirm flow |
| `useRedeem` | `RedeemModal.tsx` | Redeem shares, handles instant + queued |
| `usePreviewDeposit` | `DepositModal.tsx` | Live share preview before signing |
| `usePreviewRedeem` | `RedeemModal.tsx` | Live asset preview before signing |
| `useVaults` | `Vaults.tsx`, `yoExtras.ts` | Fetch all vault configs + stats |
| `useUserPositions` | `Dashboard.tsx` | User's positions across all chains |
| `useUserPerformance` | `Portfolio.tsx` | Realized + unrealized P&L per vault |
| `useUserHistory` | `Portfolio.tsx` | Full transaction history with Basescan links |
| `useUserBalances` | `Dashboard.tsx` | Total portfolio USD value |
| `useVaultAllocations` | `AllocationPanel.tsx` | Live protocol breakdown (Morpho %, Lido %, Pendle %) |
| `useYoClient` | `yoExtras.ts` | Direct client access for snapshot queries |

### Deposit Flow (step-by-step)

```mermaid
sequenceDiagram
    participant User
    participant DepositModal
    participant useDeposit
    participant USDC as USDC Contract (Base)
    participant YO as YO Vault (Base)

    User->>DepositModal: Enter amount + click Deposit
    DepositModal->>useDeposit: deposit({ token: USDC_BASE, amount, chainId: 8453 })
    useDeposit->>useDeposit: step = "switching-chain" (if needed)
    useDeposit->>USDC: approve(gatewayAddress, amount)
    useDeposit->>useDeposit: step = "approving"
    USDC-->>useDeposit: approval confirmed
    useDeposit->>YO: deposit(assets, receiver)
    useDeposit->>useDeposit: step = "depositing" → "waiting"
    YO-->>useDeposit: tx confirmed, shares minted
    useDeposit-->>DepositModal: step = "success", hash
    DepositModal-->>User: ✓ Deposited! View on Basescan
```

---

## Features

###  Sage AI Co-Pilot
- Conversational savings advisor grounded in live YO vault data
- Auto-extracts risk profile, income, and goals from natural language
- Personalized allocation recommendations (conservative / balanced / aggressive)
- Yield projections, inflation protection advice, safety explanations
- Quick-prompt chips for common questions

###  Smart Onboarding
- 4-step quiz: savings goal → risk tolerance → monthly savings → time horizon
- Generates a personalized Sage recommendation on completion
- Recommendation card on dashboard with live APY per vault and one-tap deposit buttons

###  Live YO Vault Integration
- Real deposit and redeem flows on Base (low gas, fast confirmations)
- Live APY, TVL, and share price from YO API
- Instant vs. queued redemption detection with request ID display
- Support for yoUSD, yoETH, yoBTC

###  Portfolio & Analytics
- Real-time portfolio value via `useUserBalances`
- Per-vault P&L (realized + unrealized) via `useUserPerformance`
- Full transaction history with Basescan links
- Interactive yield projector (principal, monthly deposit, APY, time horizon)

###  Transparency Dashboard
- Protocol allocation breakdown per vault (Morpho, Lido, Pendle percentages)
- Animated allocation bars updated from live `useVaultAllocations` data
- Every transaction verifiable onchain

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + Framer Motion |
| Web3 | Wagmi v3 + Viem v2 |
| Data | TanStack Query v5 |
| YO SDK | `@yo-protocol/react` v1.0.6 + `@yo-protocol/core` v1.0.9 |
| Charts | Recharts v3 |
| Notifications | react-hot-toast |
| Analytics | Vercel Analytics |
| Deploy | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- MetaMask or any EVM wallet with Base network configured

### Installation

```bash
git clone <repo-url>
cd YO
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
pnpm build
pnpm preview
```

### Deploy to Vercel

```bash
vercel --prod
```

---

## Supported Networks

| Network | Chain ID | Status |
|---|---|---|
| Base | 8453 | ✅ Primary (recommended — low gas) |
| Ethereum | 1 | ✅ Supported |
| Arbitrum | 42161 | ✅ Supported |

> Deposits default to Base for the best user experience (fast confirmations, low fees).

---

## Project Structure

```
src/
├── components/
│   ├── Navigation.tsx        # Responsive nav with mobile hamburger
│   ├── Landing.tsx           # Hero + live TVL/APY stats
│   ├── Dashboard.tsx         # Portfolio overview + Sage recommendation
│   ├── Vaults.tsx            # All YO vaults with allocation guide
│   ├── SagePage.tsx          # AI co-pilot chat interface
│   ├── Portfolio.tsx         # Analytics, projector, tx history
│   ├── DepositModal.tsx      # Full deposit flow (useDeposit)
│   ├── RedeemModal.tsx       # Full redeem flow (useRedeem)
│   ├── VaultCard.tsx         # Individual vault card with live data
│   ├── SageChat.tsx          # Conversational AI chat component
│   ├── SageRecommendation.tsx # Personalized allocation card
│   ├── AllocationPanel.tsx   # Live protocol breakdown
│   ├── Onboarding.tsx        # 4-step personalization quiz
│   └── YieldProjector.tsx    # Interactive yield simulation chart
├── context/
│   └── SageContext.tsx       # AI co-pilot state + response engine
├── hooks/
│   ├── useWallet.ts          # Wallet connection helpers
│   └── yoExtras.ts           # Polyfilled YO hooks (useVaultStats etc.)
├── utils/
│   └── format.ts             # USD/APY/bigint formatters + yield projector
└── wagmi.config.ts           # Wagmi chain + connector config
```

---

## Security & Trust

- **Non-custodial** — users retain full control of their funds at all times
- **No private keys** — wallet connection only, no seed phrases stored
- **Onchain verification** — every deposit and redeem links to a block explorer
- **Audited protocols** — YO deploys only to battle-tested protocols (Lido, Morpho, Pendle)
- **Transparent allocations** — live breakdown of where funds are deployed, visible in the dashboard
- **Slippage protection** — 0.5% default slippage on all deposits via YO SDK

---

## License

MIT

---

*Built for the YO Protocol Hackathon — "Build the Smartest DeFi Savings Account with YO"*
