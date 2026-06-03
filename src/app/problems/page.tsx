import React from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/shared/footer";
import { getProperProblemTitle } from "@/lib/problems-utils";
import { db } from "@/db";
import { problems } from "@/db/schema";
import { eq, like, and, count } from "drizzle-orm";
import { Code2, Search, Trophy, Flame, ArrowRight, ChevronLeft, ChevronRight, Target, BarChart3, BookOpen, Clock, HardDrive, Sparkles, Layers, Cpu, Binary, Box, Grid3X3, Braces, Play, Zap } from "lucide-react";

// Concept categories with images
const CONCEPTS = [
  { key: "dsa-array", label: "Arrays & Math", desc: "Master array manipulation, sorting algorithms, and mathematical problem-solving patterns.", icon: BarChart3, image: "/concepts/dsa.png", gradient: "from-blue-600 to-indigo-600", lightBg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", count: 170, prefix: "DSA Array" },
  { key: "dsa-string", label: "String Parsing", desc: "Dive into string manipulation, pattern matching, compression, and palindrome detection.", icon: Braces, image: "/concepts/strings.png", gradient: "from-violet-600 to-purple-600", lightBg: "bg-violet-50", border: "border-violet-100", text: "text-violet-700", count: 170, prefix: "DSA String" },
  { key: "oop", label: "OOP Design", desc: "Design classes, implement data structures, and apply object-oriented principles in C++.", icon: Box, image: "/concepts/oop.png", gradient: "from-amber-500 to-orange-500", lightBg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", count: 165, prefix: "OOP Class" },
  { key: "dp", label: "Dynamic Programming", desc: "Solve optimization problems using memoization, tabulation, and state transition techniques.", icon: Cpu, image: "/concepts/dp.png", gradient: "from-emerald-600 to-teal-600", lightBg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", count: 165, prefix: "Dynamic Programming" },
  { key: "bit", label: "Bit Manipulation", desc: "Master bitwise operations, XOR tricks, Hamming weights, and power-of-two validations.", icon: Binary, image: "/concepts/bits.png", gradient: "from-cyan-600 to-sky-600", lightBg: "bg-cyan-50", border: "border-cyan-100", text: "text-cyan-700", count: 165, prefix: "Bit Manipulation" },
  { key: "pattern", label: "Pattern Printing", desc: "Build pyramids, diamonds, spirals, and Pascal's triangles through logical nested loops.", icon: Grid3X3, image: null, gradient: "from-pink-500 to-rose-500", lightBg: "bg-pink-50", border: "border-pink-100", text: "text-pink-700", count: 165, prefix: "Tricky Pattern" },
];

const FALLBACK_PROBLEMS = [
  { id: "two-sum-id", title: "Two Sum", slug: "two-sum", difficulty: "EASY" as const, timeLimit: 2000, memoryLimit: 256 },
  { id: "fib-id", title: "Fibonacci Number", slug: "fibonacci-number", difficulty: "EASY" as const, timeLimit: 1000, memoryLimit: 128 },
  { id: "lcs-id", title: "Longest Common Subsequence", slug: "longest-common-subsequence", difficulty: "MEDIUM" as const, timeLimit: 2000, memoryLimit: 256 },
  { id: "lru-cache-id", title: "LRU Cache Design", slug: "lru-cache-design", difficulty: "HARD" as const, timeLimit: 3000, memoryLimit: 512 },
];

function getBoilerplateSnippet(title: string) {
  const t = title.toLowerCase();
  if (t.includes("array") || t.includes("math")) {
    return `// Arrays & Math
#include <vector>
int solve(std::vector<int>& arr) {
  int n = arr.size();
  // TODO: Implement solution
}`;
  }
  if (t.includes("string") || t.includes("parse")) {
    return `// String Parsing
#include <string>
bool isMatch(std::string s) {
  // TODO: Match pattern
}`;
  }
  if (t.includes("oop") || t.includes("class")) {
    return `// OOP Design
class Challenge {
private:
  int value;
public:
  Challenge(int v) : value(v) {}
};`;
  }
  if (t.includes("dynamic") || t.includes("dp")) {
    return `// Dynamic Programming
#include <vector>
int fib(int n, std::vector<int>& dp) {
  if (n <= 1) return n;
  if (dp[n] != -1) return dp[n];
  return dp[n] = fib(n-1, dp) + fib(n-2, dp);
}`;
  }
  if (t.includes("bit") || t.includes("binary")) {
    return `// Bit Manipulation
bool isPowerOfTwo(int n) {
  return n > 0 && (n & (n - 1)) == 0;
}`;
  }
  if (t.includes("pattern") || t.includes("print")) {
    return `// Pattern Printing
void printPattern(int rows) {
  for(int i=0; i<rows; ++i) {
    std::cout << "*";
  }
}`;
  }
  return `// C++ Challenge
#include <iostream>
void solve() {
  // Write C++ code here
}`;
}

interface ProblemsPageProps {
  searchParams: Promise<{ q?: string; difficulty?: string; concept?: string; page?: string }>;
}

export default async function ProblemsPage({ searchParams }: ProblemsPageProps) {
  const { q = "", difficulty = "", concept = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);
  const itemsPerPage = 25;

  let problemList: typeof FALLBACK_PROBLEMS = [];
  let totalItems = 0;
  let totalPages = 1;

  const activeConcept = CONCEPTS.find(c => c.key === concept);
  const conceptPrefix = activeConcept?.prefix || "";

  try {
    const queryConditions: any[] = [];
    if (q) queryConditions.push(like(problems.title, `%${q}%`));
    if (difficulty) queryConditions.push(eq(problems.difficulty, difficulty.toUpperCase() as any));
    if (conceptPrefix) queryConditions.push(like(problems.title, `${conceptPrefix}%`));

    const results = await db
      .select({ id: problems.id, title: problems.title, slug: problems.slug, difficulty: problems.difficulty, timeLimit: problems.timeLimit, memoryLimit: problems.memoryLimit })
      .from(problems)
      .where(queryConditions.length > 0 ? and(...queryConditions) : undefined)
      .limit(itemsPerPage)
      .offset((currentPage - 1) * itemsPerPage);

    problemList = results.map((p: any) => ({ ...p, difficulty: p.difficulty as any }));

    const [countResult] = await db.select({ val: count() }).from(problems).where(queryConditions.length > 0 ? and(...queryConditions) : undefined);
    totalItems = countResult?.val || 0;
    totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    if (problemList.length === 0 && !q && !difficulty && !concept) {
      problemList = FALLBACK_PROBLEMS;
      totalItems = FALLBACK_PROBLEMS.length;
      totalPages = 1;
    }
  } catch {
    const filtered = FALLBACK_PROBLEMS.filter(p => {
      const mq = p.title.toLowerCase().includes(q.toLowerCase());
      const md = difficulty ? p.difficulty.toLowerCase() === difficulty.toLowerCase() : true;
      return mq && md;
    });
    problemList = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    totalItems = filtered.length;
    totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  }

  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = { q, difficulty, concept, page: "1", ...overrides };
    if (merged.q) params.set("q", merged.q);
    if (merged.difficulty) params.set("difficulty", merged.difficulty);
    if (merged.concept) params.set("concept", merged.concept);
    if (merged.page && merged.page !== "1") params.set("page", merged.page);
    const qs = params.toString();
    return `/problems${qs ? `?${qs}` : ""}`;
  };

  // Show grid view when no concept is selected (landing state)
  const showGrid = !concept;

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-rose-500/10 relative overflow-hidden animate-fade-in-up">
      <div className="absolute inset-0 glow-mesh pointer-events-none z-0" />
      <div className="absolute inset-0 mesh-grid opacity-[0.35] pointer-events-none z-0" />

      {/* ═══════════ HERO SECTION ═══════════ */}
      <div className="relative z-10 border-b border-zinc-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Text */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-100 bg-rose-50/60 text-[10px] font-black text-rose-600 uppercase tracking-wider shadow-sm">
                <Code2 className="h-3.5 w-3.5" />
                1,000+ C++ Challenges
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight leading-[1.08]">
                Practice Arena
              </h1>
              <p className="text-sm text-zinc-500 font-semibold max-w-md leading-relaxed">
                Master algorithms and data structures through curated challenges organized by concept. Write, compile, and test your C++ solutions in our sandboxed judge.
              </p>

              {/* Quick Action Chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href="/problems?concept=dsa-array" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-[10px] font-bold text-zinc-600 hover:border-rose-200 hover:text-rose-700 hover:bg-rose-50/50 transition-all shadow-sm">
                  <BarChart3 className="h-3 w-3" /> Arrays
                </Link>
                <Link href="/problems?concept=oop" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-[10px] font-bold text-zinc-600 hover:border-rose-200 hover:text-rose-700 hover:bg-rose-50/50 transition-all shadow-sm">
                  <Box className="h-3 w-3" /> OOP
                </Link>
                <Link href="/problems?concept=dp" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-[10px] font-bold text-zinc-600 hover:border-rose-200 hover:text-rose-700 hover:bg-rose-50/50 transition-all shadow-sm">
                  <Cpu className="h-3 w-3" /> DP
                </Link>
                <Link href="/problems?concept=bit" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-[10px] font-bold text-zinc-600 hover:border-rose-200 hover:text-rose-700 hover:bg-rose-50/50 transition-all shadow-sm">
                  <Binary className="h-3 w-3" /> Bits
                </Link>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 pt-3">
                <div>
                  <span className="block text-2xl font-black text-zinc-950 tabular-nums">{totalItems.toLocaleString()}</span>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Challenges</span>
                </div>
                <div className="h-8 w-px bg-zinc-200" />
                <div>
                  <span className="block text-2xl font-black text-zinc-950">6</span>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Concepts</span>
                </div>
                <div className="h-8 w-px bg-zinc-200" />
                <div>
                  <span className="block text-2xl font-black text-zinc-950">3</span>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Difficulty</span>
                </div>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="hidden md:block relative">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 shadow-xl bg-zinc-950">
                <Image src="/concepts/coding-hero.png" alt="C++ Code Editor" width={600} height={400} className="w-full h-auto object-cover opacity-90" priority />
                {/* Floating overlay badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-zinc-200">
                  <div className="h-8 w-8 rounded-lg bg-rose-700 flex items-center justify-center">
                    <Play className="h-3.5 w-3.5 text-white fill-white" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-zinc-900 uppercase tracking-wider">Live Compiler</span>
                    <span className="block text-[8px] font-semibold text-zinc-400">Write → Compile → Submit</span>
                  </div>
                </div>
                {/* Floating XP badge */}
                <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-white" />
                  <span className="text-[9px] font-black text-white uppercase tracking-wider">+XP on Solve</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ CONCEPT GRID (shown when no concept filter is active) ═══════════ */}
      {showGrid && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-zinc-950 tracking-tight">Browse by Concept</h2>
              <p className="text-xs text-zinc-500 font-semibold mt-0.5">Choose a topic to start solving challenges</p>
            </div>
            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest hidden sm:block">
              6 Topics · 1,000 Challenges
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONCEPTS.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.key}
                  href={buildUrl({ concept: c.key, page: "1" })}
                  className="group relative bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  {/* Card Image */}
                  <div className={`relative h-36 bg-gradient-to-br ${c.gradient} overflow-hidden`}>
                    {c.image ? (
                      <Image src={c.image} alt={c.label} width={400} height={200} className="w-full h-full object-cover mix-blend-overlay opacity-60 group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="h-16 w-16 text-white/20" />
                      </div>
                    )}
                    {/* Count badge */}
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 text-[9px] font-black text-white uppercase tracking-wider">
                      {c.count} Problems
                    </div>
                    {/* Icon overlay */}
                    <div className="absolute bottom-3 left-3 h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <h3 className="text-sm font-black text-zinc-950 mb-1.5 group-hover:text-rose-700 transition-colors">
                      {c.label}
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed line-clamp-2">
                      {c.desc}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] font-black text-rose-700 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Start Solving <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════ HOW IT WORKS STRIP ═══════════ */}
      {showGrid && (
        <div className="relative z-10 border-y border-zinc-200/80 bg-zinc-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <h2 className="text-center text-lg font-black text-zinc-950 tracking-tight mb-8">How It Works</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Pick a Challenge", desc: "Browse 1,000+ problems across 6 concept categories. Filter by difficulty.", icon: Search, color: "bg-blue-50 text-blue-600 border-blue-100" },
                { step: "02", title: "Write & Compile", desc: "Code your solution in our Monaco C++ editor with syntax highlighting.", icon: Code2, color: "bg-rose-50 text-rose-600 border-rose-100" },
                { step: "03", title: "Earn XP & Rank Up", desc: "Submit and get instant feedback. Earn XP, maintain streaks, climb leaderboards.", icon: Trophy, color: "bg-amber-50 text-amber-600 border-amber-100" },
              ].map((item) => (
                <div key={item.step} className="text-center space-y-3">
                  <div className={`h-14 w-14 rounded-2xl ${item.color} border flex items-center justify-center mx-auto shadow-sm`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest block mb-1">Step {item.step}</span>
                    <h3 className="text-sm font-black text-zinc-950">{item.title}</h3>
                    <p className="text-[11px] text-zinc-500 font-semibold mt-1 max-w-xs mx-auto leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ PROBLEMS TABLE SECTION ═══════════ */}
      <div className="mx-auto max-w-7xl relative z-10 px-4 sm:px-6 py-8 grid gap-8 lg:grid-cols-12 items-start">

        {/* Problems List (9 cols) */}
        <div className="lg:col-span-9 space-y-5">

          {/* Active concept header */}
          {activeConcept && (
            <div className={`flex items-center justify-between ${activeConcept.lightBg} border ${activeConcept.border} rounded-2xl p-5`}>
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${activeConcept.gradient} flex items-center justify-center shadow-sm`}>
                  <activeConcept.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-sm font-black ${activeConcept.text}`}>{activeConcept.label}</h2>
                  <p className="text-[10px] text-zinc-500 font-semibold">{totalItems.toLocaleString()} challenges available</p>
                </div>
              </div>
              <Link href={buildUrl({ concept: "" })} className="text-[10px] font-black text-zinc-500 hover:text-zinc-900 uppercase tracking-wider transition-colors px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 shadow-sm">
                ✕ Clear
              </Link>
            </div>
          )}

          {/* Search + Difficulty Filter */}
          <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
            <form method="GET" className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input type="text" name="q" defaultValue={q} placeholder="Search challenges by name..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 py-2.5 pl-10 pr-4 text-xs font-semibold text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/5 shadow-sm" />
              {difficulty && <input type="hidden" name="difficulty" value={difficulty} />}
              {concept && <input type="hidden" name="concept" value={concept} />}
            </form>
            <div className="flex flex-wrap items-center gap-1.5">
              <Link href={buildUrl({ difficulty: "" })} className={`rounded-lg px-3.5 py-2 text-[10px] font-black tracking-wider uppercase border transition-all cursor-pointer ${!difficulty ? "border-zinc-800 bg-zinc-900 text-white shadow-sm" : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"}`}>All</Link>
              {[
                { label: "Easy", value: "easy", active: "border-emerald-600 bg-emerald-600 text-white" },
                { label: "Medium", value: "medium", active: "border-amber-600 bg-amber-600 text-white" },
                { label: "Hard", value: "hard", active: "border-red-600 bg-red-600 text-white" },
              ].map((d) => (
                <Link key={d.value} href={buildUrl({ difficulty: d.value })} className={`rounded-lg px-3.5 py-2 text-[10px] font-black tracking-wider uppercase border transition-all cursor-pointer ${difficulty === d.value ? `${d.active} shadow-sm` : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"}`}>{d.label}</Link>
              ))}
            </div>
          </div>

          {/* Grid View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 relative pb-10">
            {problemList.length > 0 ? (
              problemList.map((p, idx) => {
                let diffColor = "bg-zinc-50 text-zinc-600 border-zinc-200";
                let dotColor = "bg-zinc-400";
                if ((p.difficulty as string) === "EASY") {
                  diffColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  dotColor = "bg-emerald-500";
                } else if ((p.difficulty as string) === "MEDIUM") {
                  diffColor = "bg-amber-50 text-amber-700 border-amber-200";
                  dotColor = "bg-amber-500";
                } else if ((p.difficulty as string) === "HARD") {
                  diffColor = "bg-red-50 text-red-700 border-red-200";
                  dotColor = "bg-red-500";
                }

                let conceptTag = "General";
                let conceptColor = "bg-zinc-50 text-zinc-500 border-zinc-200";
                if (p.title.startsWith("DSA Array")) {
                  conceptTag = "Arrays";
                  conceptColor = "bg-blue-50 text-blue-600 border-blue-100";
                } else if (p.title.startsWith("DSA String")) {
                  conceptTag = "Strings";
                  conceptColor = "bg-violet-50 text-violet-600 border-violet-100";
                } else if (p.title.startsWith("Bit Manipulation")) {
                  conceptTag = "Bits";
                  conceptColor = "bg-cyan-50 text-cyan-600 border-cyan-100";
                } else if (p.title.startsWith("OOP Class")) {
                  conceptTag = "OOP";
                  conceptColor = "bg-amber-50 text-amber-600 border-amber-100";
                } else if (p.title.startsWith("Dynamic Programming")) {
                  conceptTag = "DP";
                  conceptColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                } else if (p.title.startsWith("Tricky Pattern")) {
                  conceptTag = "Patterns";
                  conceptColor = "bg-pink-50 text-pink-600 border-pink-100";
                }

                const snippet = getBoilerplateSnippet(p.title);

                return (
                  <div key={p.id} className="relative group">
                    {/* Card Container */}
                    <div className="h-full bg-white border border-zinc-200 rounded-2xl p-5 hover:border-rose-450 hover:shadow-xl hover:shadow-rose-100/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative z-10">
                      {/* Inner Glowing Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

                      <div>
                        {/* Card Header Row */}
                        <div className="flex items-center justify-between mb-3.5">
                          <span className="text-[9px] font-black text-zinc-400 bg-zinc-50 border border-zinc-150 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                            #{ (currentPage - 1) * itemsPerPage + idx + 1 }
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border ${diffColor}`}>
                              <span className={`h-1 w-1 rounded-full ${dotColor}`} />
                              {p.difficulty}
                            </span>
                            <span className={`inline-block px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border ${conceptColor}`}>
                              {conceptTag}
                            </span>
                          </div>
                        </div>

                        {/* Card Title */}
                        <Link
                          href={`/problems/${p.slug}`}
                          className="block text-[13px] font-black text-zinc-950 group-hover:text-rose-700 transition-colors leading-snug mb-3.5 min-h-[38px] line-clamp-2"
                        >
                          {getProperProblemTitle(p.title)}
                        </Link>

                        {/* Interactive Code Preview Terminal */}
                        <div className="bg-zinc-950 rounded-xl p-3 font-mono text-[9px] text-zinc-400 overflow-hidden relative border border-zinc-900 shadow-inner group-hover:border-zinc-800 transition-all select-none mb-3.5 h-[115px] flex flex-col">
                          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-900 text-[8px] uppercase tracking-wider text-zinc-500 font-bold">
                            <span className="flex items-center gap-1">
                              <span className="h-1 w-1 rounded-full bg-rose-500" />
                              <span className="h-1 w-1 rounded-full bg-amber-500" />
                              <span className="h-1 w-1 rounded-full bg-emerald-500" />
                            </span>
                            <span>solution.cpp</span>
                          </div>
                          <pre className="text-emerald-400/90 leading-relaxed overflow-hidden whitespace-pre font-mono text-[8px] select-none pointer-events-none">
                            {snippet}
                          </pre>
                        </div>
                      </div>

                      {/* Card Footer Row */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-100">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] text-zinc-400 font-black uppercase tracking-wider flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> {p.timeLimit / 1000}s Limit
                          </span>
                          <span className="text-[8px] text-zinc-400 font-black uppercase tracking-wider flex items-center gap-1">
                            <HardDrive className="h-2.5 w-2.5" /> {p.memoryLimit}MB Mem
                          </span>
                        </div>
                        <Link
                          href={`/problems/${p.slug}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-700 hover:bg-rose-600 border border-rose-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white transition-all cursor-pointer active:scale-[0.97] shadow-sm"
                        >
                          Solve <ArrowRight className="h-2.5 w-2.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Progress Connectors: Connects dots of each problem to the next in sequence */}
                    {idx < problemList.length - 1 && (
                      <>
                        {/* Desktop (xl: 3 columns) Horizontal connector */}
                        {idx % 3 !== 2 && (
                          <div className="hidden xl:flex absolute top-1/2 -translate-y-1/2 -right-6 w-6 items-center justify-center z-20 pointer-events-none">
                            <div className="w-full h-0.5 bg-gradient-to-r from-zinc-200 via-rose-300 to-zinc-200 border-dashed border-t group-hover:from-rose-300 group-hover:via-rose-500 group-hover:to-rose-300 transition-all duration-300" />
                            <div className="absolute h-2.5 w-2.5 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.6)] group-hover:scale-125 transition-transform duration-300">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                            </div>
                          </div>
                        )}

                        {/* Tablet (md/lg: 2 columns) Horizontal connector */}
                        {idx % 2 === 0 && (
                          <div className="hidden md:flex xl:hidden absolute top-1/2 -translate-y-1/2 -right-6 w-6 items-center justify-center z-20 pointer-events-none">
                            <div className="w-full h-0.5 bg-gradient-to-r from-zinc-200 via-rose-300 to-zinc-200 border-dashed border-t group-hover:from-rose-300 group-hover:via-rose-500 group-hover:to-rose-300 transition-all duration-300" />
                            <div className="absolute h-2.5 w-2.5 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.6)] group-hover:scale-125 transition-transform duration-300">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                            </div>
                          </div>
                        )}

                        {/* Desktop (xl: 3 columns) Vertical downward connector at the end of the row */}
                        {idx % 3 === 2 && (
                          <div className="hidden xl:flex absolute -bottom-6 left-1/2 -translate-x-1/2 h-6 flex-col items-center justify-center z-20 pointer-events-none">
                            <div className="h-full w-0.5 bg-gradient-to-b from-zinc-200 via-rose-300 to-zinc-200 border-dashed border-l group-hover:from-rose-300 group-hover:via-rose-500 group-hover:to-rose-300 transition-all duration-300" />
                            <div className="absolute h-2.5 w-2.5 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.6)] group-hover:scale-125 transition-transform duration-300">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                            </div>
                          </div>
                        )}

                        {/* Tablet (md/lg: 2 columns) Vertical downward connector at the end of the row */}
                        {idx % 2 === 1 && (
                          <div className="hidden md:flex xl:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 h-6 flex-col items-center justify-center z-20 pointer-events-none">
                            <div className="h-full w-0.5 bg-gradient-to-b from-zinc-200 via-rose-300 to-zinc-200 border-dashed border-l group-hover:from-rose-300 group-hover:via-rose-500 group-hover:to-rose-300 transition-all duration-300" />
                            <div className="absolute h-2.5 w-2.5 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.6)] group-hover:scale-125 transition-transform duration-300">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                            </div>
                          </div>
                        )}

                        {/* Mobile (1 column) Vertical downward connector */}
                        <div className="flex md:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 h-6 flex-col items-center justify-center z-20 pointer-events-none">
                          <div className="h-full w-0.5 bg-gradient-to-b from-zinc-200 via-rose-300 to-zinc-200 border-dashed border-l group-hover:from-rose-300 group-hover:via-rose-500 group-hover:to-rose-300 transition-all duration-300" />
                          <div className="absolute h-2.5 w-2.5 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.6)] group-hover:scale-125 transition-transform duration-300">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-20 px-6 text-center bg-white border border-zinc-200 rounded-2xl shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                    <Search className="h-5 w-5 text-zinc-400" />
                  </div>
                  <p className="text-sm font-bold text-zinc-700">No challenges found</p>
                  <p className="text-[10px] text-zinc-400 font-semibold">Try adjusting your filters.</p>
                </div>
              </div>
            )}
          </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4 bg-zinc-50/50">
                <span className="text-[10px] font-bold text-zinc-400">Page <span className="text-zinc-700 font-black">{currentPage}</span> of <span className="text-zinc-700 font-black">{totalPages}</span></span>
                <div className="flex items-center gap-1.5">
                  <Link href={buildUrl({ page: String(currentPage - 1) })} className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-1 ${currentPage > 1 ? "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 cursor-pointer shadow-sm" : "border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed pointer-events-none"}`}><ChevronLeft className="h-3 w-3" /> Prev</Link>
                  <Link href={buildUrl({ page: String(currentPage + 1) })} className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-1 ${currentPage < totalPages ? "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 cursor-pointer shadow-sm" : "border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed pointer-events-none"}`}>Next <ChevronRight className="h-3 w-3" /></Link>
                </div>
              </div>
            )}
          </div>

        {/* Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Topic Navigator */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 px-5 py-4">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2"><Layers className="h-4 w-4" /> Topics</h2>
            </div>
            <div className="p-2.5 space-y-0.5">
              <Link href={buildUrl({ concept: "", page: "1" })} className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-wider ${!concept ? "bg-rose-50 text-rose-700 border border-rose-100" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}`}>
                <Layers className="h-3.5 w-3.5" /> All Topics
              </Link>
              {CONCEPTS.map((c) => {
                const Icon = c.icon;
                const isActive = concept === c.key;
                return (
                  <Link key={c.key} href={buildUrl({ concept: c.key, page: "1" })} className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-wider ${isActive ? `${c.lightBg} ${c.text} border ${c.border}` : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}`}>
                    <Icon className="h-3.5 w-3.5" /> {c.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Streak */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-rose-700 to-rose-600 px-5 py-3.5 flex items-center gap-2.5">
              <Flame className="h-4.5 w-4.5 text-white" />
              <span className="text-[11px] font-black uppercase tracking-widest text-white">Progress</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-center">
                  <span className="block text-xl font-black text-zinc-950">0</span>
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Streak</span>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-center">
                  <span className="block text-xl font-black text-zinc-950">Lv.1</span>
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Level</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-bold text-zinc-500">
                  <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Progress</span>
                  <span className="font-black text-zinc-700">0 / 1,000</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                  <div className="h-full bg-gradient-to-r from-rose-600 to-rose-700 w-[0.5%] rounded-full" />
                </div>
              </div>
              <div className="border-t border-zinc-100 pt-2.5 space-y-1.5">
                {[
                  { label: "Easy", xp: "+10", color: "text-emerald-600", dot: "bg-emerald-500" },
                  { label: "Medium", xp: "+30", color: "text-amber-600", dot: "bg-amber-500" },
                  { label: "Hard", xp: "+100", color: "text-red-600", dot: "bg-red-500" },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between text-[9px] font-bold text-zinc-500">
                    <span className="flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${r.dot}`} /> {r.label}</span>
                    <span className={`${r.color} font-black`}>{r.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contest */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5 space-y-3 group hover:border-zinc-300 transition-all">
            <div className="flex items-center gap-2">
              <Trophy className="h-4.5 w-4.5 text-amber-500 fill-amber-100" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-800">Weekly Contest</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">Compete in timed tournaments with real-time leaderboards.</p>
            <Link href="/contests" className="w-full text-center rounded-xl bg-rose-700 hover:bg-rose-600 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-[0.98]">
              Contest Hub <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
