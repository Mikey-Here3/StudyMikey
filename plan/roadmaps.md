# Roadmaps & Flow Diagrams
## Project Name: "StudyMikey"
**Version**: 1.0.0  
**Author**: Staff DevOps Engineer, Product Manager, & StudyMikey Founder  
**Date**: June 3, 2026

---

## 1. MVP Development Roadmap

This phased roadmap aligns your build priorities with the Next.js fullstack, Neon DB, and Cloudinary tech stack.

```
PHASED ROADMAP EXECUTION TRACK
+------------------------------------------------------------------------------------------------+
|  [PHASE 1: Core Foundation]  --> [PHASE 2: Sandboxed Judge]  --> [PHASE 3: Contests & Social]  |
|  - Auth & Profile Setup          - Worker Daemons Pool           - Live Contests Engine        |
|  - University Directory          - C++ Submission Pipeline        - Ratings Calculation         |
|  - Next.js & Neon DB Init        - Sandbox Resource CGroups      - Recruiter Search & Sourcing |
+------------------------------------------------------------------------------------------------+
```

### Phase 1: Core Foundation & Profiles (Weeks 1 - 4)
1.  **Repository Initialization**: Set up Next.js App Router, configure Drizzle ORM, hook up Neon Serverless DB, and install Tailwind CSS/Shadcn.
2.  **Authentication**: Implement NextAuth.js with Credentials Provider (Email Login) and Google OAuth provider.
3.  **User Profiles & Cloudinary Integration**:
    *   Build the user profile template (`/u/username`) for Students, Teachers, Recruiters, and Admins.
    *   Configure Cloudinary signed upload route handlers to handle user avatar uploads.
4.  **University Directory**: Seed directories with national universities (FAST, NUST, COMSATS, UET). Enable users to link accounts to verified university domains.

### Phase 2: Problems & Sandboxed C++ Judge (Weeks 5 - 8)
1.  **Problem Library Catalog**: Build the problem directory containing metadata filter mechanisms (Tags, difficulty level).
2.  **Editor Panel**: Integrate Monaco Editor with live C++ language support and theme toggling.
3.  **Docker Sandbox Worker**:
    *   Create base C++ compilation docker image.
    *   Deploy daemon polling Redis BullMQ queue.
    *   Implement cgroups (CPU, RAM limits) and execution isolation inside Linux VPC nodes.
4.  **Submission Feed**: Create the `/api/judge/callback` webhook and SSE API route to stream compilation status logs in real-time.

### Phase 3: Contests, Rankings & Social (Weeks 9 - 12)
1.  **Contest Engine**: Build scheduling workflows, the countdown timer, contest problems mapping, and penalization formulas.
2.  **Leaderboards & Ratings**:
    *   Integrate Redis Sorted Sets to cache real-time leaderboard data.
    *   Implement post-contest rating updater routines (Elo/Codeforces formula adjustments).
3.  **Recruiter Portal**: Configure student directory filtering mechanics. Set up outreach modules and resume verification dashboards.
4.  **Mobile App Launch**: Deliver Expo React Native companion client showing contest notifications, roadmaps, and profile metrics.

---

## 2. Production Scaling Roadmap (Post-Launch)

1.  **Auto-scaling Sandbox VM Worker Pools**: Configure AWS Auto Scaling Groups (ASG) or Kubernetes HPA (Horizontal Pod Autoscaler) monitoring Redis `judge:queue` size. Scale VMs out if queue backlog exceeds 100 entries.
2.  **Distributed Caching**: Upgrade standard Redis cache instances to cluster configurations across regions, bringing leaderboard reads closer to global users.
3.  **Advanced Anti-Cheating Analysis**: Integrate MOSS (Measure of Software Similarity) check scripts, triggered automatically upon contest completion, flagging student submissions with similarity thresholds > 85%.
4.  **Continuous Integration & Deployment (CI/CD)**:
    *   Vercel webhook integrations for instant frontend previews.
    *   GitHub Actions workflow compiling Docker judge images, auto-testing compiler sandboxes, and pushing updates to VM registries.

---

## 3. System Workflow Diagrams

### 3.1 Student Registration, Learning, & Profiling

```mermaid
sequenceDiagram
    actor Student
    participant NextJS as Next.js Web App
    participant NeonDB as Neon DB
    participant Cloudinary as Cloudinary Storage

    Student ->> NextJS: Sign Up via Google OAuth
    NextJS ->> NeonDB: Create User & Profile records
    Student ->> NextJS: Fill Bio, select University
    Student ->> NextJS: Upload Resume / Certificates
    NextJS ->> Cloudinary: Get direct Upload Signature
    Cloudinary -->> Student: Upload PDF/Images directly
    Student ->> NextJS: Save Cloudinary URLs
    NextJS ->> NeonDB: Update Profile attributes
    Student ->> NextJS: Solves Problem
    NextJS ->> NeonDB: Increment XP, recalculate Level
```

### 3.2 Teacher Contest & Problem Management Flow

```mermaid
sequenceDiagram
    actor Teacher
    participant NextJS as Next.js Web App
    participant NeonDB as Neon DB
    actor Admin

    Teacher ->> NextJS: Register as Teacher
    NextJS ->> NeonDB: Set Status to PENDING_VERIFICATION
    Admin ->> NextJS: Audits Document via Admin Panel
    Admin ->> NeonDB: Verify Teacher Role
    Teacher ->> NextJS: Create Problem (C++ description, hidden test cases)
    NextJS ->> NeonDB: Insert Problem & Test Cases records
    Teacher ->> NextJS: Schedule Contest (Selects problems list, set duration)
    NextJS ->> NeonDB: Save Contest & ContestProblems records
```

### 3.3 Recruiter Talent Search & Sourcing Flow

```mermaid
sequenceDiagram
    actor Recruiter
    participant NextJS as Next.js Web App
    participant NeonDB as Neon DB
    actor Student

    Recruiter ->> NextJS: Access Recruiter Search
    Recruiter ->> NextJS: Filter: Univ = FAST, Rating >= 1600, Open = True
    NextJS ->> NeonDB: Read Profiles query with index checks
    NeonDB -->> NextJS: Return Matching Profiles
    NextJS -->> Recruiter: Display portfolio cards & heatmaps
    Recruiter ->> NextJS: Click "Contact Candidate"
    NextJS ->> NeonDB: Write message record & email notification
    NextJS -->> Student: Sends email: "Recruiter wants to contact you!"
```

### 3.4 Secure Code Judge Submission Flow

```mermaid
sequenceDiagram
    actor Student
    participant Editor as Monaco React Editor
    participant NextJS as Next.js Web App
    participant Redis as Redis Queue
    participant Worker as Judge Worker Daemon
    participant Docker as Sandbox Container
    participant NeonDB as Neon DB

    Student ->> Editor: Clicks "Submit Code"
    Editor ->> NextJS: submitCodeAction(problemId, code, language="CPP")
    NextJS ->> NeonDB: Save Submission (Status: QUEUED)
    NextJS ->> Redis: Push job to judge:queue
    NextJS -->> Editor: Return Submission ID (Stream SSE)
    Worker ->> Redis: Polls job from queue
    Worker ->> NeonDB: Update Submission (Status: COMPILING)
    Worker ->> Worker: Compile C++ binary locally
    alt Compiler Error
        Worker ->> NeonDB: Save status: CE, error details
    else Compilation Success
        Worker ->> NeonDB: Update Submission (Status: RUNNING)
        Worker ->> Docker: Spin up --net none sandbox
        Docker ->> Docker: Run binary with time limits & cgroups
        Docker -->> Worker: Return outputs & exit code
        Worker ->> Worker: Verify outputs against hidden test cases
        Worker ->> NeonDB: Save results (Status: ACCEPTED / WA / TLE / RE)
        Worker ->> Redis: Publish status update message
    end
    Redis -->> NextJS: SSE Stream receives completion
    NextJS -->> Editor: Update UI: ACCEPTED!
```
