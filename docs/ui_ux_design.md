# UI/UX Design System & Wireframes
## Project Name: "Learn. Practice. Compete. Showcase. Get Hired."
**Version**: 1.0.0  
**Author**: UI/UX Designer & Frontend Architect  
**Date**: June 3, 2026

---

## 1. Design System Tokens & Foundations

The platform uses a dark-first, premium interface designed for high-density information display (problem sheets, editors, tables). Light mode uses clean, elevated white grids.

### 1.1 Color Palette (Tailwind HSL Map)

```
=============================================================================
THEME DESIGN SYSTEM (DARK MODE DEFAULT)
=============================================================================
[Primary Dark]  #09090B (Background)       --> hsl(240 10% 3.9%)
[Secondary Card]#18181B (Elevated Card)     --> hsl(240 5.9% 10%)
[Accent Blue]   #2563EB (Brand/Action)      --> hsl(221.2 83.2% 53.3%)
[Accent Gold]   #EAB308 (Competitive CP)    --> hsl(47.9 95.8% 47.8%)
[Accept Green]  #22C55E (Accepted Solution) --> hsl(142.1 70.6% 45.3%)
[Error Red]     #EF4444 (Compile/WA Error)  --> hsl(0 84.2% 60.2%)
=============================================================================
```

*   **Primary Background**: Deep Obsidian (`hsl(240 10% 3.9%)`).
*   **Elevated Panels / Cards**: Charcoal Slate (`hsl(240 5.9% 10%)`) with border highlights (`hsl(240 3.7% 15.9%)`).
*   **Text Hierarchy**:
    *   *Primary*: Pure White (`hsl(0 0% 98%)`)
    *   *Secondary*: Cool Gray (`hsl(240 5% 64.9%)`)
    *   *Muted*: Dark Steel (`hsl(240 3.8% 46.1%)`)

### 1.2 Glassmorphism & Micro-animations
*   **Glassmorphic Sheets**: For overlays (modals, recruiter filters), use backdrop blurs: `bg-zinc-950/80 backdrop-blur-md border border-zinc-800`.
*   **Transitions**: Default interactive speed of `150ms` using cubic-bezier transitions (`transition-all duration-150 ease-out`).
*   **Scale Feedbacks**: Button hover scales slightly: `hover:scale-[1.02] active:scale-[0.98]`.

### 1.3 Typography
*   **UI Elements / Body Copy**: **Inter** or **Outfit** (Sans-serif) for high legibility.
*   **Code Elements / Editor**: **Fira Code** or **JetBrains Mono** with ligatures enabled for readable symbol spacing.

---

## 2. ASCII Wireframe Configurations

### 2.1 Public Student Profile (`/u/username`)
A recruiter-optimized profile focusing on ratings, solved tasks, and proof of work.

```
+---------------------------------------------------------------------------------------------------+
|  [Logo] LEARN. PRACTICE. COMPETE. SHOWCASE                                    [Open to Work] [JD] |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  +---------------------------------------+  +---------------------------------------------------+ |
|  | @jane_coder                           |  | COMPETITIVE CODING STATUS                         | |
|  | Jane Doe                              |  | Contest Rating: 1845 [Candidate Master]           | |
|  | University: FAST National University  |  | Global Rank: Top 1.8% | Univ Rank: #3             | |
|  | Bio: Fullstack engineer & CP enthusiast|  | +-----------------------------------------------+ | |
|  | [Skills: C++, Next.js, Redis, Docker ] |  | | RATING HISTORY GRAPH                          | | |
|  | [GitHub] [LinkedIn] [Resume.pdf]      |  | | 1900 |                  /\                      | | |
|  |                                       |  | | 1700 |      /\         /  \   /---              | | |
|  | [Contact Candidate]                   |  | | 1500 |-----/  \-------/    \-                      | | |
|  +---------------------------------------+  | +-----------------------------------------------+ | |
|                                             +---------------------------------------------------+ |
|                                                                                                   |
|  +----------------------------------------------------------------------------------------------+ |
|  | SOLVING HEATMAP (Last 12 Months)                                            Total: 412 Solves| |
|  | Jan [■][ ][■][■] Feb [■][■][■][ ] Mar [ ][■][■][■] ... Dec [■][■][■][■] (Green blocks by density)| |
|  +----------------------------------------------------------------------------------------------+ |
|                                                                                                   |
|  +---------------------------------------+  +---------------------------------------------------+ |
|  | SHOWCASE PROJECTS (GitHub Sync)       |  | VERIFIED CERTIFICATES (Max 3)                     | |
|  | 1. Distributed Cache System (C++)     |  | [■] AWS Certified Developer                       | |
|  |    Fast LRU cache, Dockerized, Redis. |  |     Verified via AWS Credential Verification      | |
|  | 2. Next.js Developer Hub              |  | [■] university-first-place-cert.pdf               | |
|  |    Interactive portfolio app.         |  |     Verified by FAST Admin Signature              | |
|  +---------------------------------------+  +---------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

---

### 2.2 Split-Pane Online Judge Interface
A grid-based work editor featuring Monaco. Editor occupies 60% width, problem definition and outputs occupy 40%.

```
+---------------------------------------------------------------------------------------------------+
| [Back to Catalog] Problem 45: Longest Common Subsequence (Medium)            [Time: 2.0s | Mem: 256MB] |
+------------------------------------+--------------------------------------------------------------+
| PROBLEM DESCRIPTION (40%)          | MONACO CODE EDITOR (60%)                                     |
| Given two strings text1 and text2, | 1  #include <iostream>                                       |
| return the length of their longest | 2  #include <vector>                                         |
| common subsequence...              | 3  using namespace std;                                      |
|                                    | 4                                                            |
| Input: text1 = "abcde",            | 5  int solveLCS(string t1, string t2) {                      |
|        text2 = "ace"               | 6      int n = t1.size(), m = t2.size();                      |
| Output: 3                          | 7      vector<vector<int>> dp(n+1, vector<int>(m+1, 0));      |
|                                    | 8      // Complete DP logic...                                |
| Constraints:                       | 9  }                                                         |
| - 1 <= text1.length <= 1000        |                                                              |
|                                    |                                                              |
| +----------------------------------+------------------------------------------------------------+
| | TEST CASES CONSOLE               | CONSOLE OUTPUT / JUDGE REPORT                              |
| | [Case 1] [Case 2] [Custom Input] | [Run Code] [Submit Code]                                    |
| | Input: text1 = "abc", text2="abc"| Status: RUNNING (Running test cases 12/40)                 |
| | Expected: 3                      | Execution Time: 42ms | Memory: 1420 KB                      |
| +----------------------------------+------------------------------------------------------------+
```

---

### 2.3 Contest Workspace
Dynamic dashboard for live competitions, showing problem access gates, timers, and real-time standings.

```
+---------------------------------------------------------------------------------------------------+
| CONTEST: Weekly Challenge #42                    [ TIMER: 01:24:12 ] [ Leaderboard Rank: #14 ]     |
+---------------------------------------------+-----------------------------------------------------+
| PROBLEMS LIST                               | LIVE CONTEST LEADERBOARD (Socket.io Powered)         |
|                                             |                                                     |
| [Solved] A: Easy Two Sum         (100 Pts)  | Rank  User          Solved  Score  Penalty          |
| [Solved] B: Binary Search Tree   (200 Pts)  | 1     alice_cp      4/4     1000   01:12:00         |
| [Failed] C: Graph Cycle Detect   (300 Pts)  | 2     bob_algo      4/4     1000   01:42:30         |
| [Active] D: Segment Tree Sum     (500 Pts)  | 3     jane_doe      3/4      800   00:54:10         |
|          E: K-th Permutation     (800 Pts)  | 14    YOU           2/4      300   00:45:00         |
|                                             |                                                     |
| +-------------------------------------------+-----------------------------------------------------+
| | SYSTEM ALERTS CHAT                                                                              |
| | [12:04] admin: Clarification added on problem D constraints.                                    |
| | [12:15] system: User 'alice_cp' solved problem E! (First solver)                                |
| +-------------------------------------------------------------------------------------------------+
```

---

### 2.4 Recruiter Sourcing Portal
An advanced dashboard layout allowing recruiters to filter, view profiles, and download resumes.

```
+---------------------------------------------------------------------------------------------------+
| TALENT FINDER PORTAL                                                         Credits Remaining: 42|
+-----------------------------------+---------------------------------------------------------------+
| FILTERS PANEL                     | SEARCH RESULTS                                                |
|                                   |                                                               |
| University:                       | [■] Jane Doe   - FAST National University (Rating: 1845)      |
| [ FAST National Univ    |v]       |     Skills: C++, Next.js, Redis, Docker                       |
|                                   |     Portfolio: Cache System (C++), API Gateway                |
| Rating Threshold:                 |     [View Profile] [Download Resume] [Send Message]            |
| Min: [ 1500 ]  Max: [ 2200 ]      |                                                               |
|                                   | [■] Alex Smith - UET Lahore (Rating: 1620)                    |
| Technologies:                     |     Skills: Python, Django, PostgreSQL                        |
| [x] C++  [x] Next.js  [ ] Java    |     Portfolio: Compiler parser, Microservice DB               |
|                                   |     [View Profile] [Download Resume] [Send Message]            |
| "Open To Work" Status:            |                                                               |
| (o) Show Only Open Candidates     | Page: [1]  2   3   4   5                                      |
| ( ) Show All Candidates           |                                                               |
+-----------------------------------+---------------------------------------------------------------+
```

---

### 2.5 Admin Panel & Verification Dashboard
Dashboard for system admins to manage user verification queues.

```
+---------------------------------------------------------------------------------------------------+
| ADMIN WORKSPACE                                                         [Users] [Problems] [Tasks]|
+------------------------------------+--------------------------------------------------------------+
| TEACHER VERIFICATION QUEUE         | RECRUITER VERIFICATION QUEUE                                 |
|                                    |                                                              |
| 1. Dr. John Carter                 | 1. Sarah Jenkins                                             |
|    Email: j.carter@nu.edu.pk       |    Company: Google Cloud Sourcing Ltd.                       |
|    Document: faculty_id_card.pdf   |    Corporate Email: sarah.jenkins@google.com                 |
|    [Approve] [Reject] [View Doc]   |    [Approve] [Reject] [Verify domain via DNS]                |
|                                    |                                                              |
| 2. Prof. Amara Cole                | 2. Keith Miller                                              |
|    Email: cole_amara@nust.edu.pk   |    Company: TechStartup Corp                                 |
|    [Approve] [Reject]              |    [Approve] [Reject]                                         |
+------------------------------------+--------------------------------------------------------------+
```
