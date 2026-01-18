# Engineering & Design Principles

## 1. Zero Client-Side Logic for Security
- **Rule**: All authentication, authorization, and data fetching must happen on the server.
- **Reason**: We cannot trust the client. Centralizing logic on the server reduces the attack surface and ensures consistent policy enforcement.
- **Implementation**: use `async/await` in Server Components. Use Server Actions for mutations.

## 2. No Separate Backend Service
- **Rule**: The Next.js application *is* the backend.
- **Reason**: Reduces complexity, deployment overhead, and latency. Next.js App Router capabilities are sufficient for our needs.
- **Implementation**: Connect directly to databases/APIs from Server Components/Actions.

## 3. Mantine over Tailwind
- **Rule**: Use Mantine components and styling system. Do not use Tailwind CSS.
- **Reason**: We prioritize reusable, accessible, and consistent UI components over custom styling flexibility. Mantine provides a robust component library out of the box.
- **Implementation**: Import functionality from `@mantine/core`. Use `style` props or CSS modules if absolutely necessary, but prefer Mantine's built-in styles.

## 4. SSR-First
- **Rule**: Render as much as possible on the server.
- **Reason**: Performance, SEO (for public pages), and security.
- **Implementation**: Components are server components by default. Add `'use client'` only when interactivity (state, effects, event listeners) is strictly required.
