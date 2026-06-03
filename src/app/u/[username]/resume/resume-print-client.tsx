"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Printer, Mail, Award, GraduationCap, Star, ArrowLeft, Code } from "lucide-react";
import Link from "next/link";

const GithubIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface ResumePrintClientProps {
  user: {
    username: string;
    email: string;
    role: string;
  };
  profile: {
    bio?: string | null;
    rating?: number;
    maxRating?: number;
    level?: number;
    xp?: number;
    streak?: number;
    skills?: string[] | null;
    githubLink?: string | null;
  };
  projects: any[];
  certificates: any[];
  universityName: string | null;
}

export default function ResumePrintClient({
  user,
  profile,
  projects,
  certificates,
  universityName,
}: ResumePrintClientProps) {
  const searchParams = useSearchParams();

  // Auto trigger browser print if ?print=true is present
  useEffect(() => {
    if (searchParams.get("print") === "true") {
      // Small timeout to allow styling and DOM rendering to stabilize
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Print Control Bar (Hidden on print) */}
      <div className="print:hidden flex items-center justify-between mb-8 p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm">
        <Link
          href={`/u/${user.username}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Printable PDF Resume Mode
          </span>
          <button
            onClick={() => window.print()}
            className="btn-primary py-2 px-4 text-xs tracking-wider flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="h-4 w-4" /> Save PDF / Print
          </button>
        </div>
      </div>

      {/* Main Resume Sheet */}
      <div className="bg-white border border-zinc-200 print:border-none print:shadow-none shadow-sm rounded-3xl p-10 print:p-0 relative">
        {/* CV Header */}
        <div className="border-b border-zinc-200 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 capitalize mb-1">
              {user.username.replace(/_/g, " ")}
            </h1>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest">
              Software Engineer ({user.role})
            </p>
          </div>

          <div className="flex flex-col gap-2 text-xs font-semibold text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-zinc-400" />
              {user.email}
            </span>
            {profile.githubLink && (
              <span className="flex items-center gap-1.5">
                <GithubIcon className="h-4 w-4 text-zinc-400" />
                {profile.githubLink.replace("https://", "")}
              </span>
            )}
            {universityName && (
              <span className="flex items-center gap-1.5 max-w-xs truncate">
                <GraduationCap className="h-4 w-4 text-zinc-400" />
                {universityName}
              </span>
            )}
          </div>
        </div>

        {/* CV Grid splits */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Left Column: Bio summary, ratings, skills */}
          <div className="md:col-span-1 space-y-6">
            {/* Bio summary */}
            <div>
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-100 pb-1.5">
                Profile Summary
              </h2>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                {profile.bio || "No summary provided."}
              </p>
            </div>

            {/* Standings */}
            <div>
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-100 pb-1.5">
                DSA Rank Metric
              </h2>
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-zinc-900 flex items-center justify-center gap-1">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  {profile.rating || 1200}
                </div>
                <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                  StudyMikey Rating (Lvl {profile.level || 1})
                </div>
              </div>
            </div>

            {/* Verified Stack */}
            <div>
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-100 pb-1.5">
                Technology Stack
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {(profile.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-[10px] font-bold text-zinc-500"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Projects & Certificates */}
          <div className="md:col-span-2 space-y-8">
            {/* Projects */}
            <div>
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-100 pb-1.5 flex items-center gap-1.5">
                <Code className="h-4 w-4 text-blue-600" />
                Featured Showcase Projects
              </h2>

              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="border-l-2 border-blue-100 pl-4">
                    <h3 className="text-xs font-black text-zinc-900">{proj.title}</h3>
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold mt-1">
                      {proj.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(proj.technologies || []).map((tech: string) => (
                        <span
                          key={tech}
                          className="px-1.5 py-0.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-400 text-[8px] font-bold"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates */}
            {certificates.length > 0 && (
              <div>
                <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-100 pb-1.5 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-blue-600" />
                  Verified Professional Certifications
                </h2>

                <div className="space-y-3.5">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xs font-black text-zinc-900">{cert.name}</h3>
                        <p className="text-[10px] text-zinc-400 font-bold">
                          Issued by: <span className="text-zinc-500">{cert.issuingOrg}</span> • Date: <span className="text-zinc-500 font-mono">{cert.issueDate}</span>
                        </p>
                      </div>
                      {cert.isVerified && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded border border-emerald-100 bg-emerald-50 text-[8px] font-black uppercase text-emerald-600">
                          Verified
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer branding */}
        <div className="border-t border-zinc-100 mt-10 pt-4 text-center text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
          Generated via StudyMikey Verified Profile Builder
        </div>
      </div>
    </div>
  );
}
