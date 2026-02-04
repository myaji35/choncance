# Tech Stack

## Overview

ChonCance uses a modern, full-stack JavaScript/TypeScript architecture optimized for performance, developer experience, and scalability.

## Core Technologies

### Frontend Framework
- **Next.js 14** (App Router)
  - Server Components for optimal performance
  - React Server Actions for data mutations
  - Built-in image optimization with `next/image`
  - File-based routing in `src/app/`
  - Streaming and Suspense support

### Language
- **TypeScript 5.x**
  - Strict mode enabled
  - Type safety across the entire application
  - Path aliases configured (`@/*` → `./src/*`)

### Styling & UI
- **Tailwind CSS 3.4+**
  - Utility-first CSS framework
  - Custom configuration with CSS variables
  - JIT (Just-In-Time) compilation
  - `tailwindcss-animate` for animations

- **shadcn/ui** (New York style)
  - Accessible, unstyled components
  - Built on Radix UI primitives
  - Customizable with Tailwind CSS
  - Components: Button, Card, Dialog, Dropdown Menu, Form, Input, Label, Sheet
  - Icon library: **lucide-react**

### State Management
- React Server Components (default)
- React Context for client-side state (when needed)
- URL state via Next.js router

### Forms & Validation
- **react-hook-form** 7.x
  - Type-safe form handling
  - Minimal re-renders
- **zod** 4.x
  - Runtime type validation
  - Schema-based validation
- **@hookform/resolvers** for Zod integration

## Backend & Data

### Database
- **PostgreSQL**
  - Primary data store
  - Hosted on Vercel Postgres (recommended)
  - Not yet configured (planned)

### ORM
- **Prisma** (recommended, not yet configured)
  - Type-safe database client
  - Schema-first development
  - Migration management
  - Alternative: Drizzle ORM

### Authentication
- **NextAuth.js 4.x**
  - JWT session strategy
  - Current providers: CredentialsProvider (dummy auth)
  - Planned providers: Kakao, Google OAuth
  - Custom sign-in page: `/login`
  - Auth configuration: `src/lib/auth.ts`

### API Layer
- Next.js API Routes (App Router)
  - `src/app/api/` directory
  - Currently: `/api/auth/[...nextauth]` for NextAuth

## Development Tools

### Code Quality
- **ESLint 8**
  - Next.js config (`eslint-config-next`)
  - Enforces code standards
- **Prettier** (recommended, not yet configured)

### Testing
- **Playwright 1.56+**
  - E2E testing framework
  - Configured but tests not yet implemented
  - Run with: `npx playwright test`

### Package Manager
- **npm**
  - Lock file: `package-lock.json`

## Deployment

### Platform
- **Vercel** (recommended, not yet deployed)
  - Zero-config deployment
  - Automatic HTTPS
  - Edge network CDN
  - Environment variables
  - Preview deployments

### Build Output
- Static & Server-rendered pages
- API routes as serverless functions
- Optimized assets

## Design Philosophy

### Performance Priorities
1. Server Components by default (zero client JS where possible)
2. Image optimization with `next/image`
3. Code splitting and lazy loading
4. Edge caching via Vercel

### Developer Experience
1. Type safety everywhere (TypeScript + Prisma)
2. Fast refresh during development
3. Consistent code style (ESLint)
4. Component reusability (shadcn/ui)

### User Experience
1. Mobile-first responsive design
2. Fast page loads (Server Components, image optimization)
3. Accessible UI components (Radix UI)
4. Progressive enhancement

## Technology Decisions

### Why Next.js 14 App Router?
- Server Components reduce client bundle size
- Built-in performance optimizations
- Excellent DX with file-based routing
- Strong community and ecosystem

### Why shadcn/ui over other component libraries?
- Not a dependency (copy-paste components)
- Full customization control
- Built on accessible Radix primitives
- Tailwind integration

### Why PostgreSQL?
- Robust relational model for bookings/reviews
- ACID compliance for transactions
- Rich ecosystem (Prisma support)
- Vercel Postgres integration

### Why Tailwind CSS?
- Aligns with minimalist design philosophy
- Fast iteration with utility classes
- Consistent design system via config
- Excellent VS Code support

## Future Considerations

### Planned Additions
- **Prisma ORM** setup and migration
- **OAuth providers** (Kakao, Google)
- **Image upload** service (Vercel Blob or S3)
- **Payment integration** (TBD)
- **Email service** for notifications (Resend, SendGrid)

### Potential Enhancements
- **React Query** for client-side data fetching
- **Zustand** if complex client state needed
- **Storybook** for component documentation
- **Vitest** for unit testing
- **MSW** for API mocking in tests
