# Contributing to Skills Plane

We're excited that you're interested in contributing to Skills Plane! This project aims to standardize how Agent Skills and team principles are shared and discovered.

## Prerequisites

- [Node.js](https://nodejs.org/) (Version 18 or later)
- [pnpm](https://pnpm.io/)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local development)

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/skills-plane.git
   cd skills-plane
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Set up environment variables**:
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
   ```bash
   cp .env.example .env.local
   ```
5. **Run the development server**:
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branching

- Create a feature branch from `main`: `git checkout -b feature/your-feature-name`.
- Use descriptive branch names.

### Style Guidelines

- This project uses **Mantine** for UI. Please avoid adding Tailwind CSS or other utility-first frameworks.
- Follow the existing project structure (Domain-Driven Design).
- Write clean, documented TypeScript code.

### Commit Messages

- Use clear and descriptive commit messages (e.g., `feat: add github import support`, `fix: handle duplicate slugs`).

## Pull Request Process

1. Ensure your code passes linting: `pnpm lint`.
2. Ensure the build passes: `pnpm build`.
3. Update relevant documentation if you've added or changed features.
4. Submit your PR with a clear description of the changes.

## Bug Reports and Feature Requests

Please use [GitHub Issues](https://github.com/atilaahmettaner/skills-plane/issues) to report bugs or suggest features.

---

By contributing, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
