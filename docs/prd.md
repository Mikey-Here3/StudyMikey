# Product Requirements Document (PRD)
## Project Name: "Learn. Practice. Compete. Showcase. Get Hired."
**Version**: 1.0.0  
**Author**: Principal Product Manager & Startup Founder  
**Date**: June 3, 2026

---

## 1. Product Vision & Value Proposition

### 1.1 Executive Summary
"Learn. Practice. Compete. Showcase. Get Hired." is a unified, production-grade ecosystem that bridges the gap between academic programming, competitive coding, professional portfolios, and technical recruitment. Currently, students use fragmented tools: **LeetCode** for interview prep, **Codeforces** for competitive programming, **GitHub** for code hosting, **LinkedIn** for professional networking, and institutional portals for university coursework. 

This platform aggregates these distinct activities into a single cohesive experience. By tracking a student’s journey from their first line of code to their university contests, project showcases, and verified achievements, the platform offers recruiters a high-fidelity, cheat-resistant, and comprehensive view of a developer's real technical abilities.

```
+---------------------------------------------------------------------------------+
|                                 THE PLATFORM                                    |
|                                                                                 |
|  [ LEARN ]        [ PRACTICE ]       [ COMPETE ]      [ SHOWCASE ]  [ GET HIRED ]
|  DSA Roadmaps    Coding Problems     Contests         GitHub Sync   Recruiter   |
|  Video/Notes     SQL / Debugging     University Duel  Certificates  Search/Filters|
+---------------------------------------------------------------------------------+
```

### 1.2 Core Value Propositions
*   **For Students**: A single hub to learn programming, measure skills against peers globally and within their university, showcase actual projects, and land jobs without writing cover letters.
*   **For Universities**: A branded interface to host internal contests, benchmark students against other national universities, and showcase institutional talent.
*   **For Recruiters**: Access to a talent pool with verified coding skills, university ratings, cheat-proof contest histories, and direct showcase integrations (reducing sourcing time by up to 70%).
*   **For Teachers**: An automated grading tool to create and manage coding labs, quizzes, and university contests.

---

## 2. Target Users & Role-Based Access Control (RBAC)

The system features four distinct user roles, enforced via JWT claims and session checks.

| Role | Core Objective | Privileges & Permissions |
| :--- | :--- | :--- |
| **Student** | Learn, solve problems, compete, showcase work, get hired. | - Solve problems & view editorials<br>- Submit code to the online judge (C++)<br>- Enter contests and join teams<br>- Customize public developer profile (`/u/username`)<br>- Showcase up to 5 projects & upload up to 3 certificates<br>- Toggle "Open to Work" status |
| **Teacher** | Teach, evaluate, host academic contests, manage curricula. | - All Student privileges<br>- Create/edit problems (private or public)<br>- Create/edit contests (university-exclusive or open)<br>- Manage classroom sections and student rosters<br>- View detailed submission reports of students |
| **Recruiter** | Discover, filter, inspect, and hire top-tier student developers. | - Access Recruiter Portal<br>- Advanced search: Filter by rating, university, skills, problems solved<br>- View public portfolio, code quality, contest trends, and verified resume<br>- Contact student directly via built-in messaging or email |
| **Admin** | Maintain platform integrity, verify accounts, curate content. | - Complete access to Admin Dashboard<br>- Verify Teachers & Recruiters (manual audit workflow)<br>- Moderate comments, problems, and public profiles<br>- Manage national university directory and scores<br>- System health analytics |

---

## 3. Feature Prioritization Matrix (MoSCoW)

To build a viable and competitive MVP, features are categorized using the MoSCoW framework:

```
+-------------------------------------------------------------------------------+
|                                  MOSCOW MATRIX                                 |
+------------------------------------+------------------------------------------+
| MUST HAVE (MVP Release)            | SHOULD HAVE (Post-MVP Core)              |
| - JWT & Google OAuth               | - Real-time Socket.IO chat (Recruiter)   |
| - Student Profiles (/u/username)   | - Gamification XP/Streak System          |
| - Sandbox C++ Judge & Submissions  | - Python / Java / JavaScript support     |
| - Basic Contest Engine (Standard)  | - PDF Resume Generator from Profile      |
| - University Pages & Leaderboards  | - SQL and Debugging Challenges           |
+------------------------------------+------------------------------------------+
| COULD HAVE (Delighters)            | WON'T HAVE (Future Scope)                |
| - Interactive DSA Roadmap Path     | - Multi-language Voice/Video Interviews  |
| - GitHub Repo Code Quality Audit   | - Native IDE Plugin (VS Code extension)  |
| - Automated Plagiarism Detection   | - Automated Payroll / HR Portal Integration|
+------------------------------------+------------------------------------------+
```

### 3.1 Must Have (MVP)
*   **Authentication**: Email/Password and Google OAuth with role assignment.
*   **Student Profile (`/u/username`)**: Base bio, university association, dynamic submission heatmap (GitHub style), contest rating graph, and certificate uploads (max 3).
*   **Problem Library**: Coding problems filtered by tags and difficulty (Easy, Medium, Hard). C++ compilation & sandboxed running with time/memory limit verification.
*   **Contest Engine**: Standard contests, leaderboard with time penalties, countdown timers.
*   **University Pages**: Dedicated page for institutional students, internal rankings, and average performance rating.
*   **Recruiter Search**: Filter by rating, skills, university, and "Open to Work" status.

### 3.2 Should Have (Post-MVP Phase 1)
*   **Multi-language Judge**: Extension to Python, Java, and JavaScript (Node.js).
*   **Project Showcase & GitHub Sync**: Import repositories directly from GitHub and display demo videos/screenshots.
*   **Gamification**: XP points per solve, level-up animations, custom achievement badges (e.g., "Graph Master", "DP Master", "7-Day Streak").
*   **Teacher/Recruiter Verification Flow**: Document upload panel for teachers and company email check for recruiters.

### 3.3 Could Have (Post-MVP Phase 2)
*   **Interactive Learning Roads**: Nodes for DSA (Data Structures & Algorithms), System Design, and Interview Prep.
*   **Plagiarism Detection**: Moss-like source code parsing for contests to prevent cheating.
*   **Team Contests**: Multi-user team participation with shared code submission capabilities.

---

## 4. Detailed Module Specifications

### 4.1 Learning & Roadmaps Module
*   **DSA Roadmaps**: Visual node graph of concepts (e.g., Arrays -> Linked Lists -> Trees -> Graphs -> Dynamic Programming). Users must unlock preceding nodes or pass a diagnostic test.
*   **Interview Prep Paths**: Curated collections (e.g., "Top 75 Interview Questions").
*   **Personal Notes & Resources**: Markdown notebook attached to each problem. A globally accessible resource library containing curated articles, books, and reference cheat sheets.

### 4.2 Problem Solving & Online Judge Module
*   **Problem Meta-Data**: Title, Slug, Description (Markdown), Difficulty (Easy/Medium/Hard), Time Limit (ms), Memory Limit (MB), Constraints, Tags, Input/Output examples.
*   **Challenge Types**:
    1.  *Standard Algorithmic*: C++ code solving dynamic test cases.
    2.  *MCQs*: Conceptual computer science and logic assessments.
    3.  *SQL Challenges*: Execute queries against an ephemeral Postgres database and match resulting data frames.
    4.  *Debugging Challenges*: Provided buggy code; must fix lines under a maximum changed-line limit.
    5.  *System Design Questions*: Interactive architectural diagrams (Mermaid) with text justifications for evaluation by verified teachers.
*   **Test Cases**: Public examples, hidden validation cases, and large corner-case edge files.
*   **Submissions Feed**: Real-time status update via Server-Sent Events (SSE) or WebSockets: `Queued` -> `Compiling` -> `Running` -> `Accepted / Wrong Answer / Time Limit Exceeded / Runtime Error / Memory Limit Exceeded`.

### 4.3 Contest Module
*   **Contest Creation**: Restricted to verified Teachers and Admins. Students can draft a contest proposal and request verification from an admin.
*   **Contest Categories**:
    *   *Weekly Contests*: Platform-wide, rating-affecting contests.
    *   *University Contests*: Private/public contests restricted to students of specific universities.
    *   *Team Contests*: Group-based competitions with shared workspaces.
*   **Leaderboard Logic**: Rank by total solved problems. Tie-breaker based on penalty time. Penalty time = elapsed time from contest start to correct submission + 20 minutes for every wrong submission prior to the accepted one.

### 4.4 University Module
*   **National leaderboard**: Universities ranked by a global University Score.
*   **Score formula**:
    $$\text{University Score} = \text{Top } 10\% \text{ Students' Avg Rating} \times 0.6 + \text{Total Active Solvers Weight} \times 0.2 + \text{Contest Participation Score} \times 0.2$$
*   **University Portal**: Admin verified list of students, active contests, recent achievements, and leaderboard of top students inside the university.

### 4.5 Social Coding & Profiles
*   **Follow System**: Social feed showing followings' recent achievements, contest participations, and public project showcase uploads.
*   **Showcase Portal**: GitHub-linked cards featuring a custom title, description, technology tags, live demo link, and screenshot uploaded to Cloudinary.
*   **Resume Verification**: High-definition PDF resume uploading. Students can display up to three professional certificates (e.g., AWS, Google Cloud, university credentials) validated via cryptographic URL checks or verified manual admin approval.

### 4.6 Recruiter Portal & Sourcing
*   **Sourcing Engine**: Elastic-style filters. Recruiters can select:
    *   "Minimum Rating: 1600 (Candidate Master)"
    *   "University: FAST or NUST"
    *   "Skills: C++, Next.js, Redis"
    *   "Solves: 200+ Medium Problems"
*   **Recruiter Inbox**: Direct email/internal outreach system. Limit recruiters to 50 outbound contacts/month (scalable via premium tier) to prevent student spam.

---

## 5. Gamification & Engagement

### 5.1 XP and Leveling System
Every correct submission rewards XP based on difficulty:
*   **Easy**: 10 XP
*   **Medium**: 30 XP
*   **Hard**: 100 XP
*   **Contest solves**: 1.5x XP multiplier.

Levels are calculated using a quadratic progression:
$$\text{Required XP for Level } L = 100 \times L^2$$

### 5.2 Dynamic Badges
Badges are displayed on the public profile:
*   *DP Master*: Solved 50 Dynamic Programming problems.
*   *University Champion*: Ranked 1st in an official university-wide contest.
*   *First Blood*: First correct solution globally on a new problem.
*   *Streak Warrior*: Maintained a 30-day active problem-solving streak.

---

## 6. Monetization Plan & Startup Economics

```
+-----------------------------------------------------------------------------------+
|                                 MONETIZATION TRIDENT                              |
|                                                                                   |
|      [ B2B Recruiter SaaS ]      [ B2C Premium Prep ]     [ University Portals ]  |
|      - Talent Sourcing           - AI Code Companion      - White-labeled LMS     |
|      - Direct Outreach           - Mock Interview Gen     - Anti-cheat Exams      |
|      - Pre-hire assessments       - Advanced editorials    - Performance analytics |
+-----------------------------------------------------------------------------------+
```

### 6.1 B2B Recruiter SaaS (Premium Sourcing & Hiring)
*   **Basic Tier**: $199/month. 30 searches/month, 20 student outreach limit.
*   **Pro Tier**: $499/month. Unlimited filtering, 100 student outreach credits, candidate comparison matrices, access to verified resumes.
*   **Enterprise Assessment**: Custom pricing. Allows recruiters to host custom private hiring hackathons and automated coding tests on the platform sandbox.

### 6.2 B2C Student Premium Subscription
*   **Price**: $9.99/month or $79/year (Student-friendly pricing).
*   **Features Included**:
    *   AI code explainer & debug assistant (OpenAI API wrapper with token limits).
    *   Access to advanced system design editorials.
    *   Company-specific interview preparation pathways (e.g., Google, Meta curated tracks).
    *   Premium Profile Customization (custom badge highlights, featured projects, premium resume themes).

### 6.3 B2D/B2G University Partnership Program
*   **Institutional License**: $1,200/year per department.
*   **Features**:
    *   White-labeled university subdomain (e.g., `fast.platform.com`).
    *   Automated assignment grading with plagiarism detection (anti-cheating reports).
    *   Direct student progress exports for professors (CSV, JSON, Canvas LMS integration).

---

## 7. Legal, Compliance & Privacy Constraints
*   **Student Privacy (FERPA Compliance)**: Universities cannot expose grades or enrollment data without consent. All student profile indexing for recruiters is strictly opt-in. Students must explicitly toggle "Visible to Recruiters".
*   **GDPR / CCPA Consent**: Users can request complete profile deletion ("Right to be Forgotten"). Since profiles contain public links and resumes, all personal PDFs and data from Cloudinary and Neon must be purged within 30 days of request.
*   **Copyrighted Content**: Plagiarism checks must ensure users don't upload proprietary school assignments to the public Showcase section.
