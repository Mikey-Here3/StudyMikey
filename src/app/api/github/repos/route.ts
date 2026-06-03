import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Fallback repositories for local developer preview / demo logins
const MOCK_REPOS = [
  {
    name: "lru-cache-cpp",
    description: "High-performance memory-mapped Least Recently Used (LRU) Cache written in C++ with custom concurrency mutex locks.",
    html_url: "https://github.com/jane-coder/lru-cache-cpp",
    language: "C++",
  },
  {
    name: "studymikey-platform",
    description: "Next.js online judge system featuring Monaco split-pane compiler workrooms and real-time SSE submission status feeds.",
    html_url: "https://github.com/jane-coder/studymikey-platform",
    language: "TypeScript",
  },
  {
    name: "distributed-broker-go",
    description: "A lightweight message broker designed in Golang with support for pub/sub paradigms and TCP socket protocols.",
    html_url: "https://github.com/jane-coder/distributed-broker-go",
    language: "Go",
  },
  {
    name: "query-optimizer-rust",
    description: "Raft consensus implementation in Rust compiling optimized index structures and query execution plans.",
    html_url: "https://github.com/jane-coder/query-optimizer-rust",
    language: "Rust",
  },
  {
    name: "star-pattern-printer",
    description: "Tricky matrix traversals, hollow stars, and pyramid rendering challenges in standard C++ scripts.",
    html_url: "https://github.com/jane-coder/star-pattern-printer",
    language: "C++",
  },
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = (session as any).accessToken;

    if (!token || token === "dummy-client-id") {
      console.log("No live GitHub OAuth token found in session. Loading simulated repository options.");
      return NextResponse.json({ repos: MOCK_REPOS, isSimulated: true });
    }

    console.log("Fetching live repositories from GitHub API...");
    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "StudyMikey",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("GitHub API responded with error status:", response.status, errText);
      return NextResponse.json({ repos: MOCK_REPOS, isSimulated: true, error: "API limit or expired token" });
    }

    const data = await response.json();
    const repos = data.map((repo: any) => ({
      name: repo.name,
      description: repo.description || "No description provided.",
      html_url: repo.html_url,
      language: repo.language || "C++",
    }));

    return NextResponse.json({ repos, isSimulated: false });
  } catch (error: any) {
    console.error("Failed to query GitHub repositories API:", error);
    return NextResponse.json({ repos: MOCK_REPOS, isSimulated: true });
  }
}
