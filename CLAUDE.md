# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ChonCance** is a platform for curating and booking authentic rural vacation experiences (촌캉스) for the MZ generation in Korea. The platform focuses on providing unique local stories and experiences beyond simple accommodation booking, emphasizing healing, relaxation, and SNS-shareable content.

## Common Development Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

The development server runs at `http://localhost:3000`.

### Testing
Currently using Playwright for E2E testing (configured but tests not yet implemented).

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with shadcn/ui components (New York style)
- **Authentication**: NextAuth.js (currently using CredentialsProvider with placeholder logic)
- **Database**: PostgreSQL (planned, using Prisma ORM)
- **Deployment**: Vercel (planned)

## Architecture

### App Structure

This project uses Next.js 14 App Router with the following structure:

```
src/
├── app/                          # App Router pages
│   ├── api/                      # API routes
│   │   └── auth/[...nextauth]/   # NextAuth.js endpoint
│   ├── dashboard/                # User dashboard (requires auth)
│   ├── explore/                  # Browse properties/experiences
│   ├── login/                    # Login page
│   ├── signup/                   # Signup page
│   ├── projects/                 # Projects (legacy - may be migrated)
│   ├── layout.tsx                # Root layout with header/footer
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles with CSS variables
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── project-form-dialog.tsx   # Project management forms
│   └── task-form-dialog.tsx      # Task management forms
├── lib/
│   ├── auth.ts                   # NextAuth.js configuration
│   └── utils.ts                  # Utility functions (cn, etc.)
├── bmad/
│   └── config.ts                 # BMAD-METHOD configuration
└── context7/
    ├── config.ts                 # Context7 configuration (legacy)
    └── types.ts                  # Context7 type definitions
```

### Configuration Files

The project includes configuration for multiple development methodologies:

1. **BMAD-METHOD** (`src/bmad/config.ts`): Defines project structure using the Team Fullstack approach with roles like bmad-orchestrator, analyst, PM, UX expert, architect, and PO.

2. **Context7** (`src/context7/config.ts`): Legacy configuration for ProTask (an earlier iteration). Note that some files still reference "ProTask" and may need migration to ChonCance branding.

### Authentication Flow

- NextAuth.js is configured in `src/lib/auth.ts`
- Currently uses dummy credentials (`test@example.com` / `password`)
- Session strategy: JWT
- Custom sign-in page: `/login`
- Auth-protected pages redirect to `/dashboard` when logged in
- Database adapter for NextAuth.js needs to be configured with Prisma

### UI Components

All UI components use shadcn/ui (New York style) with:
- Path alias: `@/components/ui`
- Tailwind CSS with CSS variables for theming
- Icon library: lucide-react
- Color scheme: HSL-based with CSS custom properties

### Path Aliases

TypeScript is configured with the following path alias:
- `@/*` → `./src/*`

Use this consistently throughout the codebase (e.g., `@/components/ui/button`).

## Database Schema (Planned)

Per the PRD and TASK.md, the database should include:

- **User**: End users (travelers)
- **Host**: Property/experience providers
- **Property**: Accommodation listings
- **Experience**: Activity offerings
- **Booking**: Reservation records
- **Review**: User reviews with photo uploads
- **Tag**: Filtering tags (#반려동물동반, #아궁이체험, etc.)
- **Theme**: Curation themes (#논뷰맛집, #불멍과별멍, etc.)

Database connection and Prisma schema are not yet implemented.

## Important Notes

### Branding Migration
Some files still reference "ProTask" (an earlier project iteration). When working on these files, update branding to "ChonCance" for consistency:
- Landing page hero text (src/app/page.tsx)
- Context7 config (src/context7/config.ts)

### Language
- The platform targets Korean users (MZ generation)
- UI text should be in Korean (ko)
- The HTML lang attribute is set to "ko"

### Design Philosophy
Per the PRD, ChonCance emphasizes:
- Minimalist, refined design with whitespace
- Lyrical typography conveying a "slow" aesthetic
- High-quality visual content (photos, short videos)
- Honest portrayal of rural experiences (including "inconveniences")
- Story-centric content over spec listings

### Feature Priorities (MVP)
According to TASK.md, prioritize:
1. Theme-based discovery with emotional tags
2. Story-focused detail pages (host narratives)
3. Simple booking system (accommodation + optional experiences)
4. Photo-centric reviews and wishlist functionality

## Reference Documents

- **PRD.md**: Complete product requirements and feature specifications
- **PLAN.md**: 6-week development roadmap
- **TASK.md**: Detailed task breakdown by week
- **GEMINI.md**: Previous AI assistant context (includes Auth0 credentials)
