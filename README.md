# 🚀 AI Prompt Library

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Neon](https://img.shields.io/badge/Neon-Postgres-00E599?style=flat-square&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=flat-square&logo=vercel)
![Auth.js](https://img.shields.io/badge/Auth.js-v5-purple?style=flat-square)

> A full-stack AI prompt management platform with templates, sharing, voting, and cloud sync.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-00C853?style=for-the-badge)](https://prompt-library-elias.vercel.app)
[![Portfolio](https://img.shields.io/badge/👨‍💻_My_Portfolio-More_Projects-FF6B6B?style=for-the-badge)](https://eliasasefa.netlify.app/)

## ✨ Features

### 🎯 Core Functionality
- **Save & Organize** - Create custom categories and organize prompts
- **Instant Search** - Find any prompt by keyword in milliseconds
- **One-Click Copy** - Copy prompts to clipboard with a single click
- **Public/Private** - Keep prompts private or share with the community
- **Prompt Templates** - Support for `{{variables}}` with interactive fill-in forms
- **Public Share Pages** - Generate unique URLs to share prompts on social media
- **Upvotes & Favorites** - Community voting system for surfacing best prompts
- **Import/Export** - Backup entire library as JSON or Markdown

### 🛡️ Technical Highlights
- **Serverless Postgres** - Neon's HTTP driver for optimal Vercel Edge compatibility
- **GitHub OAuth** - Secure authentication with Auth.js v5
- **Responsive Design** - Mobile-first UI with Tailwind CSS
- **Type Safety** - Full TypeScript coverage with strict mode
- **Optimized Queries** - Efficient SQL with proper indexing

## 🎨 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | Next.js API Routes, Auth.js v5 |
| **Database** | Neon Postgres (Serverless), HTTP-based driver |
| **Deployment** | Vercel, GitHub OAuth |
| **UI/UX** | Lucide Icons, Geist Font |

## 📸 Screenshots

<div align="center">
  <img src="https://github.com/eliasasefa/prompt-library/blob/master/public/prompt-library-share.png" alt="Templates" width="45%" />
  <img src="https://github.com/eliasasefa/prompt-library/blob/master/public/prompt-library-home.png" alt="Dashboard" width="45%" />
  <img src="https://github.com/eliasasefa/prompt-library/blob/master/public/prompt-library-input.png" alt="Templates" width="45%" />
</div>

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- GitHub account (for OAuth)
- Neon Postgres account (free tier works)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/eliasasefa/prompt-library.git
cd prompt-library
