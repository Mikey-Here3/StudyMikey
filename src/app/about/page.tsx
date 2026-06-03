"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Code2, 
  Users, 
  ShieldCheck, 
  Milestone, 
  ArrowRight, 
  Terminal, 
  GraduationCap, 
  Building2, 
  Heart
} from "lucide-react";

interface MilestoneItem {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  metric: string;
  metricLabel: string;
}

export default function AboutPage() {
  const [activeYear, setActiveYear] = useState<string>("2020");

  const milestones: MilestoneItem[] = [
    {
      year: "2020",
      title: "The Self-Teaching Battle",
      subtitle: "Navigating online tutorials without mentors",
      description: "Our co-founder Ashan began learning computer science independently. Without structured guidance, he spent weeks resolving compiler configurations and debugging syntax errors on forums, realizing how difficult it is to verify programming skills without formal credentials.",
      metric: "12+ Hours",
      metricLabel: "Spent debugging simple configuration issues",
    },
    {
      year: "2022",
      title: "Discovering the Sourcing Mismatch",
      subtitle: "The resume filters gatekeeping talent",
      description: "While entering the software job market, we noticed automated resume screening tools (ATS) automatically filtered out top-tier problem solvers because they lacked traditional CS degrees. Meanwhile, recruiters spent hours interviewing candidates who had polished resumes but lacked coding skills.",
      metric: "90%+",
      metricLabel: "Self-taught profiles filtered by keyword screening",
    },
    {
      year: "2024",
      title: "Laying the Sandbox Foundations",
      subtitle: "A coding playground to verify capability",
      description: "We built the initial version of StudyMikey: an interactive coding workspace backed by a sandboxed C++ execution runner. We integrated GitHub OAuth credentials, letting candidates showcase actual solve stats and verified code execution histories directly on their profiles.",
      metric: "1.2s",
      metricLabel: "Average runtime execution test evaluation",
    },
    {
      year: "2026",
      title: "Opening Campus Leagues",
      subtitle: "Connecting university solvers with recruiters",
      description: "Today, StudyMikey is an ecosystem featuring practice challenges, scheduled campus contests, national university leaderboards, and recruiter sourcing directories. We connect verified student developers with software startups based on practical problem-solving scores.",
      metric: "1,000+",
      metricLabel: "Algorithmic challenges index seeded",
    }
  ];

  const team = [
    {
      name: "Ashan",
      role: "Co-Founder & Lead Architect",
      bio: "Self-taught software engineer and compiler enthusiast. Dedicated to building sandbox execution runners, isolated code compiler pipelines, and removing recruitment gatekeeping.",
      initials: "AS",
      quote: "I spent years fighting resume filters that ignored my actual code. StudyMikey is built so your solved programs speak louder than a piece of paper."
    },
    {
      name: "Dr. Carter",
      role: "Academic Integration Advisor",
      bio: "Professor of Algorithms. Designs university programming contest guidelines and maps competitive coding challenges to computer science curriculums.",
      initials: "DC",
      quote: "StudyMikey gives colleges a transparent way to compare student coding capabilities and host secure, automated lab assessments."
    },
    {
      name: "Sarah Jenkins",
      role: "Technical Sourcing Advisor",
      bio: "Former software recruiter. Aligns candidate profile credentials with sourcing requirements, optimizing developer credentials pipelines.",
      initials: "SJ",
      quote: "Standardized DSA ratings save engineering teams from wasting hours on phone screens. Sourcing directly by coding stats changes everything."
    }
  ];

  const activeMilestone = milestones.find((m) => m.year === activeYear) || milestones[0];

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-rose-500/10 relative overflow-hidden py-16 px-4 sm:px-6 animate-fade-in-up">
      {/* Background grids */}
      <div className="absolute inset-0 glow-mesh pointer-events-none z-0" />
      <div className="absolute inset-0 mesh-grid opacity-[0.35] pointer-events-none z-0" />
      
      {/* Soft background glows */}
      <div className="absolute top-[8%] left-[2%] w-[450px] h-[450px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-16">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-100 bg-rose-50/50 text-[10px] font-bold text-rose-600 uppercase tracking-wider shadow-sm">
            <Heart className="h-3.5 w-3.5" />
            Our Narrative
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-950">
            About StudyMikey
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-semibold">
            We verify developer capabilities through merit, combining practice arenas, campus competitive duels, and recruiter search profiles.
          </p>
        </div>

        {/* Narrative Memoir Section */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-10 shadow-sm relative overflow-hidden hover:border-zinc-300 transition-colors">
          <div className="grid gap-8 md:grid-cols-12 items-start">
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-xs font-black text-white shadow-md">
                AS
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-950">Ashan</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Co-Founder & Lead Architect</p>
              </div>
            </div>

            <div className="md:col-span-8 space-y-3">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Why we started StudyMikey</h3>
              <p className="text-xs sm:text-sm text-zinc-550 leading-relaxed font-semibold">
                &ldquo;Learning code independently meant fighting configuration errors, tutorial loops, and recruiters who binned my applications because of keyword checkers. We built StudyMikey so that the next generation of self-taught solvers can prove their capabilities via sandboxed compiler checks and direct university rankings.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* 1. INTERACTIVE TIMELINE SELECTOR */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-5">
            <div className="space-y-1">
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Milestone className="h-4 w-4" />
                Platform Timeline
              </h2>
              <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">Our Journey (2020 - 2026)</h3>
            </div>
            {/* Interactive Timeline Tabs */}
            <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-200 self-start sm:self-auto shadow-inner">
              {milestones.map((ms) => (
                <button
                  key={ms.year}
                  onClick={() => setActiveYear(ms.year)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    activeYear === ms.year
                      ? "bg-rose-600 text-white shadow-sm border border-rose-500 scale-[1.02]"
                      : "text-zinc-500 hover:text-rose-600"
                  }`}
                >
                  {ms.year}
                </button>
              ))}
            </div>
          </div>

          {/* Active Timeline Card Content */}
          <div className="grid gap-6 md:grid-cols-12 items-stretch animate-fade-in-up">
            
            {/* Detail Block (8 cols) */}
            <div className="md:col-span-8 bg-white border border-zinc-200 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-[9px] font-bold text-rose-650 uppercase tracking-wider">
                  {activeMilestone.subtitle}
                </div>
                <h4 className="text-lg font-black text-zinc-955">{activeMilestone.title}</h4>
                <p className="text-xs sm:text-sm text-zinc-550 leading-relaxed font-semibold">
                  {activeMilestone.description}
                </p>
              </div>
            </div>

            {/* Metric Block (4 cols) */}
            <div className="md:col-span-4 bg-zinc-950 border border-zinc-900 p-6 sm:p-8 rounded-3xl text-white flex flex-col justify-center space-y-2.5 shadow-md">
              <span className="text-3xl font-black text-rose-450 tracking-tight">{activeMilestone.metric}</span>
              <span className="text-[9px] font-black text-zinc-450 uppercase tracking-widest leading-snug">
                {activeMilestone.metricLabel}
              </span>
            </div>

          </div>
        </div>

        {/* 2. CORE VALUES */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-sm space-y-4 hover:border-zinc-350 transition-colors">
            <div className="h-9 w-9 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700">
              <Code2 className="h-4.5 w-4.5" />
            </div>
            <h4 className="text-xs font-black text-zinc-950 uppercase tracking-wider">Skill First</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
              Bypass credential gatekeeping. Developer rankings are backed by verified compiles, not degrees.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-sm space-y-4 hover:border-zinc-350 transition-colors">
            <div className="h-9 w-9 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <h4 className="text-xs font-black text-zinc-950 uppercase tracking-wider">Sandbox Verified</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
              Every challenge code submission is executed under isolated compiler runtimes to verify performance.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-sm space-y-4 hover:border-zinc-355 transition-colors">
            <div className="h-9 w-9 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700">
              <Users className="h-4.5 w-4.5" />
            </div>
            <h4 className="text-xs font-black text-zinc-950 uppercase tracking-wider">Direct Sourcing</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
              Recruiters find student candidates directly through verified rating ranges and contest scores.
            </p>
          </div>
        </div>

        {/* 3. TEAM */}
        <div className="space-y-8">
          <div className="border-b border-zinc-200 pb-5">
            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Users className="h-4 w-4" />
              Our Team
            </h2>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight mt-1.5 font-sans">Who we are</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {team.map((member) => (
              <div 
                key={member.name}
                className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-6 hover:border-zinc-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center text-xs font-black text-white shadow-sm uppercase group-hover:scale-105 transition-transform">
                    {member.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-zinc-950 group-hover:text-rose-600 transition-colors">{member.name}</h4>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{member.role}</p>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                    {member.bio}
                  </p>
                </div>
                <div className="border-t border-zinc-100 pt-4 text-[10px] text-zinc-450 font-semibold italic leading-relaxed">
                  &ldquo;{member.quote}&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-zinc-950 rounded-3xl p-10 md:p-12 text-center text-white border border-zinc-800 relative overflow-hidden shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">Ready to solve challenges?</h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-semibold max-w-md mx-auto mb-8">
            Create your developer profile, affiliate with your university, and start building your verified rating today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link 
              href="/problems"
              className="w-full sm:w-auto px-6 py-3 bg-white text-zinc-950 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-zinc-50 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              Solve Coding Challenges
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              href="/universities"
              className="w-full sm:w-auto px-6 py-3 border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-zinc-800 hover:text-white cursor-pointer flex items-center justify-center gap-1.5"
            >
              Explore Campuses
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
