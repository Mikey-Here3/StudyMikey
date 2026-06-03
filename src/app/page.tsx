"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/shared/footer";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Code2,
  Trophy,
  User,
  Search,
  Building2,
  ArrowRight,
  CheckCircle2,
  Award,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Globe,
  Play,
  Check
} from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"cpp" | "input">("cpp");
  const [compilerStatus, setCompilerStatus] = useState<"IDLE" | "COMPILING" | "RUNNING" | "ACCEPTED">("IDLE");
  const [typedCode, setTypedCode] = useState("");
  const [testCasesPassed, setTestCasesPassed] = useState<number>(0);

  const fullCode = `#include <iostream>
#include <vector>

int findTarget(std::vector<int>& nums, int target) {
    for (int i = 0; i < nums.size(); ++i) {
        if (nums[i] == target) return i;
    }
    return -1;
}`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullCode.length) {
        setTypedCode((prev) => prev + fullCode.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, []);

  const runSimulation = () => {
    if (compilerStatus !== "IDLE") return;
    setCompilerStatus("COMPILING");
    setTestCasesPassed(0);

    setTimeout(() => {
      setCompilerStatus("RUNNING");
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setTestCasesPassed(count);
        if (count === 3) {
          clearInterval(interval);
          setCompilerStatus("ACCEPTED");
        }
      }, 500);
    }, 1000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/problems?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const highlightCode = (code: string) => {
    let escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    const keywords = ["int", "for", "if", "return", "const", "void"];
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g");
      escaped = escaped.replace(regex, `<span class="text-rose-400 font-bold">${keyword}</span>`);
    });
    
    escaped = escaped.replace(/(#include &lt;.*?&gt;)/g, '<span class="text-zinc-500">$1</span>');
    escaped = escaped.replace(/\b(std::vector|vector)\b/g, '<span class="text-red-300 font-semibold">$1</span>');
    escaped = escaped.replace(/\b(findTarget)\b/g, '<span class="text-amber-400 font-semibold">$1</span>');
    escaped = escaped.replace(/\b(\d+)\b/g, '<span class="text-purple-400">$1</span>');

    return <code dangerouslySetInnerHTML={{ __html: escaped }} />;
  };

  const partners = [
    { name: "FAST NUCES" },
    { name: "NUST Islamabad" },
    { name: "UET Lahore" },
    { name: "COMSATS Islamabad" },
    { name: "Google Sourcing" },
    { name: "Microsoft Talent" },
    { name: "Meta Recruiting" },
  ];

  const features = [
    {
      title: "Practice Arena",
      description: "Solve C++ algorithm challenges. Write solutions, debug constraints, and execute compiler test runs.",
      linkText: "Practice coding",
      icon: Code2,
      href: "/problems",
      image: "/concepts/practice-arena.png",
    },
    {
      title: "Campus Contests",
      description: "Compete in scheduled coding tournaments hosted by university departments. Features automated penalty metrics.",
      linkText: "Compete in contests",
      icon: Trophy,
      href: "/contests",
      image: "/concepts/campus-contests.png",
    },
    {
      title: "University Standings",
      description: "Affiliate with your campus and compare national performance ratings against other universities.",
      linkText: "View university ranks",
      icon: Building2,
      href: "/universities",
      image: "/concepts/dsa.png",
    },
    {
      title: "Developer Profiles",
      description: "Build a portfolio detailing your solved statistics, streak calendars, and generate print-ready PDF resumes.",
      linkText: session ? "View profile" : "Get started",
      icon: User,
      href: session ? `/u/${session.user.username}` : "/auth/signup",
      image: "/concepts/oop.png",
    },
    {
      title: "Recruiter Search",
      description: "Allows verified companies to filter candidate profiles based on rating scorecards and solved statistics.",
      linkText: session?.user?.role === "RECRUITER" ? "Sourcing engine" : "Verified accounts only",
      icon: Search,
      href: session?.user?.role === "RECRUITER" ? "/recruiter" : null,
      image: "/concepts/dp.png",
    },
    {
      title: "GitHub Portfolio Sync",
      description: "Connect your GitHub account via OAuth to directly import repository details, descriptions, and stack tags.",
      linkText: session ? "Sync portfolio" : "Create account",
      icon: Award,
      href: session ? `/u/${session.user.username}` : "/auth/signup",
      image: "/concepts/bits.png",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Solve Challenges",
      description: "Solve algorithmic catalog problems. Write sandboxed C++ programs and increase your global solver rating.",
    },
    {
      step: "02",
      title: "Sync Projects",
      description: "Sync your project repositories directly from GitHub via OAuth and download print-ready single-page resumes.",
    },
    {
      step: "03",
      title: "Direct Placement",
      description: "Bypass resume filtering. Tech companies find you directly based on verified solving counts and ratings.",
    },
  ];

  const comparisons = {
    traditional: [
      "Unverified resume claims and padded skills lists",
      "Manual phone screens and sorting delays",
      "No verified sandbox proof of problem-solving",
      "Broken link repositories and missing templates",
    ],
    studymikey: [
      "100% verified solve counts and statistics",
      "Search filters sorted by ratings and contest logs",
      "Isolated compiler runs evaluated live",
      "OAuth GitHub sync and printable credentials",
    ],
  };

  const testimonials = [
    {
      quote: "StudyMikey helps us find candidates with practical code-writing skills. The verified problem statistics let us bypass manual resume screenings.",
      author: "Sarah Jenkins",
      role: "Engineering Lead",
      company: "Google Sourcing",
    },
    {
      quote: "We use the contest lobbies to host campus programming assessments. It keeps students engaged and provides instant automated grading.",
      author: "Dr. Carter",
      role: "Professor of Algorithms",
      company: "FAST National University",
    },
    {
      quote: "Syncing my GitHub repos took seconds. I used the PDF generator to download a clean resume that focuses on my actual problem-solving scores.",
      author: "Jane Doe (@jane_coder)",
      role: "Student Engineer",
      company: "Lvl 4 Solver",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-rose-500/10 relative overflow-hidden">
      {/* Background grids */}
      <div className="absolute inset-0 glow-mesh pointer-events-none z-0" />
      <div className="absolute inset-0 mesh-grid opacity-[0.35] pointer-events-none z-0" />
      
      {/* Interactive blurred glows */}
      <div className="absolute top-[8%] left-[2%] w-[450px] h-[450px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute top-[45%] right-[-5%] w-[450px] h-[450px] rounded-full bg-red-550/5 blur-[120px] pointer-events-none z-0" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-30 px-4 sm:px-6 z-10 max-w-7xl mx-auto grid gap-12 lg:grid-cols-12 items-center">
        
        {/* Left Hero copy (7 cols) */}
        <div className="lg:col-span-7 text-left space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white text-[10px] font-black text-zinc-500 uppercase tracking-widest shadow-sm">
            <Globe className="h-3.5 w-3.5 text-zinc-400" />
            Campus Coding Leagues
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-zinc-950 leading-[1.02]">
            Practice coding.<br />
            <span className="text-gradient-neon">Verify your skills.</span>
          </h1>

          <p className="max-w-xl text-xs sm:text-sm text-zinc-550 leading-relaxed font-semibold">
            Solve algorithmic C++ programming challenges, compete in campus-wide contests, sync your GitHub repositories, and build a verified developer scorecard.
          </p>

          {/* Search bar with CMD shortcut */}
          <form onSubmit={handleSearchSubmit} className="max-w-md relative">
            <div className="flex items-center bg-white border border-zinc-200 rounded-2xl p-1 shadow-sm hover:border-zinc-300 transition-colors focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/5">
              <Search className="h-4.5 w-4.5 text-zinc-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search coding challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold text-zinc-900 outline-none bg-transparent placeholder-zinc-450"
              />
              <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[8px] font-black text-zinc-400 border border-zinc-150 rounded-lg bg-zinc-50 mr-2 uppercase tracking-wide">
                ⌘K
              </span>
              <button
                type="submit"
                className="rounded-xl bg-rose-700 hover:bg-rose-600 text-white px-5 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-start gap-3 pt-2">
            {session ? (
              <Link
                href={`/u/${session.user.username}`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-rose-700 text-xs font-black uppercase tracking-wider text-white hover:bg-rose-600 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
              >
                🎒 Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-rose-700 text-xs font-black uppercase tracking-wider text-white hover:bg-rose-600 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98]"
                >
                  Create Account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-zinc-200 bg-white text-xs font-black uppercase tracking-wider text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Interactive Compiler Simulator Widget (5 cols) */}
        <div className="lg:col-span-5 animate-float z-15">
          <div className="bg-zinc-950 rounded-3xl border border-zinc-800 p-5 shadow-2xl flex flex-col font-mono text-[10px] text-zinc-300 relative overflow-hidden select-none">
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-3 text-zinc-500">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab("cpp")} 
                  className={`text-[9px] font-bold tracking-wide uppercase transition-colors ${activeTab === "cpp" ? "text-zinc-200" : "text-zinc-500"}`}
                >
                  find_target.cpp
                </button>
                <button 
                  onClick={() => setActiveTab("input")} 
                  className={`text-[9px] font-bold tracking-wide uppercase transition-colors ${activeTab === "input" ? "text-zinc-200" : "text-zinc-500"}`}
                >
                  testcase_1.in
                </button>
              </div>
              <button 
                onClick={runSimulation}
                disabled={compilerStatus !== "IDLE"}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  compilerStatus === "IDLE"
                    ? "border-rose-500/30 bg-rose-600/10 text-rose-400 hover:bg-rose-600/20 active:scale-95"
                    : "border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed"
                }`}
              >
                <Play className="h-2.5 w-2.5 fill-current" />
                Run
              </button>
            </div>

            {/* Editor Screen content */}
            <div className="h-44 overflow-y-auto leading-relaxed pr-2">
              {activeTab === "cpp" ? (
                <pre className="text-zinc-300 text-[10px] whitespace-pre-wrap">
                  {highlightCode(typedCode)}
                  <span className="inline-block w-1.5 h-3.5 bg-rose-500 ml-0.5 animate-pulse" />
                </pre>
              ) : (
                <div className="space-y-2 text-zinc-400">
                  <div>
                    <span className="text-zinc-650 font-bold block">// Array values:</span>
                    <span>[ 12, 34, 56, 78, 90, 112 ]</span>
                  </div>
                  <div>
                    <span className="text-zinc-650 font-bold block">// Search target value:</span>
                    <span>78</span>
                  </div>
                </div>
              )}
            </div>
            {/* Run Output drawer */}
            <div className="border-t border-zinc-900 pt-3 mt-3 flex flex-col justify-between min-h-[90px]">
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes loader {
                  0% { width: 0%; }
                  100% { width: 100%; }
                }
                .animate-loader {
                  animation: loader 1s linear forwards;
                }
              ` }} />
              <div className="text-[9px] text-zinc-500 font-bold tracking-wider uppercase">Console Output</div>
              <div className="flex-1 mt-1 text-[9px] space-y-1">
                {compilerStatus === "IDLE" && (
                  <div className="text-zinc-650">Click &apos;Run&apos; to execute and compile solution on sandbox.</div>
                )}
                {compilerStatus === "COMPILING" && (
                  <div className="space-y-1 text-rose-500 font-mono text-[9px]">
                    <div className="flex items-center justify-between">
                      <span className="animate-pulse">$ g++ -O3 find_target.cpp -o main</span>
                      <span className="animate-spin">◴</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                      <div className="bg-gradient-to-r from-rose-500 to-rose-600 h-full animate-loader" />
                    </div>
                    <div className="text-zinc-500 text-[8px]">Linking libraries, building target binary...</div>
                  </div>
                )}
                {compilerStatus === "RUNNING" && (
                  <div className="space-y-1 text-amber-500 font-mono text-[9px]">
                    <div>$ ./main &lt; testcase_1.in</div>
                    <div className="space-y-0.5 text-[8px] text-zinc-400">
                      <div className="flex items-center justify-between">
                        <span>✔ TestCase #1: [12, 34, 56] target 34 ...</span>
                        <span className="text-emerald-500 font-bold">PASS (1.2ms)</span>
                      </div>
                      {testCasesPassed >= 2 && (
                        <div className="flex items-center justify-between">
                          <span>✔ TestCase #2: [90, 112] target 90 ...</span>
                          <span className="text-emerald-500 font-bold">PASS (0.8ms)</span>
                        </div>
                      )}
                      {testCasesPassed >= 3 && (
                        <div className="flex items-center justify-between">
                          <span>✔ TestCase #3: [-5, 12, 45] target 45 ...</span>
                          <span className="text-emerald-500 font-bold">PASS (1.5ms)</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {compilerStatus === "ACCEPTED" && (
                  <div className="text-emerald-400 font-mono space-y-1 text-[9px] animate-fade-in">
                    <div className="flex items-center justify-between font-semibold text-zinc-500">
                      <span>$ ./main &lt; testcase_1.in</span>
                      <span>100% OK</span>
                    </div>
                    <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-lg p-2 flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(16,185,129,0.07)]">
                      <div className="space-y-0.5">
                        <span className="block text-[8px] text-emerald-500 font-black uppercase tracking-wider">Verification Approved</span>
                        <span className="block text-[7px] text-zinc-400">Streak: 1 Day | XP: +10 XP</span>
                      </div>
                      <span className="h-6 px-2 rounded bg-emerald-500 text-zinc-950 font-black flex items-center justify-center text-[9px] uppercase tracking-wider animate-bounce shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                        ACCEPTED
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* 2. UNIVERSITY TICKER */}
      <section className="py-10 bg-zinc-50 border-y border-zinc-200 px-6 overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap lg:mr-4">
            Connected Universities & Partners:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] font-black text-zinc-400">
            {partners.map((partner) => (
              <span key={partner.name} className="hover:text-zinc-600 transition-colors uppercase tracking-widest">
                {partner.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURES */}
      <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-zinc-500 bg-zinc-100 border border-zinc-200 rounded-full px-3 py-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-[9px] font-black uppercase tracking-widest">Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900">
            Engineered for developers & CS departments
          </h2>
          <p className="text-zinc-550 text-xs sm:text-sm font-semibold leading-relaxed max-w-lg mx-auto">
            StudyMikey replaces unverified resume credentials with direct code evaluations, campus competitions, and synced portfolios.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white border border-zinc-200/85 rounded-3xl overflow-hidden hover:border-rose-250 hover:shadow-xl hover:shadow-zinc-100 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Card Illustration Banner */}
                  <div className="relative h-40 bg-zinc-50 border-b border-zinc-100 overflow-hidden">
                    {feat.image && (
                      <Image
                        src={feat.image}
                        alt={feat.title}
                        width={400}
                        height={200}
                        className="w-full h-full object-cover opacity-95 group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    )}
                    {/* Floating Icon badge */}
                    <div className="absolute top-4 left-4 h-9 w-9 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm border border-zinc-150 flex items-center justify-center text-zinc-800">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <h3 className="text-sm font-black text-zinc-950 mb-2 group-hover:text-rose-700 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                      {feat.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 pb-6 pt-4 border-t border-zinc-50/50">
                  {feat.href ? (
                    <Link
                      href={feat.href}
                      className="text-[9px] font-black text-rose-700 hover:text-rose-600 uppercase tracking-widest flex items-center gap-1.5"
                    >
                      {feat.linkText} <ChevronRight className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform duration-200" />
                    </Link>
                  ) : (
                    <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-zinc-55 border border-zinc-200 text-zinc-400">
                      {feat.linkText}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-20 bg-zinc-50 border-y border-zinc-200 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest block">Process Overview</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950">How StudyMikey Works</h2>
            <p className="text-xs text-zinc-500 font-semibold">Verification and talent sourcing process in three steps.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {steps.map((st, idx) => (
              <div 
                key={st.step} 
                className="bg-white border border-zinc-200/80 p-8 rounded-3xl hover:border-rose-350 hover:shadow-lg transition-all duration-300 relative group z-10"
              >
                {/* Connector dot paths between steps */}
                {idx < 2 && (
                  <div className="hidden md:flex absolute top-[36px] -right-8 w-8 items-center justify-center z-20 pointer-events-none">
                    <div className="w-full h-0.5 bg-gradient-to-r from-zinc-200 via-rose-300 to-zinc-200 border-dashed border-t group-hover:from-rose-300 group-hover:via-rose-500 group-hover:to-rose-300 transition-all duration-300" />
                    <div className="absolute h-2 w-2 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.6)]">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                    </div>
                  </div>
                )}
                
                <span className="h-9 w-9 rounded-xl bg-rose-50/50 border border-rose-100/80 flex items-center justify-center text-xs font-black text-rose-600 shadow-sm mb-6 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600 transition-all duration-300">
                  {st.step}
                </span>
                <h3 className="text-xs font-black text-zinc-950 mb-2 group-hover:text-rose-700 transition-colors">{st.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-semibold">{st.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COMPARISON */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-1.5 text-rose-600 bg-rose-50 border border-rose-100 rounded-full px-3 py-1">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Platform Design</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-tight">
              Verified statistics replace manual resume sorting
            </h2>
            <p className="text-zinc-550 text-xs sm:text-sm font-semibold leading-relaxed">
              Recruiters spend days reviewing bloated developer resumes. StudyMikey displays verified problem solve statistics, sandbox evaluation histories, and contest results.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span className="text-xs text-zinc-700 font-semibold">GitHub OAuth project validation</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span className="text-xs text-zinc-700 font-semibold">DSA ratings based on sandbox submissions</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span className="text-xs text-zinc-700 font-semibold">Downloadable PDF developer profile cards</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid gap-4">
            {/* Traditional Card */}
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm opacity-80 hover:opacity-100 transition-opacity">
              <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block mb-4">Traditional CV Sourcing</span>
              <ul className="space-y-2.5">
                {comparisons.traditional.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-zinc-400">
                    <span className="text-red-550 flex-shrink-0 font-bold">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* StudyMikey Card */}
            <div className="bg-white border border-rose-250 p-6 rounded-2xl shadow-[0_4px_25px_rgba(244,63,94,0.06)] relative overflow-hidden grid md:grid-cols-12 gap-5 group hover:border-rose-400 transition-all duration-300">
              <div className="absolute top-0 right-0 bg-rose-50 text-rose-600 border-l border-b border-rose-100 text-[8px] font-black uppercase px-3 py-1 tracking-wider shadow-sm">
                StudyMikey
              </div>
              
              <div className="md:col-span-7 space-y-4">
                <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest block">Verified Profile</span>
                <ul className="space-y-2.5">
                  {comparisons.studymikey.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-bold text-zinc-800">
                      <span className="text-rose-600 flex-shrink-0 font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mock Developer Scorecard widget inside card */}
              <div className="md:col-span-5 bg-zinc-950 rounded-xl p-3 text-[8px] font-mono text-zinc-400 border border-zinc-900 shadow-inner flex flex-col justify-between h-40">
                <div className="border-b border-zinc-900 pb-1.5 mb-1.5 flex items-center justify-between">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider">verified_stats.json</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">"username":</span>
                    <span className="text-rose-400">"@jane_coder"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">"level":</span>
                    <span className="text-amber-400">"Lv.4 Solver"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">"solved_count":</span>
                    <span className="text-emerald-400">"170 / 1,000"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">"rating":</span>
                    <span className="text-emerald-400">"1850 XP [Top 2%]"</span>
                  </div>
                </div>
                
                {/* Mock dynamic contribution calendar map */}
                <div className="border-t border-zinc-900 pt-2 mt-2">
                  <div className="text-[6px] text-zinc-550 font-bold uppercase pb-1 tracking-wider">Solve Consistency</div>
                  <div className="flex gap-1 justify-center">
                    {[1, 2, 4, 3, 2, 4, 1, 3, 2, 4].map((v, i) => {
                      let col = "bg-zinc-900";
                      if (v === 1) col = "bg-rose-950";
                      else if (v === 2) col = "bg-rose-800";
                      else if (v === 3) col = "bg-rose-600";
                      else if (v === 4) col = "bg-rose-500";
                      return (
                        <div key={i} className={`h-2.5 w-2.5 rounded-sm ${col} border border-zinc-900`} />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-20 bg-zinc-50 border-t border-zinc-200 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest block">Reviews</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950">What users say</h2>
            <p className="text-xs text-zinc-500 font-semibold">Used by student developers, recruiters, and algorithms instructors.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, idx) => {
              // Generate simple initials for reviewer avatar
              const initials = t.author.split(" ").map(n => n[0]).join("").toUpperCase();
              
              // Color combinations for avatar backgrounds
              const colors = [
                "bg-blue-50 text-blue-700 border-blue-100",
                "bg-rose-50 text-rose-700 border-rose-100",
                "bg-amber-50 text-amber-700 border-amber-100",
              ];
              const avatarColor = colors[idx % colors.length];

              return (
                <div 
                  key={idx} 
                  className="bg-white border border-zinc-200/80 p-8 rounded-3xl flex flex-col justify-between hover:border-rose-250 hover:shadow-xl hover:shadow-rose-100/10 hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
                >
                  {/* Decorative glowing background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />

                  {/* Top Quote Icon & 5 Star Rating Row */}
                  <div className="flex items-center justify-between mb-5 z-10 relative">
                    <div className="text-[10px] font-black uppercase tracking-wider text-rose-600 px-2 py-0.5 bg-rose-50 border border-rose-100 rounded-md">
                      Verified
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-xs">★</span>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] sm:text-xs text-zinc-550 leading-relaxed font-semibold italic mb-6 z-10 relative">
                    &quot;{t.quote}&quot;
                  </p>

                  <div className="flex items-center gap-3 mt-auto border-t border-zinc-50 pt-4 z-10 relative">
                    {/* Initials Avatar */}
                    <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-[10px] font-black shadow-sm ${avatarColor}`}>
                      {initials}
                    </div>
                    <div>
                      <div className="font-black text-zinc-950 text-xs">{t.author}</div>
                      <div className="text-[8px] text-zinc-450 font-black uppercase mt-0.5 tracking-wider">{t.role} • {t.company}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="py-20 px-4 sm:px-6 relative z-10 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-rose-700 via-rose-600 to-rose-700 rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden shadow-2xl">
          {/* Decorative orbs */}
          <div className="absolute top-[-60px] right-[-60px] w-40 h-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 animate-fade-in-up relative z-10">
            Build your developer profile
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-semibold max-w-lg mx-auto mb-8 relative z-10">
            Register your student account, sync your projects from GitHub, and solve problems to establish a verified portfolio card.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            {session ? (
              <Link
                href={`/u/${session.user.username}`}
                className="w-full sm:w-auto bg-white text-rose-600 hover:bg-rose-50 px-8 py-3.5 rounded-xl font-black uppercase tracking-wider text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="w-full sm:w-auto bg-white text-rose-600 hover:bg-rose-50 px-8 py-3.5 rounded-xl font-black uppercase tracking-wider text-xs shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  Create Student Account
                </Link>
                <Link
                  href="/auth/signup?role=RECRUITER"
                  className="w-full sm:w-auto bg-white/15 hover:bg-white/25 border border-white/30 text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-wider text-xs transition-all active:scale-[0.98] cursor-pointer backdrop-blur-sm"
                >
                  Recruiter Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <Footer />
    </div>
  );
}
