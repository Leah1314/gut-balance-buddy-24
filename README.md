# Gut Balance Buddy

Gut Balance Buddy is an AI-assisted gut health tracking web app designed to help users understand patterns between food, digestion, symptoms, stool health, and wellness habits.

The project was built as a rapid product prototype using React, TypeScript, Supabase, and AI-powered analysis flows. It combines daily health logging with personalized coaching-style feedback, giving users a more structured way to reflect on digestive health data.

> This project is for educational and wellness-tracking purposes only. It is not a medical device and does not replace professional medical advice.

## Why I Built This

Gut health is deeply personal, but most people track it in fragmented ways: notes apps, photos, memory, food diaries, and occasional test reports. Gut Balance Buddy explores how AI can make this process more useful by bringing those signals into one place and turning them into accessible insights.

The app focuses on three ideas:

- Make health tracking simple enough to use regularly
- Help users connect food, symptoms, stool changes, and test results
- Use AI as a supportive coach, not as a diagnosis engine

## Key Features

- **Food diary** - log meals and notes to build a structured food history
- **Food image analysis** - analyze food photos with an AI-assisted workflow
- **Stool tracker** - record stool type, color, consistency, and notes
- **Stool image analysis** - support visual stool analysis for richer tracking
- **Symptom tracker** - log digestive symptoms and wellness signals
- **Health profile** - store personal context such as goals, lifestyle, and health background
- **Gut health coach** - AI chat experience for concise, contextual guidance
- **Test result upload** - analyze health test documents and summarize key information
- **Education hub** - provide learning content around gut health and lifestyle habits
- **Progress views** - visualize logged activity and trends over time
- **Authentication** - user sign-in and protected app flows powered by Supabase
- **Internationalization** - multilingual structure using `i18next`

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **UI:** Tailwind CSS, shadcn-ui, Radix UI, lucide-react
- **State/Data:** TanStack Query, custom React hooks
- **Backend:** Supabase, Supabase Auth, Supabase Edge Functions
- **AI workflows:** Edge functions for food, stool, test-result, chat, and audio transcription flows
- **Charts:** Recharts
- **Testing support:** Python/pytest support files for RAG and analysis workflow testing

## Architecture Overview

```text
React + Vite frontend
        |
        | Supabase client
        v
Supabase Auth + Database
        |
        | Edge Function calls
        v
AI analysis workflows
Food image | Stool image | Test results | Chat | Audio transcription
```

The frontend is organized around feature components and hooks:

- `src/components` - product screens and reusable UI components
- `src/hooks` - data and auth hooks
- `src/i18n` - language configuration
- `src/integrations/supabase` - Supabase client and generated types
- `supabase/functions` - server-side AI and processing functions
- `supabase/migrations` - database schema migrations

## Getting Started

### Prerequisites

- Node.js and npm
- A Supabase project
- API keys configured in Supabase Edge Function secrets for AI workflows

### Installation

```bash
npm install
npm run dev
```

### Environment Variables

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Then add your Supabase client configuration:

```bash
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

For Supabase Edge Functions, configure secrets in Supabase rather than committing them:

```bash
LOVABLE_API_KEY=your-ai-provider-key
OPENAI_API_KEY=your-openai-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_URL=https://your-project.supabase.co
```

## Scripts

```bash
npm run dev       # Start local development server
npm run build     # Build production bundle
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

## Security Notes

- `.env` files are intentionally ignored and should not be committed.
- Supabase service role keys must only be used in server-side functions.
- If a secret has ever been committed, rotate it before using the project in production.
- Keep Supabase Row Level Security policies enabled for user-owned health data.

## Product Status

This is a working prototype and portfolio project. It demonstrates product thinking, full-stack integration, AI-assisted user flows, and a health-tech user experience. Before production use, it would need deeper privacy review, medical compliance review, stronger safety guardrails, and more robust clinical validation.

## Roadmap Ideas

- Add clearer onboarding and goal setting
- Improve trend analysis across food, stool, symptoms, and test results
- Add exportable user health summaries
- Add stronger privacy controls and data deletion workflows
- Improve AI response safety and escalation guidance
- Add automated tests for core tracking flows

## Repository Notes

This project was initially prototyped with Lovable and then extended with custom implementation work, Supabase integrations, AI workflows, and product-specific tracking features.
