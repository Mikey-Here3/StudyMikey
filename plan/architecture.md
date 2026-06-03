# System & Online Judge Architecture
## Project Name: "StudyMikey"
**Version**: 1.0.0  
**Author**: Principal Software Architect & DevOps Engineer  
**Date**: June 3, 2026

---

## 1. High-Level System Architecture

This platform uses a modern serverless hybrid model. The main web client and API are built on **Next.js** (StudyMikey Application), deployed to a serverless edge platform (e.g., Vercel), leveraging **Neon Serverless PostgreSQL** for database needs and **Cloudinary** for image/media assets. High-performance, long-running operations (like the Online Judge code execution and real-time Socket.IO communication) are routed to dedicated containerized instances.

```mermaid
graph TD
    %% Clients
    WebClient[Next.js Web App] -->|HTTPS / Next.js Server Actions| NextJS[Next.js Serverless API Router]
    MobileClient[React Native App] -->|HTTPS REST API| NextJS
    WebClient <-->|WebSockets| SocketIO[Standalone Real-time SSE / WS Server]
    MobileClient <-->|WebSockets| SocketIO

    %% Serverless Backend & DB
    subgraph Vercel/Edge Environment
        NextJS -->|Connection Pooling / Prisma| NeonDB[(Neon Serverless Postgres)]
        NextJS -->|Media Uploads / SDK| Cloudinary[Cloudinary Media Storage]
        NextJS -->|Push Jobs| Redis[(Upstash Redis Cache / Queue)]
    end

    %% Online Judge Workers
    subgraph Private VPC (Virtual Private Cloud)
        Redis <-->|Job Polling / BullMQ| JudgeWorkerPool[Judge Workers Pool]
        JudgeWorkerPool -->|Docker Run Sandbox| Compilers[Secure C++ Sandboxes]
        JudgeWorkerPool -->|Direct DB Link| NeonDB
        JudgeWorkerPool -->|Broadcast Results| SocketIO
    end
```

---

## 2. Secure Online Judge Sandbox Architecture

The execution of user-submitted C++ code poses high security risks. We implement a **Docker-based isolated runner pool** using a queue-worker architecture.

```
                  ONLINE JUDGE SUBMISSION WORKFLOW
                  
 [Next.js App] ---> [Upstash Redis Queue] ---> [Judge Worker (VM)]
       ^                                               |
       | (SSE/WebSocket Event)                         v
  [Socket.IO] <---- [Notify Status] <---- [Execute in Docker Sandbox]
```

### 2.1 Worker Daemon Design
The worker is a Node.js daemon (or Go binary) running on dedicated Linux VMs (e.g., AWS EC2, DigitalOcean Droplets). It listens to the Redis-backed **BullMQ** queue for new submissions.
*   **Decoupled Operation**: Next.js serverless routes push metadata (submission ID, code snippet, problem constraints, input/output files) to Redis and return a `202 Accepted` status to the client immediately.
*   **State Machine**: The worker updates the submission status in Neon DB at each phase: `Compiling` -> `Running` -> `Completed/Failed`.

### 2.2 Compilation and Execution Isolation
For each C++ submission, the worker creates a local ephemeral directory, writes the user's code, compiles it, and runs the compiled binary inside a strict Docker container.

```dockerfile
# Base secure compiler image (Dockerfile.cpp-sandbox)
FROM alpine:3.18
RUN apk add --no-cache g++ build-base security-utils
RUN adduser -D -u 1001 sandbox_user
USER sandbox_user
WORKDIR /app
```

#### Secure Execution Command
When executing the compiled binary, the daemon calls Docker with flags designed to prevent security breaches, resource exhaustion, and malicious actions:

```bash
docker run --rm \
  --net none \
  --memory="256m" \
  --memory-swap="256m" \
  --cpu-shares=512 \
  --pids-limit=64 \
  --read-only \
  --user=1001:1001 \
  -v /var/run/submission_123:/app:ro \
  cpp-sandbox-runner \
  timeout -s KILL 2s ./user_binary < input_1.txt
```

### 2.3 Sandbox Security Policies
1.  **Network Isolation (`--net none`)**: Prevents submissions from initiating outbound network connections (prevents code from joining botnets, fetching malware, or making requests to our database).
2.  **Resource Constraints (cgroups)**:
    *   `--memory="256m"`: Limits maximum RAM allocation to 256MB. Prevents memory exhaustion attacks (Fork bombs, large array allocations).
    *   `--cpu-shares=512`: Constrains CPU usage.
    *   `--pids-limit=64`: Limits the maximum number of simultaneous threads/processes to prevent process fork-bombing.
3.  **Read-Only Filesystem (`--read-only`)**: The container root filesystem is entirely write-locked. The runner only mounts the specific compilation folder as read-only (`:ro`).
4.  **Least Privilege Execution**: The binary runs under `sandbox_user` (non-root UID `1001`), ensuring that container escape attempts cannot gain root privileges on the host system.
5.  **Execution Time Limits (`timeout -s KILL 2s`)**: Prevents infinite loops. If the program exceeds the time threshold, it is forcibly terminated with a `SIGKILL`, registering a Time Limit Exceeded (TLE) result.

---

## 3. Real-Time Architecture (Leaderboards & Notifications)

Next.js Serverless environments are short-lived and do not maintain open TCP streams (WebSockets). To support live updates, we deploy a hybrid model:

```
 [Clients] <-------------------- WebSocket (Socket.IO) --------------------+
     |                                                                     |
     v (HTTPS Actions)                                                     |
 [Next.js Server] ---> [Upstash Redis Pub/Sub] ---> [Node.js WS Service] --+
```

*   **Upstash Redis Pub/Sub**: When a submission completes, or a leaderboard update occurs, the Next.js server publishes the event payload to a Redis channel (e.g., `realtime:submissions`).
*   **Standalone WebSocket Microservice**: A lightweight, stateful Node.js service running on a container instance (e.g., Fly.io, Railway) subscribes to Upstash Redis. Upon receiving messages, it broadcasts them to matching WebSockets clients connected via Socket.IO.
*   **Fallback to Server-Sent Events (SSE)**: For simple notification streams, clients can connect directly to a Next.js Edge route utilizing SSE (Server-Sent Events) connected to Redis Pub/Sub, removing the need for a secondary WebSocket cluster in early development stages.

---

## 4. Mobile App Architecture

The mobile companion app targets students and recruiters who need on-the-go notifications, contest schedules, profile browsing, and showcase portfolios.

```mermaid
graph LR
    subgraph Mobile Application (React Native)
        UI[React Components & NativeWind CSS] --> Query[TanStack Query - Data Sync]
        Query --> SQLite[(Local SQLite Cache)]
        Query --> Network[Secure Axios API Client]
    end
    Network -->|HTTPS REST / Auth Header| Gateway[Next.js API Routes]
```

### 4.1 Technology Stack
*   **Framework**: React Native with Expo (for rapid development and cross-platform consistency).
*   **Language**: TypeScript.
*   **Styling**: NativeWind (Tailwind CSS for React Native).
*   **State & Caching**: TanStack Query (React Query) for handling network queries, caching, and server state synchronizations.
*   **Local Offline Storage**: SQLite (via Expo SQLite) or WatermelonDB for highly reactive local sync of roadmaps, offline problem viewing, and offline notes drafts.

### 4.2 Sync Strategy & Offline Capabilities
*   **Offline First Problem Viewing**: The app caches previously viewed problems and roadmaps. Students can read problem statements, view templates, and draft code offline.
*   **Sync Queue**: If a user submits notes or updates their portfolio while offline, the inputs are logged to a local SQLite table. When connection is restored, a background service pushes the queue up to the Next.js backend API.
*   **Push Notifications**: Integrated with Expo Notification Service (APNS for iOS, FCM for Android). A background cron pushes contest countdowns and recruiter message updates.

---

## 5. Scaling & DevOps Strategy

### 5.1 Next.js & Serverless Optimization
*   **ISR (Incremental Static Regeneration)**: University pages and problem description pages are statically rendered on the CDN with a revalidation time (e.g., 60 seconds). This keeps database queries close to zero during high-traffic contests.
*   **Edge Middleware**: Route validation and JWT/RBAC role checks are executed in Edge Middleware to abort unauthorized requests before starting serverless functions, saving computation time and cost.

### 5.2 Neon Postgres & Database Scaling
*   **Connection Pooling**: Uses Neon’s built-in **PgBouncer** connection pooler. Serverless functions connect via the pooled URL (`-pooler`) to prevent running out of database connections.
*   **Read Replicas**: Direct query scaling by routing read-heavy endpoints (e.g., viewing public profiles, searching students, reading problems) to Neon's read-only replicas, reserving the primary database node for writes (submissions, updates).

### 5.3 Redis Caching Topology
To minimize PostgreSQL loads, Redis stores hot data:

```
[Request] ---> [Redis Cache Hit?] --Yes--> [Return Data]
                   |
                  No
                   v
          [Query Neon DB] ---> [Write to Redis] ---> [Return Data]
```

*   **Leaderboard Cache**: Real-time contest standings are updated in Redis Sorted Sets (`ZSET`). The backend reads ranks via `ZREVRANGEBYSCORE`, maintaining $O(\log N + M)$ lookup times.
*   **Session Store**: While JWTs are stateless, high-security sessions (like active recruiter searches or admin actions) check a Redis blacklist cache for revoked tokens.
