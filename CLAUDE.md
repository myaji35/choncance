# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Language

**항상 한글로 대화해주세요.** All communication with the user should be in Korean (한국어).

## Project Overview

**VINTEE** is a platform for curating and booking authentic rural vacation experiences (VINTEE) for the MZ generation in Korea. The platform focuses on providing unique local stories and experiences beyond simple accommodation booking, emphasizing healing, relaxation, and SNS-shareable content.

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

# Run Playwright tests (when implemented)
npx playwright test

# Run Playwright tests in UI mode
npx playwright test --ui
```

The development server runs at `http://localhost:3000`.

### Testing
Playwright 1.56+ is configured for E2E testing. Tests are not yet implemented but the framework is ready.

## Tech Stack

- **Framework**: Next.js 14 with App Router (Server Components by default)
- **Language**: TypeScript 5.x with strict mode enabled
- **Styling**: Tailwind CSS 3.4+ with shadcn/ui components (New York style)
- **UI Components**: shadcn/ui built on Radix UI primitives with lucide-react icons
- **Forms**: react-hook-form 7.x with Zod 4.x validation
- **Authentication**: NextAuth.js 4.x (currently using CredentialsProvider with placeholder logic)
- **Database**: PostgreSQL (planned, using Prisma ORM - not yet configured)
- **Testing**: Playwright 1.56+ (configured but tests not yet implemented)
- **Deployment**: Vercel (planned)

## Architecture

### App Structure

This project uses Next.js 14 App Router with the following structure:

```
src/
├── app/                          # App Router pages
│   ├── api/                      # API routes
│   │   └── auth/[...nextauth]/   # NextAuth.js endpoint
│   ├── booking/[id]/             # Booking detail page
│   ├── dashboard/                # User dashboard (requires auth)
│   ├── explore/                  # Browse properties/experiences
│   ├── login/                    # Login page
│   ├── property/[id]/            # Property detail page
│   ├── signup/                   # Signup page
│   ├── projects/                 # Projects (legacy - may be migrated)
│   ├── fonts/                    # Font files (GeistVF, GeistMonoVF)
│   ├── layout.tsx                # Root layout with header/footer
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles with CSS variables
│   └── favicon.ico               # Favicon
├── components/
│   ├── ui/                       # shadcn/ui components (DO NOT EDIT - regenerate instead)
│   ├── project-form-dialog.tsx   # Project management forms (legacy)
│   └── task-form-dialog.tsx      # Task management forms (legacy)
├── lib/
│   ├── auth.ts                   # NextAuth.js configuration
│   └── utils.ts                  # Utility functions (cn for Tailwind class merging)
├── bmad/
│   └── config.ts                 # BMAD-METHOD configuration
└── context7/
    ├── config.ts                 # Context7 configuration (legacy - references ProTask)
    └── types.ts                  # Context7 type definitions
```

### Configuration Files

The project includes configuration for multiple development methodologies:

1. **BMAD-METHOD** (`src/bmad/config.ts`): Defines project structure using the Team Fullstack approach with roles like bmad-orchestrator, analyst, PM, UX expert, architect, and PO.

2. **Context7** (`src/context7/config.ts`): Legacy configuration for ProTask (an earlier iteration). Note that some files still reference "ProTask" and may need migration to VINTEE branding.

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

TypeScript and shadcn/ui are configured with the following path aliases:
- `@/*` → `./src/*` (general imports)
- `@context/*` → `./src/context/*` (context-specific imports)
- `@/components` → Component directory
- `@/lib/utils` → Utility functions
- `@/components/ui` → UI components
- `@/lib` → Library directory
- `@/hooks` → Custom React hooks (when created)

Always use the `@/` alias for imports rather than relative paths, except for imports within the same directory (e.g., `@/components/ui/button`, not `../../../components/ui/button`).

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
Some files still reference "ProTask" (an earlier project iteration). When working on these files, update branding to "VINTEE" for consistency:
- Landing page hero text (src/app/page.tsx)
- Context7 config (src/context7/config.ts)

### Language
- The platform targets Korean users (MZ generation)
- UI text should be in Korean (ko)
- The HTML lang attribute is set to "ko"

### Design Philosophy
Per the PRD, VINTEE emphasizes:
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

### Implemented Features

**Epic 1: Discovery & Exploration**
- ✅ Story 1.1: Theme-Based Discovery UI (`/explore` page with tag categories)
- ✅ Story 1.2: Property Detail Page (`/property/[id]` with host stories, tags, amenities, and related properties)
- ✅ Story 007: Tag System - Full integration with 16 tags across 4 categories (VIEW, ACTIVITY, FACILITY, VIBE)
- ✅ Tag-Based Filtering - Click tags to filter properties (`/explore?tag=태그명`)
- ✅ Text Search - Search properties by name, description, address, or tags (`/explore?search=검색어`)

**Epic 2: Booking System (In Progress)**
- ✅ Database Models - Booking, BookingItem, Calendar, Payment, PaymentTransaction models
- ⏳ Booking API - Availability check, booking creation, payment integration
- ⏳ Booking UI - Date picker, booking widget, checkout flow
- ⏳ Payment Integration - Toss Payments integration

**Authentication**
- ✅ Clerk authentication with Korean localization
- ✅ Login/Signup pages with catch-all routing (`/login/[[...rest]]`, `/signup/[[...rest]]`)
- ✅ Protected routes via middleware

**Components**
- ✅ SearchBar component with tag-based search and text search functionality
- ✅ TagBadge and TagList components with category-based color styling
- ✅ PropertyCard with tags, price, and image display
- ✅ PropertyGallery component for property images
- ✅ ThemeSection components for tag categories
- ✅ shadcn/ui components (Button, Badge, Card, Input, Tabs, Label, Textarea)

**Backend API (Next.js API Routes)**
- ✅ Tag API (`GET /api/tags`) with category filtering
- ✅ Property API (`GET /api/properties`, `GET /api/properties/[id]`) with tag filtering
- ⏳ Booking API (`POST /api/bookings`, `GET /api/bookings`, `GET /api/bookings/[id]`)
- ⏳ Availability API (`GET /api/availability/check`, `GET /api/availability/calendar/:propertyId`)
- ⏳ Payment API (`POST /api/payments/confirm`, `GET /api/payments/:bookingId`)

**Database (PostgreSQL via Prisma)**
- ✅ Core models: User, HostProfile, Property, Tag, Experience
- ✅ Booking models: Booking, BookingItem, Calendar, Payment, PaymentTransaction
- ✅ PM Tools models: PMProject, PRD, Epic, Story, Requirements, etc.
- ✅ Seed data: 16 tags, 3 test properties with tags

## Code Quality Standards

### Server vs Client Components
- **Server Components** are the default in Next.js App Router
- Only add `"use client"` directive when you need:
  - Interactive event handlers (onClick, onChange, etc.)
  - Browser-only APIs (useState, useEffect, localStorage, etc.)
  - Third-party libraries that require client-side execution
- Keep Server Components at the top of the component tree for better performance

### Styling Best Practices
- Use Tailwind utility classes for styling
- Use the `cn()` utility from `@/lib/utils` for conditional class names
- Prefer CSS variables from `globals.css` for colors (e.g., `hsl(var(--primary))`)
- Avoid inline styles and hardcoded colors

### File Naming Conventions
- Component files: kebab-case (e.g., `property-card.tsx`)
- Exported component names: PascalCase (e.g., `PropertyCard`)
- Utility files: kebab-case (e.g., `api-client.ts`)
- Hook files: kebab-case with `use-` prefix (e.g., `use-auth.ts`)

### Form Handling Pattern
All forms should use react-hook-form with Zod validation:
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({ /* ... */ });
type FormData = z.infer<typeof formSchema>;

const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
});
```

## Documentation Reference

### Project Documents
- **PRD.md**: Complete product requirements and feature specifications
- **PLAN.md**: 6-week development roadmap
- **TASK.md**: Detailed task breakdown by week
- **GEMINI.md**: Previous AI assistant context (includes Auth0 credentials)

### Architecture Documentation (in `docs/architecture/`)
- **tech-stack.md**: Detailed technology stack and rationale
- **coding-standards.md**: Comprehensive coding standards and best practices
- **source-tree.md**: Complete source tree structure and organization
- **pm-tools-architecture.md**: PM Tools system architecture and implementation
- **booking-system-architecture.md**: Booking System architecture with ERD, API design, and workflows

### User Stories (in `docs/stories/`)
Story files in YAML format for feature development:
- **1.1.theme-discovery-ui.md**: Theme-based discovery interface
- **1.2.property-detail-page.md**: Property detail page implementation
