# Source Tree

## Project Root Structure

```
choncance/
├── .bmad-core/              # BMAD methodology configuration
│   ├── core-config.yaml     # Core BMAD project config
│   ├── tasks/               # Reusable task workflows
│   ├── templates/           # Document templates
│   ├── checklists/          # Quality checklists
│   └── data/                # Reference data
├── .claude/                 # Claude Code configuration (if any)
├── .gemini/                 # Gemini AI configuration (if any)
├── .vscode/                 # VS Code workspace settings
├── docs/                    # Project documentation
│   ├── architecture/        # Architecture documentation (sharded)
│   │   ├── coding-standards.md
│   │   ├── tech-stack.md
│   │   └── source-tree.md (this file)
│   ├── prd/                 # Product requirements (sharded)
│   ├── qa/                  # QA reports and feedback
│   └── stories/             # User stories for development
├── node_modules/            # npm dependencies (gitignored)
├── public/                  # Static assets served from root
│   └── (images, fonts, etc.)
├── src/                     # Source code (all application code)
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── lib/                 # Utilities and configurations
│   ├── bmad/                # BMAD integration
│   └── context7/            # Legacy Context7 config
├── .gitignore               # Git ignore rules
├── CLAUDE.md                # Claude Code guidance document
├── components.json          # shadcn/ui configuration
├── GEMINI.md                # Gemini AI context (legacy)
├── next.config.js           # Next.js configuration
├── package.json             # npm dependencies and scripts
├── package-lock.json        # npm lock file
├── PLAN.md                  # 6-week project plan
├── playwright.config.ts     # Playwright test configuration
├── PRD.md                   # Product Requirements Document
├── README.md                # Project readme
├── tailwind.config.ts       # Tailwind CSS configuration
├── TASK.md                  # Detailed task breakdown
├── tsconfig.json            # TypeScript configuration
└── .vscode-upload.json      # VS Code upload config
```

## Source Directory (`src/`)

### App Router (`src/app/`)

Next.js 14 App Router with file-based routing. Each folder represents a route.

```
src/app/
├── api/                           # API Routes
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts           # NextAuth.js endpoint
├── dashboard/
│   └── page.tsx                   # /dashboard - User dashboard (auth required)
├── explore/
│   └── page.tsx                   # /explore - Browse properties/experiences
├── login/
│   └── page.tsx                   # /login - Login page
├── signup/
│   └── page.tsx                   # /signup - Signup page
├── projects/                      # Legacy routes (may be refactored)
│   ├── [id]/
│   │   └── page.tsx               # /projects/:id - Project detail
│   └── page.tsx                   # /projects - Projects list
├── fonts/                         # Font files
│   ├── GeistVF.woff
│   └── GeistMonoVF.woff
├── favicon.ico                    # Favicon
├── globals.css                    # Global CSS (Tailwind + custom variables)
├── layout.tsx                     # Root layout (header, footer, providers)
└── page.tsx                       # / - Landing page
```

#### Routing Conventions

- **`page.tsx`**: Defines a page/route
- **`layout.tsx`**: Wraps pages with shared UI
- **`loading.tsx`**: Loading UI (Suspense boundary)
- **`error.tsx`**: Error UI (Error boundary)
- **`not-found.tsx`**: 404 UI
- **`route.ts`**: API route handler
- **`[param]/`**: Dynamic route segment
- **`(group)/`**: Route group (doesn't affect URL)

### Components (`src/components/`)

Reusable React components organized by domain.

```
src/components/
├── ui/                            # shadcn/ui primitives (do not edit directly)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── label.tsx
│   └── sheet.tsx
├── project-form-dialog.tsx        # Project creation/edit form (legacy)
└── task-form-dialog.tsx           # Task creation/edit form (legacy)
```

#### Component Organization Guidelines

**Current State**: Components are currently flat in this directory.

**Recommended Future Structure**:
```
src/components/
├── ui/                    # shadcn/ui primitives
├── layout/                # Layout components
│   ├── header.tsx
│   ├── footer.tsx
│   └── navigation.tsx
├── property/              # Property-related components
│   ├── property-card.tsx
│   ├── property-gallery.tsx
│   ├── property-filters.tsx
│   └── property-map.tsx
├── booking/               # Booking components
│   ├── booking-form.tsx
│   ├── booking-calendar.tsx
│   └── booking-summary.tsx
├── experience/            # Experience components
├── review/                # Review components
└── theme/                 # Theme/curation components
```

### Library (`src/lib/`)

Utility functions, configurations, and shared logic.

```
src/lib/
├── auth.ts                # NextAuth.js configuration
│                          # - authOptions export
│                          # - Providers: CredentialsProvider (dummy)
│                          # - Session strategy: JWT
│                          # - Callbacks: jwt, session
└── utils.ts               # Utility functions
                           # - cn() - Tailwind class merging utility
```

#### Future Library Structure

```
src/lib/
├── auth.ts                # Authentication config
├── db.ts                  # Prisma client instance
├── utils.ts               # General utilities
├── validations/           # Zod validation schemas
│   ├── booking.ts
│   ├── property.ts
│   ├── review.ts
│   └── user.ts
├── api/                   # API client utilities
│   ├── client.ts
│   └── endpoints.ts
└── constants/             # App constants
    ├── themes.ts
    └── tags.ts
```

### BMAD Integration (`src/bmad/`)

BMAD-METHOD configuration for structured development.

```
src/bmad/
└── config.ts              # BMAD project configuration
                           # - Project name: ChonCance
                           # - Database: PostgreSQL + Prisma
                           # - Auth: NextAuth.js
```

### Context7 (Legacy) (`src/context7/`)

Legacy configuration from earlier project iteration (ProTask).

```
src/context7/
├── config.ts              # Context7 project config (references ProTask)
└── types.ts               # Context7 type definitions
```

**Note**: These files reference "ProTask" and should be updated or removed as ChonCance evolves.

## Type System (`src/types/`)

**Status**: Not yet created

**Recommended Structure**:
```
src/types/
├── index.ts               # Re-export all types
├── models.ts              # Database model types (from Prisma)
├── api.ts                 # API request/response types
└── ui.ts                  # UI-specific types
```

## Documentation (`docs/`)

Structured project documentation following BMAD methodology.

```
docs/
├── architecture/          # Architecture documentation (v4, sharded)
│   ├── coding-standards.md
│   ├── tech-stack.md
│   └── source-tree.md
├── prd/                   # Product Requirements (v4, sharded)
│   └── (PRD shards when created)
├── qa/                    # Quality assurance reports
│   └── (QA reports)
└── stories/               # User stories for development
    └── (Story files in YAML format)
```

## Configuration Files

### Next.js (`next.config.js`)
- Framework configuration
- Image domains
- Redirects/rewrites
- Environment variables

### TypeScript (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]   // Path alias for imports
    },
    "strict": true,        // Strict type checking
    "jsx": "preserve",     // JSX for Next.js
    // ...
  }
}
```

### Tailwind CSS (`tailwind.config.ts`)
- Design tokens (colors, spacing, etc.)
- Custom theme extensions
- Plugin configuration
- Content paths for purging

### shadcn/ui (`components.json`)
```json
{
  "style": "new-york",     // Component style
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true   // Use CSS variables
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Playwright (`playwright.config.ts`)
- E2E test configuration
- Browser settings
- Test directories

### Package Management (`package.json`)
```json
{
  "name": "choncance",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": { /* ... */ },
  "devDependencies": { /* ... */ }
}
```

## Key Path Patterns

### Import Paths
```typescript
// Absolute imports using @ alias
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authOptions } from "@/lib/auth";

// Relative imports (avoid for cross-directory)
import { Header } from "./header";
```

### Route Paths
```typescript
// App Router pages
/                          → src/app/page.tsx
/login                     → src/app/login/page.tsx
/explore                   → src/app/explore/page.tsx
/dashboard                 → src/app/dashboard/page.tsx
/projects                  → src/app/projects/page.tsx
/projects/[id]             → src/app/projects/[id]/page.tsx

// API Routes
/api/auth/[...nextauth]    → src/app/api/auth/[...nextauth]/route.ts
```

### Static Assets
```typescript
// Public directory (served from root)
/logo.png                  → public/logo.png
/images/hero.jpg           → public/images/hero.jpg

// Usage in components
<Image src="/logo.png" alt="Logo" width={200} height={50} />
```

## Development Workflow Paths

### Story Development
1. Story created: `docs/stories/story-xxx.yaml`
2. Code implemented: `src/app/`, `src/components/`, etc.
3. Tests added: (Future: `src/__tests__/` or colocated)
4. QA report: `docs/qa/story-xxx-qa.md`

### Documentation Updates
1. PRD updates: `docs/prd/` (sharded)
2. Architecture updates: `docs/architecture/` (sharded)
3. Debug logs: `.ai/debug-log.md`

## Important Notes

### What to Edit
- ✅ `src/app/` - Add routes, pages, layouts
- ✅ `src/components/` - Create/modify components (except `ui/` which is from shadcn)
- ✅ `src/lib/` - Add utilities, configs
- ✅ `docs/` - Update documentation
- ✅ Config files - Adjust as needed

### What NOT to Edit
- ❌ `node_modules/` - Managed by npm
- ❌ `.next/` - Build output (gitignored)
- ❌ `src/components/ui/` - shadcn components (regenerate instead)

### Migration Needed
- `/projects` routes - Legacy from ProTask, may need refactoring
- `src/context7/` - Legacy config, references ProTask
- Root-level MD files - Consider moving to `docs/`

## Environment Files

**Status**: Not yet created

**Recommended**:
```
.env.local              # Local development secrets (gitignored)
.env.example            # Example environment variables (committed)
.env.production         # Production variables (Vercel)
```

**Required Variables**:
```bash
# Database
DATABASE_URL=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# OAuth Providers (when added)
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Build Artifacts (Gitignored)

```
.next/                  # Next.js build output
node_modules/           # npm dependencies
.env.local              # Local environment variables
.DS_Store               # macOS
*.log                   # Log files
```
