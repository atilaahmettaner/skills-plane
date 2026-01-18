# Domain Definitions

## Skill
**Definition**: A discrete, reusable capability or instruction set for an AI agent.
- **Format**: A directory containing a `SKILL.md` file, metadata, and optional resources (scripts, templates).
- **Purpose**: To enable an agent to perform a specific task (e.g., "Deploy to Vercel", "Query Database").

## Rule
**Definition**: A policy or constraint that governs how Skills are authored, used, or shared.
- **Purpose**: To ensure quality, security, and consistency across an organization.
- **Examples**: "All Skills must have a SKILL.md", "No API keys in metadata".

## Workflow
**Definition**: A structured composition of Skills and Rules to achieve a higher-level objective.
- **Structure**: A sequence of steps or a directed graph of actions.
- **Purpose**: To standardize complex processes (e.g., "Onboarding Workflow", "Code Review Process").
