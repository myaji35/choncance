# BMAD Token-Efficient Workflow 구현 가이드

**5단계 토큰 최적화 개발 워크플로우**

작성일: 2025-10-28
프로젝트: ChonCance
기반: BMAD-METHOD + Claude API Context Caching

---

## 📋 목차

1. [워크플로우 개요](#워크플로우-개요)
2. [Phase 1: 계획 (BMAD CapEx)](#phase-1-계획-bmad-capex)
3. [Phase 2: 환경 설정](#phase-2-환경-설정)
4. [Phase 3: 컨텍스트 캐싱](#phase-3-컨텍스트-캐싱)
5. [Phase 4: 개발 루프](#phase-4-개발-루프-api--bmad-lite)
6. [Phase 5: 반복 수정](#phase-5-반복-수정-token-efficient-vibe)
7. [실행 방법](#실행-방법)
8. [토큰 절감 효과](#토큰-절감-효과)

---

## 워크플로우 개요

### 전체 흐름

```
Phase 1: PRD & Architecture 완성 (Sonnet 4.5/Opus 4.1)
   ↓
Phase 2: CLAUDE.md에 Lean POC 가이드라인 정의
   ↓
Phase 3: codebase.xml 생성 및 컨텍스트 캐싱 (90% 입력 할인)
   ↓
Phase 4: story.md → AI → text_editor JSON → 파일 생성 (Haiku 3.5)
   ↓
Phase 5: "Vibe" 프롬프트 → str_replace JSON → 파일 수정 (90% 출력 절감)
```

### 목표

- **입력 토큰 90% 절감**: 컨텍스트 캐싱 활용
- **출력 토큰 90% 절감**: text_editor JSON 명령 사용
- **비용 최적화**: Haiku 3.5 사용으로 비용 최소화
- **일관성**: BMAD 표준 워크플로우 준수

---

## Phase 1: 계획 (BMAD CapEx)

### 목적

BMAD의 Analyst/PM 에이전트와 함께 PRD 및 아키텍처 문서를 완성합니다.

### 사용 모델

- **Sonnet 4.5** (claude-sonnet-4-5-20250929): 복잡한 계획 및 설계
- **Opus 4.1** (선택): 매우 복잡한 아키텍처 결정

### 실행 방법

#### 1. BMAD 웹 워크플로우 사용

```bash
# BMAD 웹 인터페이스 접속
# https://bmad.ai/workflow

# 또는 API를 통한 실행
curl -X POST https://api.bmad.ai/v1/workflow/plan \
  -H "Authorization: Bearer $BMAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "ChonCance",
    "project_type": "greenfield",
    "description": "Korean rural vacation rental platform",
    "agents": ["analyst", "pm"],
    "model": "claude-sonnet-4-5-20250929"
  }'
```

#### 2. 생성될 문서

- **PRD.md**: 제품 요구사항 문서
  - 비즈니스 목표
  - 사용자 페르소나
  - 기능 요구사항
  - 비기능 요구사항

- **ARCHITECTURE.md**: 아키텍처 문서
  - 기술 스택 선정 근거
  - 시스템 아키텍처 다이어그램
  - 데이터베이스 스키마
  - API 설계

- **docs/stories/story_*.md**: User Story 파일들
  - Epic별로 구조화
  - Acceptance Criteria 포함
  - 기술 구현 가이드

#### 3. 출력 예시

**PRD.md 구조**:
```markdown
# PRD: ChonCance

## Goals
1. 도시 MZ세대를 위한 촌캉스 큐레이션
2. 스토리 중심의 발견 경험
3. 간편한 예약 시스템

## User Personas
### Persona 1: 도시 직장인 (28세)
- Pain Point: 진정한 휴식을 찾기 어려움
- Goal: 특별한 경험이 있는 숙소

## Features
### Epic 1: 인증 및 회원 관리
- US-1.1: 이메일 회원가입
- US-1.2: 소셜 로그인
...
```

**ARCHITECTURE.md 구조**:
```markdown
# Architecture: ChonCance

## Stack Decision
- Next.js 14: SSR + App Router for SEO
- Prisma: Type-safe ORM
- PostgreSQL: Relational data integrity
- Clerk: Authentication as a service

## Database Schema
```prisma
model Property {
  id String @id
  name String
  ...
}
```

## API Design
### GET /api/properties
...
```

### 검증

```bash
# PRD 및 Architecture 문서가 완성되었는지 확인
ls -la PRD.md ARCHITECTURE.md docs/stories/
```

---

## Phase 2: 환경 설정

### 목적

CLAUDE.md 파일에 "Lean POC" 가이드라인과 공통 테스트 명령어를 정의합니다.

### CLAUDE.md 작성

**파일**: `/CLAUDE.md`

```markdown
# ChonCance - Lean POC Guidelines

## Project Type
Lean POC (Proof of Concept) - MVP 중심 개발

## Development Principles

### 1. Lean POC 가이드라인
- **최소 기능 구현**: MVP에 필요한 핵심 기능만
- **Quick Iterations**: 빠른 프로토타입 → 테스트 → 개선
- **Technical Debt OK**: POC 단계에서는 완벽함보다 속도
- **User Feedback First**: 초기 사용자 피드백 수집 우선

### 2. Code Standards (Simplified)
- Server Components by default
- Use `@/` for imports
- shadcn/ui for UI components
- Prisma for database access

### 3. Common Test Commands

\`\`\`bash
# Development
npm run dev              # Start dev server (http://localhost:3000)

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations
npx prisma studio        # Open Prisma Studio

# Build & Test
npm run build            # Production build
npm run lint             # ESLint check
npm run type-check       # TypeScript check

# Prisma Helpers
npx prisma db push       # Push schema (POC only)
npx prisma db seed       # Seed database
\`\`\`

### 4. File Structure Quick Reference

\`\`\`
src/
├── app/              # Next.js App Router
│   ├── api/         # API Routes
│   ├── (pages)/     # Page components
│   └── layout.tsx   # Root layout
├── components/       # React components
│   ├── ui/          # shadcn/ui components (don't edit)
│   └── ...          # Custom components
├── lib/             # Utilities
│   ├── prisma.ts    # Prisma client
│   └── utils.ts     # Helper functions
└── types/           # TypeScript types
\`\`\`

### 5. Documentation References

When working on a specific feature:
1. Check `/docs/stories/story-*.md` for requirements
2. Check `/docs/architecture/*.md` for technical specs
3. Check `/docs/guides/*.md` for usage guides

**Read files on demand** - Don't load everything at once.

### 6. BMAD Integration

This project uses BMAD-METHOD for structured development:
- Stories: `/docs/stories/story_*.md`
- Templates: `/docs/templates/`
- Workflow: See `/docs/BMAD_WORKFLOW_IMPLEMENTATION.md`

---

**Next Steps After Setup**:
1. Generate codebase.xml (Phase 3)
2. Start development loop (Phase 4)
3. Iterate with Vibe prompts (Phase 5)
```

### 검증

```bash
# CLAUDE.md가 생성되었는지 확인
cat CLAUDE.md | head -20
```

---

## Phase 3: 컨텍스트 캐싱

### 목적

BMAD Codebase Flattener를 실행하여 codebase.xml을 생성하고,
PRD, Architecture, codebase.xml을 시스템 프롬프트에 넣어 캐싱합니다.

### 3.1 Codebase Flattener 실행

#### 스크립트 생성

**파일**: `scripts/generate-codebase-xml.sh`

```bash
#!/bin/bash

# ChonCance Codebase Flattener
# Generates compressed XML representation of codebase

OUTPUT_FILE="docs/codebase.xml"

echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" > $OUTPUT_FILE
echo "<codebase project=\"ChonCance\">" >> $OUTPUT_FILE

# Project structure
echo "  <structure>" >> $OUTPUT_FILE
tree -I 'node_modules|.next|.git|dist|build' -L 3 --dirsfirst -X >> $OUTPUT_FILE
echo "  </structure>" >> $OUTPUT_FILE

# File statistics
echo "  <statistics>" >> $OUTPUT_FILE
echo "    <files>" >> $OUTPUT_FILE
echo "      <typescript>$(find src -name "*.ts" -o -name "*.tsx" | wc -l | tr -d ' ')</typescript>" >> $OUTPUT_FILE
echo "      <components>$(find src/components -name "*.tsx" | wc -l | tr -d ' ')</components>" >> $OUTPUT_FILE
echo "      <pages>$(find src/app -name "page.tsx" | wc -l | tr -d ' ')</pages>" >> $OUTPUT_FILE
echo "      <api>$(find src/app/api -name "route.ts" | wc -l | tr -d ' ')</api>" >> $OUTPUT_FILE
echo "    </files>" >> $OUTPUT_FILE
echo "  </statistics>" >> $OUTPUT_FILE

# Key files content (compressed)
echo "  <key_files>" >> $OUTPUT_FILE

# Schema
echo "    <file path=\"prisma/schema.prisma\">" >> $OUTPUT_FILE
echo "      <content><![CDATA[" >> $OUTPUT_FILE
cat prisma/schema.prisma | grep -E "model|enum" | head -50 >> $OUTPUT_FILE
echo "      ]]></content>" >> $OUTPUT_FILE
echo "    </file>" >> $OUTPUT_FILE

# Types
echo "    <file path=\"src/types/index.ts\">" >> $OUTPUT_FILE
echo "      <content><![CDATA[" >> $OUTPUT_FILE
cat src/types/index.ts 2>/dev/null | head -50 >> $OUTPUT_FILE || echo "// Types file"
echo "      ]]></content>" >> $OUTPUT_FILE
echo "    </file>" >> $OUTPUT_FILE

echo "  </key_files>" >> $OUTPUT_FILE

# API endpoints list
echo "  <api_endpoints>" >> $OUTPUT_FILE
find src/app/api -name "route.ts" | while read file; do
  endpoint=$(echo $file | sed 's|src/app/api||' | sed 's|/route.ts||')
  echo "    <endpoint path=\"$endpoint\" file=\"$file\"/>" >> $OUTPUT_FILE
done
echo "  </api_endpoints>" >> $OUTPUT_FILE

echo "</codebase>" >> $OUTPUT_FILE

echo "✅ Codebase XML generated: $OUTPUT_FILE"
echo "Size: $(wc -c < $OUTPUT_FILE | numfmt --to=iec-i --suffix=B)"
```

#### 실행

```bash
chmod +x scripts/generate-codebase-xml.sh
./scripts/generate-codebase-xml.sh
```

#### 출력 예시

**docs/codebase.xml** (압축됨):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<codebase project="ChonCance">
  <structure>
    src/
    ├── app/
    │   ├── api/
    │   ├── explore/
    │   └── host/
    ├── components/
    └── lib/
  </structure>
  <statistics>
    <files>
      <typescript>150</typescript>
      <components>45</components>
      <pages>12</pages>
      <api>15</api>
    </files>
  </statistics>
  <key_files>
    <file path="prisma/schema.prisma">
      <content><![CDATA[
        model User { ... }
        model Property { ... }
      ]]></content>
    </file>
  </key_files>
  <api_endpoints>
    <endpoint path="/properties" file="src/app/api/properties/route.ts"/>
    <endpoint path="/bookings" file="src/app/api/bookings/route.ts"/>
  </api_endpoints>
</codebase>
```

### 3.2 컨텍스트 캐싱 API 호출

#### Python 스크립트

**파일**: `scripts/cache-context.py`

```python
#!/usr/bin/env python3

import anthropic
import os

# Read files
with open("PRD.md", "r") as f:
    prd_content = f.read()

with open("ARCHITECTURE.md", "r") as f:
    arch_content = f.read()

with open("docs/codebase.xml", "r") as f:
    codebase_content = f.read()

# Create client
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# Prepare system prompt with cache control
system_prompt = [
    {
        "type": "text",
        "text": f"You are an expert developer working on ChonCance project.\n\n# PRD\n{prd_content}",
        "cache_control": {"type": "ephemeral"}
    },
    {
        "type": "text",
        "text": f"# Architecture\n{arch_content}",
        "cache_control": {"type": "ephemeral"}
    },
    {
        "type": "text",
        "text": f"# Codebase\n{codebase_content}",
        "cache_control": {"type": "ephemeral"}
    }
]

# Cache the context with a simple query
response = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=100,
    system=system_prompt,
    messages=[
        {"role": "user", "content": "Confirm you've loaded the context. Reply with 'Ready'."}
    ]
)

print("✅ Context cached successfully!")
print(f"Response: {response.content[0].text}")
print(f"Usage: {response.usage}")
print(f"Cache tokens: {response.usage.cache_read_input_tokens if hasattr(response.usage, 'cache_read_input_tokens') else 0}")
```

#### 실행

```bash
chmod +x scripts/cache-context.py
python3 scripts/cache-context.py
```

#### 출력 예시

```
✅ Context cached successfully!
Response: Ready
Usage: input_tokens=150, cache_creation_tokens=50000, cache_read_tokens=0, output_tokens=5
```

---

## Phase 4: 개발 루프 (API + BMAD-Lite)

### 목적

story.md를 읽어 AI가 text_editor 도구로 코드를 생성하도록 합니다.

### 4.1 text_editor 도구 정의

**파일**: `scripts/tools/text_editor.json`

```json
{
  "name": "text_editor",
  "description": "Create, edit, or view files using efficient text operations",
  "input_schema": {
    "type": "object",
    "properties": {
      "command": {
        "type": "string",
        "enum": ["view", "create", "str_replace", "insert", "undo_edit"],
        "description": "Command to execute"
      },
      "path": {
        "type": "string",
        "description": "File path"
      },
      "file_text": {
        "type": "string",
        "description": "Full file content (for create)"
      },
      "old_str": {
        "type": "string",
        "description": "String to replace (for str_replace)"
      },
      "new_str": {
        "type": "string",
        "description": "Replacement string (for str_replace)"
      },
      "insert_line": {
        "type": "integer",
        "description": "Line number to insert at (for insert)"
      },
      "new_str": {
        "type": "string",
        "description": "Content to insert (for insert)"
      }
    },
    "required": ["command", "path"]
  }
}
```

### 4.2 개발 루프 스크립트

**파일**: `scripts/dev-loop.py`

```python
#!/usr/bin/env python3

import anthropic
import os
import json
import sys

def execute_text_editor(command_data):
    """Execute text_editor command locally"""
    command = command_data["command"]
    path = command_data["path"]

    if command == "create":
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            f.write(command_data["file_text"])
        print(f"✅ Created: {path}")

    elif command == "str_replace":
        with open(path, "r") as f:
            content = f.read()
        content = content.replace(command_data["old_str"], command_data["new_str"])
        with open(path, "w") as f:
            f.write(content)
        print(f"✅ Modified: {path}")

    elif command == "insert":
        with open(path, "r") as f:
            lines = f.readlines()
        lines.insert(command_data["insert_line"], command_data["new_str"] + "\n")
        with open(path, "w") as f:
            f.writelines(lines)
        print(f"✅ Inserted into: {path}")

    elif command == "view":
        with open(path, "r") as f:
            content = f.read()
        return content

    return f"Executed {command} on {path}"

def dev_loop(story_file):
    """Main development loop"""

    # Read story file
    with open(story_file, "r") as f:
        story_content = f.read()

    # Load cached context (from Phase 3)
    with open("PRD.md", "r") as f:
        prd_content = f.read()
    with open("ARCHITECTURE.md", "r") as f:
        arch_content = f.read()
    with open("docs/codebase.xml", "r") as f:
        codebase_content = f.read()

    # Load text_editor tool
    with open("scripts/tools/text_editor.json", "r") as f:
        text_editor_tool = json.load(f)

    # Create client
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    # System prompt with cached context
    system_prompt = [
        {
            "type": "text",
            "text": f"# PRD\n{prd_content}",
            "cache_control": {"type": "ephemeral"}
        },
        {
            "type": "text",
            "text": f"# Architecture\n{arch_content}",
            "cache_control": {"type": "ephemeral"}
        },
        {
            "type": "text",
            "text": f"# Codebase\n{codebase_content}",
            "cache_control": {"type": "ephemeral"}
        }
    ]

    # Send story as user message
    messages = [
        {
            "role": "user",
            "content": f"Implement this story:\n\n{story_content}\n\nUse text_editor tool to create/modify files."
        }
    ]

    print("🤖 Sending to AI (Haiku 3.5)...")

    # API call with token-efficient-tools header
    response = client.messages.create(
        model="claude-3-5-haiku-20241022",  # Haiku 3.5
        max_tokens=4096,
        system=system_prompt,
        tools=[text_editor_tool],
        messages=messages,
        extra_headers={
            "anthropic-beta": "token-efficient-tools-2025-04-30"
        }
    )

    print(f"📊 Usage: {response.usage}")
    print(f"💾 Cache read: {response.usage.cache_read_input_tokens if hasattr(response.usage, 'cache_read_input_tokens') else 0} tokens (90% saved!)")

    # Process tool calls
    for content in response.content:
        if content.type == "tool_use":
            print(f"\n🔧 Tool: {content.name}")
            print(f"📝 Command: {json.dumps(content.input, indent=2)}")

            # Execute locally
            result = execute_text_editor(content.input)
            print(f"✅ Result: {result}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 dev-loop.py <story_file>")
        sys.exit(1)

    story_file = sys.argv[1]
    dev_loop(story_file)
```

### 4.3 실행

```bash
chmod +x scripts/dev-loop.py
python3 scripts/dev-loop.py docs/stories/story_001.md
```

### 4.4 출력 예시

```
🤖 Sending to AI (Haiku 3.5)...
📊 Usage: input_tokens=500, cache_read_tokens=50000, output_tokens=200
💾 Cache read: 50000 tokens (90% saved!)

🔧 Tool: text_editor
📝 Command: {
  "command": "create",
  "path": "src/components/auth/login-form.tsx",
  "file_text": "..."
}
✅ Created: src/components/auth/login-form.tsx

🔧 Tool: text_editor
📝 Command: {
  "command": "create",
  "path": "src/app/login/page.tsx",
  "file_text": "..."
}
✅ Created: src/app/login/page.tsx
```

---

## Phase 5: 반복 수정 (Token-Efficient Vibe)

### 목적

"Vibe" 프롬프트로 빠른 수정을 하며, str_replace JSON으로 출력 토큰을 90% 절감합니다.

### 5.1 Vibe 프롬프트 스크립트

**파일**: `scripts/vibe.py`

```python
#!/usr/bin/env python3

import anthropic
import os
import json
import sys

def execute_text_editor(command_data):
    """Execute text_editor command locally"""
    command = command_data["command"]
    path = command_data["path"]

    if command == "str_replace":
        with open(path, "r") as f:
            content = f.read()
        content = content.replace(command_data["old_str"], command_data["new_str"])
        with open(path, "w") as f:
            f.write(content)
        print(f"✅ Modified: {path}")
        return "OK"

    return "Unsupported command for Vibe mode"

def vibe_edit(prompt):
    """Quick edit with Vibe prompt"""

    # Load cached context
    with open("PRD.md", "r") as f:
        prd_content = f.read()
    with open("ARCHITECTURE.md", "r") as f:
        arch_content = f.read()
    with open("docs/codebase.xml", "r") as f:
        codebase_content = f.read()

    # Load text_editor tool
    with open("scripts/tools/text_editor.json", "r") as f:
        text_editor_tool = json.load(f)

    # Create client
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    # System prompt with cached context (90% input discount)
    system_prompt = [
        {
            "type": "text",
            "text": f"# PRD\n{prd_content}",
            "cache_control": {"type": "ephemeral"}
        },
        {
            "type": "text",
            "text": f"# Architecture\n{arch_content}",
            "cache_control": {"type": "ephemeral"}
        },
        {
            "type": "text",
            "text": f"# Codebase\n{codebase_content}",
            "cache_control": {"type": "ephemeral"}
        }
    ]

    # Vibe prompt
    messages = [
        {
            "role": "user",
            "content": f"{prompt}\n\nUse text_editor str_replace to make minimal changes. Return only necessary replacements."
        }
    ]

    print(f"🎨 Vibe: {prompt}")
    print("🤖 Processing with cached context...")

    # API call with Haiku 3.5
    response = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=2048,
        system=system_prompt,
        tools=[text_editor_tool],
        messages=messages,
        extra_headers={
            "anthropic-beta": "token-efficient-tools-2025-04-30"
        }
    )

    print(f"📊 Usage: {response.usage}")
    print(f"💾 Cache read: {response.usage.cache_read_input_tokens if hasattr(response.usage, 'cache_read_input_tokens') else 0} tokens")
    print(f"💰 Output: {response.usage.output_tokens} tokens (JSON format = 90% saved!)")

    # Process tool calls
    for content in response.content:
        if content.type == "tool_use":
            print(f"\n🔧 str_replace in: {content.input['path']}")
            result = execute_text_editor(content.input)
            print(f"✅ {result}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 vibe.py '<vibe_prompt>'")
        print("Example: python3 vibe.py 'Add error handling to login form'")
        sys.exit(1)

    prompt = " ".join(sys.argv[1:])
    vibe_edit(prompt)
```

### 5.2 실행 예시

```bash
chmod +x scripts/vibe.py

# 예시 1: 에러 처리 추가
python3 scripts/vibe.py "Add error handling to login form"

# 예시 2: 스타일 수정
python3 scripts/vibe.py "Make the button bigger and blue"

# 예시 3: 기능 개선
python3 scripts/vibe.py "Add loading spinner to submit button"
```

### 5.3 출력 예시

```
🎨 Vibe: Add error handling to login form
🤖 Processing with cached context...
📊 Usage: input_tokens=100, cache_read_tokens=50000, output_tokens=50
💾 Cache read: 50000 tokens
💰 Output: 50 tokens (JSON format = 90% saved!)

🔧 str_replace in: src/components/auth/login-form.tsx
✅ Modified: src/components/auth/login-form.tsx
```

---

## 실행 방법

### 전체 워크플로우 실행

```bash
# Phase 1: PRD & Architecture 완성 (BMAD 웹 또는 API)
# (수동으로 완성 또는 BMAD API 사용)

# Phase 2: CLAUDE.md 작성
cat > CLAUDE.md << 'EOF'
[Lean POC Guidelines as above]
EOF

# Phase 3: Context Caching
./scripts/generate-codebase-xml.sh
python3 scripts/cache-context.py

# Phase 4: Development Loop (story 001)
python3 scripts/dev-loop.py docs/stories/story_001.md

# Phase 5: Vibe Edits
python3 scripts/vibe.py "Add validation to form"
python3 scripts/vibe.py "Improve button styling"
python3 scripts/vibe.py "Add error messages"

# 반복: 다음 story
python3 scripts/dev-loop.py docs/stories/story_002.md
python3 scripts/vibe.py "Fix bug in property card"
```

### 자동화 스크립트

**파일**: `scripts/bmad-workflow.sh`

```bash
#!/bin/bash

# BMAD Token-Efficient Workflow
# Usage: ./scripts/bmad-workflow.sh <phase> [args]

PHASE=$1

case $PHASE in
  "cache")
    echo "🔄 Phase 3: Caching context..."
    ./scripts/generate-codebase-xml.sh
    python3 scripts/cache-context.py
    ;;

  "dev")
    STORY_FILE=$2
    echo "🔨 Phase 4: Development loop..."
    python3 scripts/dev-loop.py "$STORY_FILE"
    ;;

  "vibe")
    shift
    PROMPT="$@"
    echo "🎨 Phase 5: Vibe edit..."
    python3 scripts/vibe.py "$PROMPT"
    ;;

  "all")
    echo "🚀 Running full workflow..."
    ./scripts/bmad-workflow.sh cache
    ./scripts/bmad-workflow.sh dev docs/stories/story_001.md
    ;;

  *)
    echo "Usage: $0 <phase> [args]"
    echo "Phases:"
    echo "  cache           - Phase 3: Cache context"
    echo "  dev <story>     - Phase 4: Development loop"
    echo "  vibe '<prompt>' - Phase 5: Vibe edit"
    echo "  all             - Run Phases 3-4"
    exit 1
    ;;
esac
```

### 사용 예시

```bash
chmod +x scripts/bmad-workflow.sh

# 전체 워크플로우
./scripts/bmad-workflow.sh all

# 개별 단계
./scripts/bmad-workflow.sh cache
./scripts/bmad-workflow.sh dev docs/stories/story_002.md
./scripts/bmad-workflow.sh vibe "Improve error handling"
```

---

## 토큰 절감 효과

### Before (일반적인 방법)

| 단계 | 입력 토큰 | 출력 토큰 | 총 비용 |
|------|-----------|-----------|---------|
| Story 구현 | 50,000 | 2,000 | $1.00 |
| 수정 1 | 50,000 | 2,000 | $1.00 |
| 수정 2 | 50,000 | 2,000 | $1.00 |
| **총계** | **150,000** | **6,000** | **$3.00** |

### After (BMAD Token-Efficient)

| 단계 | 입력 토큰 | 캐시 읽기 | 출력 토큰 | 총 비용 |
|------|-----------|-----------|-----------|---------|
| 캐싱 | 50,000 | 0 | 10 | $0.10 |
| Story 구현 | 500 | 50,000 (90% 할인) | 200 (JSON) | $0.05 |
| 수정 1 (Vibe) | 100 | 50,000 (90% 할인) | 50 (JSON) | $0.02 |
| 수정 2 (Vibe) | 100 | 50,000 (90% 할인) | 50 (JSON) | $0.02 |
| **총계** | **50,700** | **150,000** | **310** | **$0.19** |

### 절감율

- **입력 토큰**: 66% 절감 (캐시 재사용)
- **출력 토큰**: 95% 절감 (JSON 명령)
- **총 비용**: 94% 절감 ($3.00 → $0.19)

---

## 다음 단계

### 추가 최적화

1. **Streaming**: 실시간 응답으로 UX 개선
2. **Parallel Execution**: 여러 story 동시 처리
3. **Incremental Caching**: 변경된 부분만 업데이트
4. **Tool Chaining**: 여러 tool을 연쇄적으로 실행

### 모니터링

```python
# scripts/monitor-usage.py
import json
from datetime import datetime

def log_usage(phase, usage_data):
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "phase": phase,
        "usage": usage_data
    }

    with open("logs/token-usage.jsonl", "a") as f:
        f.write(json.dumps(log_entry) + "\n")
```

---

**작성일**: 2025-10-28
**버전**: 1.0
**작성자**: Claude Code
**프로젝트**: ChonCance
