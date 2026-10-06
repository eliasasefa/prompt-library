# AI Prompt Library

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Neon](https://img.shields.io/badge/Neon-Postgres-00E599?style=flat-square&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=flat-square&logo=vercel)
![Auth.js](https://img.shields.io/badge/Auth.js-v5-purple?style=flat-square)
![Gemini](https://img.shields.io/badge/Gemini-3.8_Flash-4285F4?style=flat-square&logo=google)

> Save, organize, improve, and share AI prompts — with GitHub login, community explore, and Gemini-powered editing tools.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-00C853?style=for-the-badge)](https://prompt-library-elias.vercel.app)
[![Portfolio](https://img.shields.io/badge/👨‍💻_My_Portfolio-More_Projects-FF6B6B?style=for-the-badge)](https://eliasasefa.netlify.app/)

## Features

### Library
- **Save & organize** — custom categories, search, and one-click copy
- **Public or private** — keep drafts to yourself or publish to Explore
- **Templates** — `{{variables}}` with a fill-in form before copy
- **Full prompt view** — long prompts open in a readable sheet (mobile bottom sheet, desktop dialog)
- **Import / export** — JSON backup or Markdown export

### Community
- **Explore** — browse public prompts, upvote, and copy
- **Share pages** — unique `/p/[id]` URLs for public prompts

### AI tools (Gemini 3.8 Flash)
- **Improve** — rewrite a prompt for clarity, then replace the editor (with undo)
- **Tags** — suggested category and tags
- **Describe** — short summary of a prompt
- **Variations** — alternative versions you can insert
- **Review** — quality issues to fix before you save

### Auth & data
- **GitHub OAuth** (Auth.js v5) with a stable account id so your library survives re-login
- **Neon Postgres** over the serverless HTTP driver

## Tech stack

| Layer | Stack |
|----------|-----------|
| App | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Auth | Auth.js v5, GitHub |
| Data | Neon Postgres |
| AI | Google Gemini (`gemini-3.8-flash`, with Flash fallbacks) |
| Hosting | Vercel |

## Screenshots

<div align="center">
  <img src="https://github.com/eliasasefa/prompt-library/blob/master/public/prompt-library-share.png" alt="Share page" width="45%" />
  <img src="https://github.com/eliasasefa/prompt-library/blob/master/public/prompt-library-home.png" alt="Dashboard" width="45%" />
  <img src="https://github.com/eliasasefa/prompt-library/blob/master/public/prompt-library-input.png" alt="Editor" width="45%" />
</div>

## Getting started

### Prerequisites
- Node.js 18+ and npm
- GitHub OAuth app
- Neon Postgres database
- Google AI Studio (Gemini) API key

### Installation

```bash
git clone https://github.com/eliasasefa/prompt-library.git
cd prompt-library
npm install
```

Create `.env.local`:

```bash
DATABASE_URL=
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
GOOGLE_GENERATIVE_AI_API_KEY=
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
