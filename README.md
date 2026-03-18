# Evidence-Aware GNN+RAG — Fake News Detection System

> **Thesis Demo Interface** · Dedeepya Yarlagadda · UGA MS CS 2026  
> Advisor: Dr. Ismailcem Budak Arpinar

An interactive web demo for the thesis *"A RAG-Augmented Graph Neural Network for Evidence-Based Fake News Detection."*  
Enter any news claim and watch the full six-stage pipeline execute — hybrid evidence retrieval, BM25 ranking, NLI stance classification, heterogeneous graph construction, GNN message passing, and LLM-grounded explanation — then see the FAKE / REAL verdict with confidence score and per-evidence stance badges.

---

## Table of Contents

- [Overview](#overview)
- [Pipeline Stages](#pipeline-stages)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Sample Articles](#sample-articles)
- [Datasets](#datasets)
- [Thesis Context](#thesis-context)
- [License](#license)

---

## Overview

This app is the **front-end demo layer** of the thesis research. It simulates — and visually narrates — the inference pipeline of the `EvidenceHeteroGNN+RAG` model trained on FakeNewsNet and evaluated zero-shot on LIAR.

For any input claim the app:

1. Walks through the six pipeline steps in real time with animated status indicators.
2. Returns a structured verdict: `FAKE` or `REAL` with a confidence score.
3. Displays three retrieved evidence passages, each with a stance label (`SUPPORTS` / `REFUTES` / `NEUTRAL`), a confidence score, and a clickable source URL.
4. Provides an LLM-generated explanation that cites the evidence by ID (`[E1]`, `[E2]`, `[E3]`).

Hardcoded sample claims are answered from pre-computed thesis results. All other custom input is handled by **Gemini** (`gemini-3.1-pro-preview`) which simulates the full model output including realistic Wikipedia evidence URLs.

---

## Pipeline Stages

| # | Stage | What it does |
|---|---|---|
| 1 | **Hybrid RAG Retrieval** | Primary: fetches the article's source URL. Fallback: Wikipedia search on the claim title. |
| 2 | **BM25 Ranking** | Segments retrieved text into passages and ranks them by BM25 relevance to the claim. |
| 3 | **NLI Stance Classification** | `roberta-large-mnli` encodes each (claim, passage) pair and assigns SUPPORTS / REFUTES / NEUTRAL with a confidence score. |
| 4 | **Graph Construction** | Builds a `HeteroData` graph: article node → evidence nodes (via `cites` edges, stance as edge attributes) → tweet nodes (structural proxy). |
| 5 | **GNN Reasoning** | 3-layer `HeteroConv` with `SAGEConv`, attention pooling over evidence neighbors, source credibility gate, and a gradient reversal domain head. |
| 6 | **LLM Explanation** | Gemini synthesizes a 3–5 sentence natural-language justification grounded in the retrieved evidence. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Animation | Motion (Framer Motion) |
| Icons | Lucide React |
| AI / LLM | Google Gemini (`@google/genai`) |
| Server (optional) | Express + dotenv |

---

## Project Structure

```
evidence-aware-gnn_rag/
├── src/
│   ├── App.tsx          # Main component — pipeline stepper, results dashboard, Gemini call
│   ├── main.tsx         # React root mount
│   └── index.css        # Global styles (Tailwind entry point)
├── index.html           # App shell
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite config — Tailwind plugin, path aliases, env injection
├── tsconfig.json        # TypeScript config
├── metadata.json        # App metadata (name, description)
├── .env.example         # Required environment variable template
└── .gitignore
```

### Key components inside `App.tsx`

| Component | Purpose |
|---|---|
| `PipelineStepper` | Animated six-step progress tracker — past steps turn green, active step spins, future steps dim |
| `ResultsDashboard` | Renders verdict card, LLM explanation, and evidence list with stance color-coding |
| `handleAnalyze()` | Orchestrates the simulated pipeline delay, routes hardcoded samples vs. Gemini API, sets state |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Google AI Studio](https://aistudio.google.com/) API key with access to Gemini models

### Installation

```bash
# Clone or unzip the project
cd evidence-aware-gnn_rag

# Install dependencies
npm install
```

### Development server

```bash
npm run dev
# App available at http://localhost:3000
```

### Production build

```bash
npm run build       # outputs to dist/
npm run preview     # preview the production build locally
```

### Type check

```bash
npm run lint        # runs tsc --noEmit
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your key:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key. In AI Studio this is injected automatically from the Secrets panel. |
| `APP_URL` | Optional | The hosted URL of the app — used for self-referential links and OAuth callbacks. |

> **Note:** The API key is injected into the Vite build via `process.env.GEMINI_API_KEY` (see `vite.config.ts`). Do not commit your `.env` file — it is listed in `.gitignore`.

---

## Usage

1. **Enter a claim** in the *Input Text / Claim* textarea — any news headline or political statement works.
2. Click **Analyze Article**.
3. Watch the six pipeline stages complete in sequence (~7–10 seconds).
4. Read the verdict panel:
   - 🔴 **FAKE** — rose color scheme, `ShieldAlert` icon
   - 🟢 **REAL** — emerald color scheme, `ShieldCheck` icon
   - Confidence score shown as a percentage
5. Review the **three evidence cards** below the explanation — each shows the source URL (clickable), stance label, and the retrieved passage.

---

## Sample Articles

Two pre-loaded samples from the thesis evaluation datasets are available via the *Sample Articles* panel:

| Sample | Dataset | Expected verdict |
|---|---|---|
| *"Pope Francis Shocks World, Endorses Donald Trump for President"* | FakeNewsNet (PolitiFact) | FAKE — 96% confidence |
| *"Hillary Clinton wants to abolish the Second Amendment."* | LIAR | FAKE — 91% confidence |

These samples use pre-computed results (no API call) so they work without a Gemini key.

---

## Datasets

The underlying thesis model was trained and evaluated on three datasets:

| Dataset | Role | Articles |
|---|---|---|
| **FakeNewsNet** (GossipCop) | Training + Validation | 1,000 articles (cross-domain split) |
| **FakeNewsNet** (PolitiFact) | In-domain Test | 250 articles |
| **LIAR** (official test split) | Zero-shot Cross-dataset Test | 250 statements |

Binary label mapping for LIAR: `pants-fire / false / barely-true` → **FAKE**; `half-true / mostly-true / true` → **REAL**.

---

## Thesis Context

This demo visualizes the inference pipeline of:

> **"A RAG-Augmented Graph Neural Network for Evidence-Based Fake News Detection"**  
> Dedeepya Yarlagadda · University of Georgia · MS Computer Science · 2026  
> Advisor: Dr. Ismailcem Budak Arpinar

### Model architecture highlights

- **Encoder:** `roberta-base` (768-dim article + evidence embeddings)
- **Stance model:** `roberta-large-mnli` (NLI cross-encoder for stance + reranking)
- **GNN:** `EvidenceHeteroGNN` — 3-layer `HeteroConv` (`SAGEConv`), attention-pooled evidence aggregation, source credibility gate, gradient reversal domain head
- **Training:** 5 seeds, AdamW lr=2e-4, 80 epochs cosine annealing, asymmetric loss (w_fp=2.0)

### Main results (FakeNewsNet, n=1,250)

| Model | Accuracy | F1 | AUC |
|---|---|---|---|
| B1: RoBERTa + LR | 79.40% | 77.28% | 87.12% |
| B2: Tweet-only GNN | 80.85% | 79.40% | 88.04% |
| B3: EGHGAT (Guo 2025) | 81.88% | 80.63% | 89.55% |
| **★ Ours: EvidenceHeteroGNN+RAG** | **84.72%** | **83.15%** | **91.38%** |

Cross-domain: trained on **GossipCop**, tested on **PolitiFact** (zero-shot).  
Cross-dataset: tested on **LIAR** (zero-shot, model never sees LIAR during training).

---

## License

This project is part of a graduate thesis submission at the University of Georgia.  
For research and educational use only. Not licensed for commercial deployment.
