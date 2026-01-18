# ✈️ Skills Plane

> Standardizing and sharing Agent Skills for AI-native teams.

**Skills Plane** is a centralized dashboard and marketplace for **Agent Skills**, **Rules**, and **Workflows**. It allows individuals and organizations to publish, version, and share their best practices for AI agents in a standardized format.

---

## 🚀 Features

- **Standardized Skill Discovery**: A central marketplace to browse and adopt skills.
- **GitHub Import & Sync**: Seamlessly import skills from root `SKILL.md` or multi-skill repositories.
- **CLI Installer**: Install any skill directly into your project via `npx skills-plane add <slug>`.
- **Merged Collections**: Import entire repositories of skills as a single merged collection.
- **ZIP Downloads**: Download skills for offline use or manual integration.
- **Rules & Governance**: Define "rules" (AGENTS.md) that govern how your AI team should behave.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, SSR-first)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **UI Components**: [Mantine UI](https://mantine.dev/)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Icons**: [Tabler Icons](https://tabler-icons.io/)

## 📦 Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/atilaahmettaner/skills-plane.git
cd skills-plane
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local` and provide your Supabase credentials.
```bash
cp .env.example .env.local
```

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key |
| `GITHUB_TOKEN` | (Optional) Recommended to avoid GitHub API rate limits |

### 4. Database Setup
Please refer to [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) to bootstrap your database schema and policies.

### 5. Run the server
```bash
pnpm dev
```

## 🛠️ CLI Usage

You can install skills directly from this marketplace:
```bash
npx skills-plane add <slug>
```

You can also use it to add skills from GitHub repos NOT currently on the plane:
```bash
npx add-skill <github-url>
```

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to get started and our PR process.

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

Built with ❤️ for the AI Agent community.
