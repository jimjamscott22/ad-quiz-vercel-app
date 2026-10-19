# Domain//Quest — IT Practice Console

An interactive quiz app for practicing **Active Directory, PowerShell, networking, and security** concepts. Questions are multiple choice, and each answer reveals a short explanation plus a real command you can try. The UI is a dark, terminal-inspired "ops console".

Built with Next.js 16 (App Router), React 19, Tailwind CSS 4, and deployed on Vercel. The project was bootstrapped with [v0](https://v0.app).

## Features

- **20 questions** across four modules and three difficulty levels (`FOUNDATION`, `INTERMEDIATE`, `ADVANCED`)
- **Topic filter**: pick *All topics* or a single module from the sidebar
- **Lock-in flow**: select an answer, lock it, then see correct/incorrect feedback
- **"Field note" explanations**: why the answer is right, with an example `PS>` command where relevant
- **Live run stats**: progress bar, score (`correct / answered`), questions remaining, and accuracy for the current run
- **Reset run** and **Previous / Next** navigation
- **Responsive layout**: the sidebar collapses behind a menu button on small screens
- **Vercel Analytics**, enabled in production builds only

### Question bank

| Module           | Questions |
| ---------------- | --------- |
| Active Directory | 6         |
| Networking       | 5         |
| PowerShell       | 5         |
| Security         | 4         |

Topics include OUs and group scopes, FSMO roles, replication (`repadmin`, `dcdiag`), DNS record types, DHCP and APIPA, LDAP/Kerberos ports, Kerberos tickets, Credential Guard, gMSAs, `-WhatIf`, `try/catch`, and the pipeline.

## Tech stack

| Area      | Choice                                                           |
| --------- | ---------------------------------------------------------------- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router)                    |
| UI        | React 19, TypeScript                                             |
| Styling   | Tailwind CSS 4 via `@tailwindcss/postcss`, `tw-animate-css`      |
| Components| [shadcn/ui](https://ui.shadcn.com) (`base-nova` style), `@base-ui/react`, `class-variance-authority` |
| Icons     | [lucide-react](https://lucide.dev)                               |
| Fonts     | Oxanium, Source Code Pro, Source Serif 4 (via `next/font/google`)|
| Analytics | `@vercel/analytics`                                              |
| Package manager | pnpm                                                       |

## Getting started

### Prerequisites

- Node.js 20.9 or later
- [pnpm](https://pnpm.io)

### Install and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command      | Description                          |
| ------------ | ------------------------------------ |
| `pnpm dev`   | Start the development server         |
| `pnpm build` | Create a production build            |
| `pnpm start` | Serve the production build           |

No environment variables are required.

## Project structure

```
.
├── app/
│   ├── layout.tsx      # Root layout: fonts, metadata, icons, Vercel Analytics
│   ├── page.tsx        # The whole quiz: question bank, state, and UI
│   └── globals.css     # Tailwind and theme tokens
├── components/
│   └── ui/button.tsx   # shadcn/ui button
├── lib/utils.ts        # cn() class-name helper
├── public/             # Icons and placeholder images
├── components.json     # shadcn/ui configuration
└── next.config.mjs     # Next.js configuration
```

## Adding or editing questions

All questions live in the `questions` array at the top of `app/page.tsx`. Each entry has this shape:

```ts
{
  id: 21,                          // unique, used for the Q.xx badge
  category: 'Networking',          // 'Active Directory' | 'Networking' | 'PowerShell' | 'Security'
  difficulty: 'INTERMEDIATE',      // 'FOUNDATION' | 'INTERMEDIATE' | 'ADVANCED'
  prompt: 'Which command ...?',
  answers: ['A', 'B', 'C', 'D'],   // shown as options A, B, C, D
  correct: 1,                      // zero-based index into `answers`
  explanation: 'Why the answer is correct.',
  command: 'Test-NetConnection dc01 -Port 389', // optional example, shown as `PS> ...`
}
```

The header's question count and each module's queue update automatically.

## How it works

The quiz is a single client component (`'use client'`) using React state only. Nothing is persisted, so a page refresh starts a new run.

- `category` filters the question list (memoized with `useMemo`).
- `questionIndex`, `selected`, and `submitted` drive the answer flow.
- `score` and `completed` feed the stat cards and the accuracy readout.
- Changing module resets the run; **Reset run** restarts the current module.

## Known limitations

- The **streak** counter (`07`) and the **version** label (`V1.4.0`) in the header are hardcoded placeholders, not tracked values.
- Progress is not saved between sessions.
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so type errors will not fail a build. Consider removing it once the project is stable.
- After the last question, "Next question" wraps back to the start of the module rather than showing a results screen.

## Deployment

The app deploys to [Vercel](https://vercel.com) with no extra configuration:

1. Push the repository to GitHub.
2. Import it in the Vercel dashboard.
3. Deploy. Vercel detects Next.js and uses `pnpm build` automatically.

Or use the CLI:

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production deployment
```
