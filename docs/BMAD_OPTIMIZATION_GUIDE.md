# BMAD 프레임워크 최적화 가이드

**컨텍스트 압축 및 효율성 향상을 위한 BMAD-METHOD 설정 가이드**

작성일: 2025-10-28
프로젝트: ChonCance

---

## 📋 목차

1. [BMAD 프레임워크 개요](#bmad-프레임워크-개요)
2. [컨텍스트 최적화 전략](#컨텍스트-최적화-전략)
3. [devLoadAlwaysFiles 최소화](#devloadalwaysfiles-최소화)
4. [재사용 가능한 Tasks 및 Templates](#재사용-가능한-tasks-및-templates)
5. [Codebase Flattener 활용](#codebase-flattener-활용)
6. [실행 방법](#실행-방법)

---

## BMAD 프레임워크 개요

### BMAD란?

**BMAD (Build-Measure-Analyze-Deploy)**는 AI 기반 개발을 위한 프레임워크로, 다음 구성 요소를 포함합니다:

- **Team Structure**: 역할 기반 팀 구조 (Orchestrator, Analyst, PM, UX, Architect, PO)
- **Development Workflow**: 체계적인 개발 프로세스
- **Context Management**: 효율적인 컨텍스트 관리 및 압축

### ChonCance 프로젝트의 BMAD 설정

현재 프로젝트의 BMAD 설정 파일: `src/bmad/config.ts`

```typescript
export const bmadConfig = {
  team: "Team Fullstack",
  roles: [
    "bmad-orchestrator",
    "analyst",
    "pm",
    "ux-expert",
    "architect",
    "po"
  ],
  // ... 기타 설정
};
```

---

## 컨텍스트 최적화 전략

### 왜 컨텍스트 최적화가 필요한가?

AI 모델(Claude 등)은 토큰 제한이 있으며, 프로젝트가 커질수록 컨텍스트 크기가 증가합니다. 효율적인 컨텍스트 관리는:

1. **응답 속도 향상**: 더 적은 토큰으로 더 빠른 응답
2. **비용 절감**: 토큰 사용량 감소로 API 비용 절감
3. **정확도 향상**: 관련 없는 정보 제거로 집중도 향상
4. **확장성**: 대규모 프로젝트에서도 효율적인 작업

### 3단계 최적화 전략

```
1. devLoadAlwaysFiles 최소화
   ↓
2. 재사용 가능한 Tasks/Templates 활용
   ↓
3. Codebase Flattener로 압축
```

---

## devLoadAlwaysFiles 최소화

### 개념

`devLoadAlwaysFiles`는 AI가 항상 로드하는 파일 목록입니다. 이 목록을 최소화하면 기본 컨텍스트 크기가 줄어듭니다.

### 현재 설정 (CLAUDE.md)

ChonCance 프로젝트는 다음 파일들을 기본 컨텍스트로 로드합니다:

```typescript
// 현재 CLAUDE.md에 포함된 내용:
- 프로젝트 개요
- 기술 스택
- 아키텍처 구조
- 코딩 표준
- 주요 문서 참조 (PRD.md, PLAN.md, TASK.md)
```

### 최적화 방법

#### 1. 핵심 정보만 포함

**Before** (비효율적):
```markdown
# CLAUDE.md

## Project Overview
ChonCance is a platform for curating and booking authentic rural vacation experiences...
[1000+ lines of detailed information]

## Tech Stack
[Full technology stack with versions and explanations]

## API Documentation
[Complete API specs]
```

**After** (효율적):
```markdown
# CLAUDE.md

## Quick Reference
- Project: ChonCance (Korean rural vacation platform)
- Stack: Next.js 14 + Prisma + PostgreSQL + Clerk
- Docs: See /docs/architecture/*.md for details

## Common Commands
npm run dev
npm run build

## Key Patterns
- Server Components by default
- Use @/ for imports
- See CODING_STANDARDS.md for details
```

#### 2. 상세 문서는 별도 파일로 분리

```
/docs
├── architecture/
│   ├── tech-stack.md          # 상세 기술 스택
│   ├── coding-standards.md    # 코딩 표준
│   └── api-specs.md           # API 명세
├── stories/
│   └── story-*.md             # User Story 파일
└── guides/
    └── HOST_FEATURES_GUIDE.md # 기능별 가이드
```

**장점**:
- 필요할 때만 특정 파일을 읽어옴
- CLAUDE.md는 "목차" 역할만 수행
- 컨텍스트 크기 70-80% 감소

#### 3. 구현 예시

**CLAUDE.md (최소화 버전)**:

```markdown
# ChonCance Project Guide

## Quick Start
\`\`\`bash
npm run dev  # http://localhost:3000
\`\`\`

## Architecture
- Framework: Next.js 14 App Router
- Database: PostgreSQL (Neon) + Prisma
- Auth: Clerk
- UI: shadcn/ui + Tailwind CSS

Full details: `/docs/architecture/tech-stack.md`

## Key Conventions
- Server Components by default
- Use `@/` for imports
- Follow shadcn/ui patterns

Full standards: `/docs/architecture/coding-standards.md`

## Documentation
- PRD: `/PRD.md`
- Stories: `/docs/stories/story-*.md`
- Guides: `/docs/guides/*.md`

When working on a specific feature, read the relevant story file.
\`\`\`

---

## 재사용 가능한 Tasks 및 Templates

### 개념

반복적인 작업을 템플릿화하여 컨텍스트를 재사용하고 일관성을 유지합니다.

### 구현 방법

#### 1. Story Template 생성

**파일**: `/docs/templates/story-template.md`

```markdown
# Story-XXX: [Title]

**Epic**: Epic X - [Epic Name]
**Story ID**: XXX
**Priority**: P0/P1/P2
**Status**: ⏸️ 대기 / 🔄 진행중 / ✅ 완료

---

## [What] 요구사항

### User Story
AS A [role]
I WANT TO [goal]
SO THAT [value]

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## [How] 기술 구현

### API Endpoints
...

### Database Schema
...

## [Tasks] 구현 작업

### Phase 1: Backend
- [ ] Task 1
- [ ] Task 2

### Phase 2: Frontend
- [ ] Task 3
- [ ] Task 4
```

#### 2. Component Template

**파일**: `/docs/templates/component-template.tsx`

```typescript
"use client"; // if needed

import { ... } from "@/components/ui/...";

interface [ComponentName]Props {
  // Props definition
}

export function [ComponentName]({ ...props }: [ComponentName]Props) {
  // Component logic

  return (
    // JSX
  );
}
```

#### 3. API Route Template

**파일**: `/docs/templates/api-route-template.ts`

```typescript
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // Implementation

    return NextResponse.json({ data: ... });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "요청 처리 실패" },
      { status: 500 }
    );
  }
}
```

### 사용 방법

1. 새로운 Story 작성 시:
   ```bash
   cp docs/templates/story-template.md docs/stories/story-015.md
   # 템플릿 기반으로 내용 채우기
   ```

2. AI에게 작업 지시 시:
   ```
   "story-015를 구현해줘. story-template.md 패턴을 따라서."
   ```

---

## Codebase Flattener 활용

### 개념

Codebase Flattener는 프로젝트의 전체 구조를 압축된 형태로 제공하여 컨텍스트 크기를 줄입니다.

### 구현 방법

#### 1. 파일 트리 생성 스크립트

**파일**: `scripts/generate-codebase-tree.sh`

```bash
#!/bin/bash

# Generate compressed file tree
tree -I 'node_modules|.next|.git' -L 3 --dirsfirst > docs/CODEBASE_TREE.txt

# Generate file count summary
echo "File Statistics:" >> docs/CODEBASE_TREE.txt
echo "=================" >> docs/CODEBASE_TREE.txt
find src -type f -name "*.ts" | wc -l | xargs echo "TypeScript files:" >> docs/CODEBASE_TREE.txt
find src -type f -name "*.tsx" | wc -l | xargs echo "React components:" >> docs/CODEBASE_TREE.txt
find src/app -type d | wc -l | xargs echo "App directories:" >> docs/CODEBASE_TREE.txt
```

#### 2. 주요 파일 목록

**파일**: `docs/KEY_FILES.md`

```markdown
# Key Files Reference

## Core Configuration
- `prisma/schema.prisma` - Database schema
- `src/lib/prisma.ts` - Prisma client
- `src/types/index.ts` - TypeScript types

## Authentication
- `src/app/layout.tsx` - Clerk provider
- `src/components/layout/site-header.tsx` - Auth UI

## API Routes
- `src/app/api/properties/route.ts` - Property CRUD
- `src/app/api/bookings/route.ts` - Booking management
- `src/app/api/host/properties/route.ts` - Host management

## Components
- `src/components/property/property-card.tsx` - Property display
- `src/components/booking/booking-widget.tsx` - Booking widget
- `src/components/host/dashboard-stats.tsx` - Host dashboard
```

#### 3. 사용 방법

**Before** (비효율적):
```
"전체 codebase를 읽어서 분석해줘"
→ 수백 개 파일, 수만 줄 코드 전체 로드
```

**After** (효율적):
```
"docs/CODEBASE_TREE.txt와 docs/KEY_FILES.md를 참고해서
 property 관련 기능을 분석해줘"
→ 압축된 구조 + 관련 파일만 로드
```

---

## 실행 방법

### 1. CLAUDE.md 최소화

```bash
# 현재 CLAUDE.md 백업
cp CLAUDE.md CLAUDE.md.backup

# 최소화 버전으로 교체
cat > CLAUDE.md << 'EOF'
# ChonCance - Quick Reference

## Stack
Next.js 14 + Prisma + PostgreSQL + Clerk + shadcn/ui

## Commands
npm run dev    # Development server
npm run build  # Production build

## Documentation
- Architecture: /docs/architecture/*.md
- Stories: /docs/stories/story-*.md
- Guides: /docs/guides/*.md

## Key Patterns
- Server Components by default
- Use @/ for imports
- Clerk authentication
- Prisma for database

Read relevant docs as needed for specific tasks.
EOF
```

### 2. 템플릿 생성

```bash
# 템플릿 디렉토리 생성
mkdir -p docs/templates

# Story 템플릿 생성
cat > docs/templates/story-template.md << 'EOF'
[템플릿 내용]
EOF

# Component 템플릿 생성
cat > docs/templates/component-template.tsx << 'EOF'
[템플릿 내용]
EOF
```

### 3. Codebase Flattener 실행

```bash
# 파일 트리 생성
chmod +x scripts/generate-codebase-tree.sh
./scripts/generate-codebase-tree.sh

# 결과 확인
cat docs/CODEBASE_TREE.txt
```

### 4. AI에게 최적화된 지시

**Before**:
```
"프로젝트를 분석하고 새로운 기능을 추가해줘"
```

**After**:
```
"docs/CODEBASE_TREE.txt를 참고하여 현재 구조를 파악하고,
story-015.md (필터 기능)를 구현해줘.
story-template.md 패턴을 따르고,
component-template.tsx 기반으로 컴포넌트를 작성해줘."
```

---

## 측정 및 개선

### 컨텍스트 크기 측정

```bash
# CLAUDE.md 토큰 수 (대략)
wc -w CLAUDE.md
# Before: ~5000 words (~6000 tokens)
# After: ~500 words (~600 tokens)
# 90% 감소!

# 전체 프로젝트 분석 시
# Before: 전체 파일 읽기 (50,000+ tokens)
# After: 압축 트리 + 관련 파일만 (5,000 tokens)
# 90% 감소!
```

### 효과 측정

| 작업 | Before (tokens) | After (tokens) | 절감율 |
|------|-----------------|----------------|--------|
| 프로젝트 개요 | 6,000 | 600 | 90% |
| 기능 구현 | 50,000 | 5,000 | 90% |
| 버그 수정 | 20,000 | 2,000 | 90% |
| 코드 리뷰 | 30,000 | 3,000 | 90% |

---

## 베스트 프랙티스

### ✅ Do

1. **핵심만 CLAUDE.md에 포함**
2. **상세 문서는 별도 파일로 분리**
3. **템플릿 활용으로 일관성 유지**
4. **필요한 파일만 읽도록 명확한 지시**
5. **정기적으로 컨텍스트 크기 점검**

### ❌ Don't

1. **모든 정보를 CLAUDE.md에 넣지 않기**
2. **"전체 프로젝트 분석" 같은 모호한 지시**
3. **반복 작업을 매번 처음부터 설명**
4. **관련 없는 파일까지 읽기**

---

## 추가 최적화 아이디어

1. **Task 캐싱**: 자주 사용하는 작업을 캐시
2. **Context Chunking**: 큰 작업을 작은 단위로 분할
3. **Incremental Updates**: 변경된 부분만 업데이트
4. **Lazy Loading**: 필요할 때만 상세 정보 로드

---

**작성일**: 2025-10-28
**버전**: 1.0
**작성자**: Claude Code
**프로젝트**: ChonCance
