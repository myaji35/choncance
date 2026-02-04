## Project Overview

This project is "ChonCance", a platform for curating and booking authentic rural vacation experiences for the MZ generation. It focuses on providing unique local stories and experiences (activities, people, culture) beyond simple accommodation booking.

*   **Objective**: To provide unique and authentic rural vacation experiences for the MZ generation, focusing on healing, relaxation, and self-expression through SNS-shareable content.
*   **Target Audience**: Primarily MZ generation (late 20s - 30s) seeking healing from urban stress and unique experiences to share on social media. Extended targets include workation seekers and families desiring nature-friendly rural experiences.
*   **Key Features (MVP)**:
    *   Theme-based experience discovery (curation, tag-based filtering, high-quality visual content).
    *   Story-centric detail pages (host stories, detailed experience info, honest portrayal of "slow and inconvenient" charm).
    *   Easy booking and payment system (flexible booking, intuitive calendar UI, secure online payment).
    *   Community and authentication system (email/social login, photo-centric reviews, wishlist).
*   **Non-functional Requirements**:
    *   **UI/UX**: Minimalist and refined design using shadcn/ui, conveying a "slow" aesthetic.
    *   **Performance**: Fast loading with Next.js 14 server components and image optimization.
    *   **Responsive Web**: Optimized for all devices (mobile, tablet, desktop) using Tailwind CSS.
    *   **Scalability**: Flexible database schema and architecture for future service expansion.
*   **Tech Stack**:
    *   Framework: Next.js 14 (App Router)
    *   UI: Tailwind CSS, shadcn/ui
    *   Database: PostgreSQL
    *   ORM (Recommended): Prisma or Drizzle ORM
    *   Authentication (Recommended): NextAuth.js
    *   Deployment (Recommended): Vercel

## Gemini Added Memories
- The user has provided the Auth0 Client ID. I still need the Auth0 Domain and Auth0 Client Secret to complete the integration.
- The user's Auth0 Domain is dev-4okfzkn0rlzo7zrj.au.auth0.com
- The user's Auth0 API Audience is https://dev-4okfzkn0rlzo7zrj.au.auth0.com/api/v2/

## BMAD-METHOD Integration

The project will adopt the BMAD-METHOD, specifically the "Team Fullstack" approach, to guide its development processes and team organization.

**Team Fullstack Overview:**
*   **Purpose:** To provide a team capable of full-stack, front-end only, or service development.
*   **Key Agents/Roles:** The methodology defines key roles such as `bmad-orchestrator`, `analyst`, `pm` (Project Manager), `ux-expert`, `architect`, and `po` (Product Owner). These roles will inform the structure and responsibilities within the project's development team.
*   **Workflows:** The BMAD-METHOD includes various workflows for both `brownfield` (existing projects) and `greenfield` (new projects) development, covering full-stack, service, and UI aspects. These workflows will serve as a blueprint for how features are developed and integrated into the "ChonCance" platform.

This integration ensures a structured approach to development, aligning team roles and processes with the project's technical and functional requirements.