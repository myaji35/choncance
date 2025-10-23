# Coding Standards

## General Principles

1. **Write code for humans first, machines second** - Prioritize readability and maintainability
2. **Follow the principle of least surprise** - Code should behave as expected
3. **DRY (Don't Repeat Yourself)** - But don't over-abstract prematurely
4. **YAGNI (You Aren't Gonna Need It)** - Don't build features before they're needed
5. **Prefer composition over inheritance** - Use React composition patterns

## TypeScript Standards

### Type Safety
```typescript
// ✅ GOOD: Explicit types for function parameters and returns
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ BAD: Implicit any types
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### Avoid `any`
```typescript
// ✅ GOOD: Use proper types or unknown
function handleData(data: unknown): void {
  if (isValidData(data)) {
    processData(data);
  }
}

// ❌ BAD: Using any defeats TypeScript's purpose
function handleData(data: any): void {
  processData(data);
}
```

### Type Imports
```typescript
// ✅ GOOD: Use type imports for types
import type { Metadata } from "next";
import { getServerSession } from "next-auth";

// ❌ AVOID: Mixing type and value imports when possible
import { Metadata, getServerSession } from "next";
```

## React & Next.js Standards

### Component Structure

```typescript
// ✅ GOOD: Server Component (default in App Router)
export default async function PropertyPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id);

  return (
    <div>
      <PropertyDetails property={property} />
    </div>
  );
}

// ✅ GOOD: Client Component (when needed)
"use client";

import { useState } from "react";

export function InteractiveMap({ coordinates }: { coordinates: Coordinates }) {
  const [zoom, setZoom] = useState(10);
  // ... interactive logic
}
```

### Server Components First
- Use Server Components by default
- Only add `"use client"` when needed for:
  - Event handlers (onClick, onChange, etc.)
  - Browser APIs (useState, useEffect, etc.)
  - Third-party libraries requiring client-side

### File Naming
```
✅ GOOD:
- property-card.tsx (component files)
- use-auth.ts (hooks)
- api-client.ts (utilities)
- PropertyDetails (exported component name)

❌ BAD:
- PropertyCard.tsx (PascalCase files)
- property_card.tsx (snake_case files)
- property-card.jsx (use .tsx for TypeScript)
```

### Component Organization
```typescript
// ✅ GOOD: Organized component structure
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PropertyCardProps {
  property: Property;
  onFavorite?: (id: string) => void;
}

export function PropertyCard({ property, onFavorite }: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite?.(property.id);
  };

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

## Styling Standards

### Tailwind CSS Usage

```typescript
// ✅ GOOD: Semantic class grouping
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
  <p className="text-gray-600">Description</p>
</div>

// ✅ GOOD: Use cn() utility for conditional classes
import { cn } from "@/lib/utils";

<Button className={cn(
  "w-full",
  isPrimary && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  Click Me
</Button>
```

### CSS Variables
```css
/* ✅ GOOD: Use semantic CSS variables from globals.css */
.custom-element {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

/* ❌ AVOID: Hardcoded colors */
.custom-element {
  background-color: #10b981;
  color: white;
}
```

## Data Fetching

### Server Components (Preferred)
```typescript
// ✅ GOOD: Fetch in Server Components
export default async function PropertiesPage() {
  const properties = await fetch('https://api.example.com/properties', {
    next: { revalidate: 3600 } // ISR with 1-hour cache
  }).then(res => res.json());

  return <PropertiesList properties={properties} />;
}
```

### Server Actions
```typescript
// ✅ GOOD: Use Server Actions for mutations
"use server";

import { revalidatePath } from "next/cache";

export async function createBooking(formData: FormData) {
  const booking = {
    propertyId: formData.get("propertyId"),
    checkIn: formData.get("checkIn"),
    // ...
  };

  await db.booking.create({ data: booking });
  revalidatePath("/bookings");

  return { success: true };
}
```

## Error Handling

```typescript
// ✅ GOOD: Proper error handling with types
try {
  const data = await fetchProperty(id);
  return data;
} catch (error) {
  if (error instanceof PropertyNotFoundError) {
    notFound(); // Next.js 404
  }
  throw error; // Trigger error boundary
}

// ✅ GOOD: Error boundaries for client components
"use client";

export function PropertyDetails({ property }: Props) {
  if (!property) {
    throw new Error("Property not found");
  }
  // render property
}
```

## Path Aliases

```typescript
// ✅ GOOD: Use @ alias for src imports
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authOptions } from "@/lib/auth";

// ❌ AVOID: Relative paths for cross-directory imports
import { Button } from "../../../components/ui/button";
```

## Form Handling

```typescript
// ✅ GOOD: react-hook-form with Zod validation
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const bookingSchema = z.object({
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number().min(1).max(10),
});

type BookingForm = z.infer<typeof bookingSchema>;

export function BookingForm() {
  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data: BookingForm) => {
    // Handle submission
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

## Naming Conventions

### Variables & Functions
```typescript
// ✅ GOOD: Descriptive camelCase
const userBookings = await getUserBookings(userId);
const isAuthenticated = checkAuth();

function calculateBookingTotal(booking: Booking): number { }

// ❌ BAD: Unclear abbreviations
const usrBks = await getUsrBks(uid);
const isAuth = chkAuth();
```

### Constants
```typescript
// ✅ GOOD: SCREAMING_SNAKE_CASE for true constants
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_LOCALE = "ko";

// ✅ GOOD: camelCase for config objects
const paginationConfig = {
  defaultPageSize: 20,
  maxPageSize: 100,
};
```

### Components
```typescript
// ✅ GOOD: PascalCase for component names
export function PropertyCard() { }
export function UserAvatar() { }

// ❌ BAD: camelCase for components
export function propertyCard() { }
```

## Comments & Documentation

```typescript
// ✅ GOOD: JSDoc for public APIs
/**
 * Calculates the total cost of a booking including fees.
 *
 * @param booking - The booking details
 * @param includeTax - Whether to include tax in calculation
 * @returns Total cost in KRW
 */
export function calculateTotal(booking: Booking, includeTax = true): number {
  // Implementation
}

// ✅ GOOD: Explain "why" not "what"
// Use memoization here because calculateDistance is expensive
// and coordinates rarely change after initial render
const distance = useMemo(() => calculateDistance(coords), [coords]);

// ❌ BAD: Obvious comments
// Set the user ID
const userId = user.id;
```

## Code Organization

### File Structure
```
src/
├── app/
│   ├── (auth)/              # Route group for auth pages
│   │   ├── login/
│   │   └── signup/
│   ├── (public)/            # Route group for public pages
│   │   ├── explore/
│   │   └── property/[id]/
│   └── dashboard/           # Protected routes
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── property/            # Domain-specific components
│   │   ├── property-card.tsx
│   │   ├── property-filters.tsx
│   │   └── property-gallery.tsx
│   └── layout/              # Layout components
│       ├── header.tsx
│       └── footer.tsx
├── lib/
│   ├── auth.ts              # Auth configuration
│   ├── db.ts                # Database client
│   ├── utils.ts             # Utility functions
│   └── validations/         # Zod schemas
│       ├── booking.ts
│       └── property.ts
└── types/
    └── index.ts             # Shared type definitions
```

## Korean Language Standards

### UI Text
- All user-facing text must be in Korean
- Use formal polite form (존댓말) for UI messages
- Maintain consistent terminology across the app

```typescript
// ✅ GOOD
<Button>예약하기</Button>
<p>숙소를 찾을 수 없습니다.</p>

// ❌ BAD: Mixing Korean and English
<Button>예약 Book</Button>
<p>Property를 찾을 수 없습니다.</p>
```

### Code Comments
- Technical comments can be in English or Korean
- Choose one language per file for consistency
- Korean preferred for business logic explanations

## Performance Best Practices

1. **Optimize Images**: Always use `next/image` with proper sizing
2. **Lazy Load**: Use dynamic imports for heavy components
3. **Memoization**: Use `useMemo`/`useCallback` judiciously (not by default)
4. **Server Components**: Fetch data on server when possible
5. **Streaming**: Use Suspense boundaries for progressive rendering

## Security Standards

1. **Never commit secrets**: Use environment variables
2. **Validate all inputs**: Use Zod for runtime validation
3. **Sanitize user content**: Escape HTML in user-generated content
4. **Use HTTPS**: Enforce in production
5. **CSRF protection**: NextAuth handles this automatically

## Accessibility

1. **Semantic HTML**: Use proper elements (`<button>`, `<nav>`, etc.)
2. **ARIA labels**: Use when semantic HTML insufficient
3. **Keyboard navigation**: Ensure all interactive elements are keyboard-accessible
4. **Color contrast**: Follow WCAG AA standards (shadcn/ui does this by default)
5. **Focus indicators**: Don't remove focus outlines

## Git Commit Standards

```bash
# ✅ GOOD: Clear, descriptive commits
feat: add property search with filters
fix: resolve booking date overlap validation
docs: update architecture documentation
refactor: extract booking logic into separate service

# ❌ BAD: Vague commits
update stuff
fix bug
wip
```

Use conventional commit format: `type: description`
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **refactor**: Code change that neither fixes nor adds a feature
- **test**: Adding or updating tests
- **chore**: Tooling, dependencies, etc.
