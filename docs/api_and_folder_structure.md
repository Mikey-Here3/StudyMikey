# API Design & Folder Structure
## Project Name: "Learn. Practice. Compete. Showcase. Get Hired."
**Version**: 1.0.0  
**Author**: Staff Software Engineer & API Architect  
**Date**: June 3, 2026

---

## 1. Project Folder Structure (Next.js Fullstack)

This setup details a fullstack monorepo style folder structure for Next.js App Router, using Drizzle ORM, Tailwind CSS, and Shadcn UI.

```
learn-practice-compete/
├── .env.example
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── drizzle.config.ts           # Drizzle schema migrations configuration
├── src/
│   ├── app/                    # Next.js App Router Routing Layer
│   │   ├── layout.tsx          # Root Layout (Providers, Navbar, Footer)
│   │   ├── page.tsx            # Landing Page / Portal Hub
│   │   ├── auth/               # User Authentication Views
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── u/                  # Developer Profiles
│   │   │   └── [username]/page.tsx
│   │   ├── problems/           # Problems Directory
│   │   │   ├── page.tsx        # Problems Catalog List
│   │   │   └── [slug]/page.tsx # Split Pane Editor (Interactive Workspace)
│   │   ├── contests/           # Contests Module
│   │   │   ├── page.tsx        # Contests Listing
│   │   │   └── [id]/           # Specific Contest Folder
│   │   │       ├── page.tsx    # Contest Entry / Workspace
│   │   │       └── lobby/page.tsx
│   │   ├── universities/       # Universities Module
│   │   │   ├── page.tsx        # Directory Index
│   │   │   └── [slug]/page.tsx # University Dedicated Space
│   │   ├── recruiter/          # Recruiter Search Portal
│   │   │   └── page.tsx
│   │   ├── admin/              # Admin Administration Panel
│   │   │   ├── page.tsx
│   │   │   └── verification/page.tsx
│   │   └── api/                # Route Handlers (HTTP Endpoint Handlers)
│   │       ├── auth/[...nextauth]/route.ts  # OAuth/Google Login Callback
│   │       ├── judge/callback/route.ts      # Webhook callback from Judge Worker
│   │       ├── upload/signature/route.ts   # Cloudinary signed upload generation
│   │       └── sse/submissions/[id]/route.ts # Server-Sent Events stream for execution updates
│   │
│   ├── components/             # Reusable UI Components
│   │   ├── ui/                 # Atomic Shadcn Elements (Buttons, Modals, Tabs)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── select.tsx
│   │   ├── shared/             # Layout Shell Elements (Navbar, Sidebar)
│   │   └── features/           # High-Level Complex Components
│   │       ├── editor/         # CodeEditor (Monaco React)
│   │       ├── profile/        # Heatmap, certificate viewer
│   │       └── recruiter/      # Filtering and analytics dashboards
│   │
│   ├── db/                     # Drizzle Configuration & Migration
│   │   ├── index.ts            # Client setup (Neon serverless driver connection)
│   │   └── schema.ts           # Drizzle Schema Definitions
│   │
│   ├── lib/                    # Server Utility Libraries & Services
│   │   ├── actions/            # Next.js Server Actions (Mutations)
│   │   │   ├── profile-actions.ts
│   │   │   ├── contest-actions.ts
│   │   │   └── problem-actions.ts
│   │   ├── auth.ts             # Auth Options Configuration
│   │   ├── cloudinary.ts       # Cloudinary Upload Helpers
│   │   ├── redis.ts            # Upstash Redis Client Configuration
│   │   └── utils.ts            # Tailwind Classname merger (cn)
│   │
│   ├── hooks/                  # Client Hooks
│   │   ├── useSocket.ts        # Handle Socket.IO channels
│   │   └── useCountdown.ts     # Timers for Live Contests
│   │
│   └── types/                  # Type Declarations (.d.ts)
```

---

## 2. API Route Handlers Specification

### 2.1 Online Judge Callback Webhook
*   **Path**: `POST /api/judge/callback`
*   **Access**: Secure (Requires basic authorization token matching Worker secrets).
*   **Objective**: Triggered by Judge Worker Daemon when code execution completes.

#### Request Body
```json
{
  "submissionId": "f784e8b3-3a1b-4f9e-bd82-965a782b610c",
  "status": "ACCEPTED",
  "executionTimeMs": 142,
  "executionMemoryKb": 12480,
  "testCasesPassed": 40,
  "totalTestCases": 40,
  "errorLog": null
}
```

#### Response
*   `200 OK` (Ack payload received). Database updated, message published to Redis channel `realtime:submissions` to inform frontend clients.

---

### 2.2 Server-Sent Events (SSE) Judge Status Stream
*   **Path**: `GET /api/sse/submissions/[id]/route`
*   **Objective**: Streams live submission status updates to the Monaco editor workspace while code is evaluating.

```
[Browser Client] ------------ GET /api/sse/submissions/123 ------------> [Next.js API]
[Browser Client] <---- event: status, data: {"status": "COMPILING"} ---- [Next.js API]
[Browser Client] <---- event: status, data: {"status": "RUNNING"} ------ [Next.js API]
[Browser Client] <---- event: status, data: {"status": "ACCEPTED"} ----- [Next.js API]
```

*   **Headers**:
    *   `Content-Type: text/event-stream`
    *   `Cache-Control: no-cache`
    *   `Connection: keep-alive`

---

### 2.3 Cloudinary Direct Signatures Helper
*   **Path**: `POST /api/upload/signature`
*   **Access**: Authenticated (Student/Teacher/Admin).
*   **Objective**: Generate signed tokens to enable direct, secure file uploads (resumes, project images) from the browser client to Cloudinary, bypassing Next.js API bandwidth caps.

#### Response Body
```json
{
  "signature": "d0e9803bf2b984578b8a0774a2a1b945d8b762ac",
  "timestamp": 1717325600,
  "apiKey": "123456789012345",
  "cloudName": "learn-practice-compete"
}
```

---

## 3. Server Actions Design (Mutations)

Server Actions are used inside the Next.js runtime, executing directly on the server with secure database integration.

### 3.1 Submit Code (Students)
*   **Action**: `submitCodeAction(problemId: string, code: string, language: string, contestId?: string)`
*   **Authentication**: Session validation.
*   **Logic**:
    1.  Verify user authentication from cookie session.
    2.  Write submission to PostgreSQL in `QUEUED` state.
    3.  Push submission ID and code contents to Redis `judge:queue`.
    4.  Return `{ success: true, submissionId }`.

```typescript
export async function submitCodeAction(payload: {
  problemId: string;
  code: string;
  language: "CPP";
  contestId?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // Write base record to Neon DB
  const [submission] = await db.insert(submissions).values({
    userId: session.user.id,
    problemId: payload.problemId,
    contestId: payload.contestId || null,
    code: payload.code,
    language: payload.language,
    status: "QUEUED",
  }).returning();

  // Push job metadata to Redis queue (parsed by Judge Worker)
  await redis.rpush("judge:queue", JSON.stringify({
    submissionId: submission.id,
    problemId: payload.problemId,
    code: payload.code,
    language: payload.language
  }));

  return { success: true, submissionId: submission.id };
}
```

---

### 3.2 Update Student Profile
*   **Action**: `updateProfileAction(profileData: ProfileFormValues)`
*   **Authentication**: Validate student role matches session ID.
*   **Payload**:
```typescript
interface ProfileFormValues {
  bio: string;
  skills: string[];
  githubLink: string;
  isOpenToWork: boolean;
  resumeUrl: string; // Cloudinary secure link
}
```

---

### 3.3 Recruiter Talent Sourcing Search
*   **Path**: `GET /api/recruiter/search`
*   **Access**: Restricted to verified Recruiters (`role === 'RECRUITER'`).
*   **Parameters**:
    *   `q`: keyword search on profile bio.
    *   `skills`: comma-separated string (e.g. `C++,Next.js`).
    *   `minRating`: integer (e.g. `1600`).
    *   `university`: slug representing institution.
    *   `limit` / `offset`: for pagination.

#### Sample JSON Response
```json
{
  "totalResults": 1,
  "students": [
    {
      "id": "e30129a2-4a0b-11ed-b878-0242ac120002",
      "username": "coder_xyz",
      "name": "Jane Doe",
      "rating": 1750,
      "skills": ["C++", "Next.js", "Redis"],
      "university": "FAST National University",
      "isOpenToWork": true,
      "solvedCount": 312,
      "avatarUrl": "https://res.cloudinary.com/demo/image/upload/v123/avatar.jpg"
    }
  ]
}
```
---

## 4. WebSocket Event Payloads (Lobby & Leaderboard)

When running live contests, Socket.IO channels distribute events to keep browser boards live without polling.

*   **Leaderboard Broadcast (`contest:leaderboard:update`)**:
```json
{
  "contestId": "6f29e1c3-2b99-4a92-9442-990a8a8cbb12",
  "rankings": [
    { "rank": 1, "username": "alice", "score": 400, "penaltyTime": 5400 },
    { "rank": 2, "username": "bob", "score": 300, "penaltyTime": 3200 }
  ]
}
```
*   **Chat Event (`contest:chat:message`)**:
```json
{
  "contestId": "6f29e1c3-2b99-4a92-9442-990a8a8cbb12",
  "username": "system",
  "message": "User coder_xyz solved Problem C: DP Knapsack in 12m!",
  "timestamp": 1717325850
}
```
