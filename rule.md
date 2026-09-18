# Project Guidelines & Rules

This document defines the coding standards and architecture rules for this Next.js project.

## Project Structure
- pp/: Contains the Next.js App Router structure, grouped by route groups:
  - (auth): Authentication-related pages and routes.
  - (dashboard): Core application features, protected routes.
  - (public): Public-facing landing pages.
- components/: UI components and domain-specific logic.
  - ui/: Shared, reusable UI components (shadcn/ui).
  - production-codes/: Domain logic related to production codes.
  - SPK/: Domain logic related to SPK (Surat Perintah Kerja).
- ctions/: Server Actions for handling form submissions, API requests, and data mutations.
- lib/: Utility functions, configuration, and shared logic.
- prisma/: Database schema, migrations, and seeds.

## Core Technologies
- **Framework**: Next.js 16+ (App Router).
- **Styling**: Tailwind CSS v4.
- **UI Library**: shadcn/ui.
- **Database**: PostgreSQL with Prisma ORM.
- **Forms/Validation**: Server Actions.
- **Runtime**: Node.js 20+.

## Coding Standards
- **TypeScript**: Always use strong typing. Avoid ny.
- **Server Actions**: Define in ctions/ directory, imported into Server Components.
- **Components**:
  - Prefer React Server Components (RSC) by default.
  - Use use client only when interactivity is required (state, effects, event handlers).
  - Keep components modular and single-purpose.
- **Naming Conventions**:
  - Components: PascalCase (TableFilterBar.tsx).
  - Functions/Files: camelCase or kebab-case as appropriate.
- **Imports**: Use clean, absolute paths where possible (e.g., @/components/...).

## Workflow
- **Check AGENTS.md**: Before modifying core code, check if there are specific instructions.
- **Database Changes**: Always update prisma/schema.prisma first, then run 
px prisma generate and/or prisma migrate dev.
- **Styling**: Use Tailwind utility classes.
- **Deployment**: Next.js is configured with standard 
ext build and 
ext start scripts.

## Important
- The repository uses specific 
ext versions. Ensure compatibility before adding/updating dependencies.
- Keep globals.css focused on global base styles. Use CSS Modules or Tailwind classes for component-specific styles.
