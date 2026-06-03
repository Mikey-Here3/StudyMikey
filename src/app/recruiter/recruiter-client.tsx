"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, GraduationCap, Star, CheckCircle, Mail, Download, Lock, CheckSquare, ShieldAlert, Award } from "lucide-react";

export interface StudentCandidate {
  id: string;
  name: string;
  username: string;
  rating: number;
  skills: string[];
  universityName: string;
  isOpenToWork: boolean;
  solvedCount: number;
  bio: string;
}

interface RecruiterClientProps {
  initialCandidates: StudentCandidate[];
  isRecruiter: boolean;
}

export default function RecruiterClient({ initialCandidates, isRecruiter }: RecruiterClientProps) {
  // States
  const [minRating, setMinRating] = useState(1200);
  const [selectedUniv, setSelectedUniv] = useState("ALL");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [onlyOpenToWork, setOnlyOpenToWork] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [outreachModal, setOutreachModal] = useState<{ isOpen: boolean; candidate: StudentCandidate | null }>({
    isOpen: false,
    candidate: null,
  });
  const [outreachText, setOutreachText] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // List of available skills in checkbox filters
  const availableSkills = ["C++", "Next.js", "Redis", "Docker", "Python", "Go", "PostgreSQL", "Java", "Spring Boot", "Typescript", "Kubernetes", "Django"];

  // Toggle skills selections
  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Filtering candidates logic
  const filteredCandidates = initialCandidates.filter((cand) => {
    const matchesRating = cand.rating >= minRating;
    const matchesUniv = selectedUniv === "ALL" || cand.universityName.toLowerCase().includes(selectedUniv.toLowerCase());
    const matchesOpen = !onlyOpenToWork || cand.isOpenToWork;
    const matchesSearch = cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.bio.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSkills = selectedSkills.length === 0 ||
      selectedSkills.every((s) => cand.skills.includes(s));

    return matchesRating && matchesUniv && matchesOpen && matchesSearch && matchesSkills;
  });

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSendOutreach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outreachModal.candidate) return;
    
    triggerToast(`🎉 Outreach message successfully dispatched to @${outreachModal.candidate.username}!`);
    setOutreachModal({ isOpen: false, candidate: null });
    setOutreachText("");
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Recruiter verification gate prompt */}
        {!isRecruiter && (
          <div className="mb-8 p-4.5 rounded-2xl border border-indigo-100 bg-indigo-50/50 text-indigo-800 text-xs font-semibold flex items-center gap-3 shadow-sm">
            <ShieldAlert className="h-5.5 w-5.5 text-indigo-600 flex-shrink-0" />
            <div>
              <span className="font-bold">Recruiter Mode Preview:</span> You are currently viewing this portal in Developer Preview mode. Full verified recruiters bypass outreach caps and have access to direct resume PDF links.
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 p-4.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xl animate-bounce">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 flex items-center justify-center md:justify-start gap-2.5">
              <SlidersHorizontal className="h-8 w-8 text-blue-600" />
              Talent Sourcing Engine
            </h1>
            <p className="text-zinc-500 mt-2 text-sm font-semibold max-w-xl">
              Filter student portfolios directly by verified contest ratings, DSA profiles, campus affiliations, and engineering skillsets.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm w-full self-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search candidate profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        {/* Columns split */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Filters Panel (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xs font-black text-zinc-950 uppercase tracking-widest border-b border-zinc-100 pb-3.5 mb-5 flex items-center gap-2">
                <SlidersHorizontal className="h-4.5 w-4.5 text-zinc-400" />
                Refine Search Filters
              </h2>

              {/* University selection dropdown */}
              <div className="mb-5 text-xs font-bold">
                <label className="block text-zinc-500 mb-2 uppercase tracking-wide">University Campus</label>
                <select
                  value={selectedUniv}
                  onChange={(e) => setSelectedUniv(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-zinc-800 outline-none focus:border-blue-500 transition-colors shadow-sm"
                >
                  <option value="ALL">All Campuses</option>
                  <option value="FAST">FAST National University</option>
                  <option value="NUST">NUST Islamabad</option>
                  <option value="UET">UET Lahore</option>
                  <option value="COMSATS">COMSATS Islamabad</option>
                </select>
              </div>

              {/* Rating Slider */}
              <div className="mb-6 text-xs font-bold">
                <div className="flex items-center justify-between text-zinc-500 mb-2 uppercase tracking-wide">
                  <span>Minimum Rating</span>
                  <span className="text-blue-600 font-mono">{minRating} XP</span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="2200"
                  step="50"
                  value={minRating}
                  onChange={(e) => setMinRating(parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-1 bg-zinc-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Open to Work status checkbox */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-600">
                  <input
                    type="checkbox"
                    checked={onlyOpenToWork}
                    onChange={(e) => setOnlyOpenToWork(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Show only &quot;Open to Work&quot;</span>
                </label>
              </div>

              {/* Technologies checklists */}
              <div className="text-xs font-bold">
                <label className="block text-zinc-500 mb-3 uppercase tracking-wide">Select Technologies</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableSkills.map((skill) => {
                    const isChecked = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`p-2.5 rounded-xl border text-left text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isChecked
                            ? "border-blue-500 bg-blue-50/50 text-blue-700 font-extrabold"
                            : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-600"
                        }`}
                      >
                        <CheckSquare className={`h-4 w-4 ${isChecked ? "text-blue-600" : "text-zinc-300"}`} />
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Results grid (8 cols) */}
          <div className="lg:col-span-8">
            {filteredCandidates.length > 0 ? (
              <div className="flex flex-col gap-5">
                {filteredCandidates.map((cand) => {
                  const ratingTitle =
                    cand.rating >= 1800
                      ? "Candidate Master"
                      : cand.rating >= 1600
                      ? "Expert"
                      : cand.rating >= 1400
                      ? "Specialist"
                      : "Newbie";

                  return (
                    <div
                      key={cand.id}
                      className="bg-white border border-zinc-200 rounded-3xl p-6.5 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-zinc-300"
                    >
                      {/* Open status tag */}
                      {cand.isOpenToWork && (
                        <div className="absolute top-0 right-0 rounded-bl-2xl border-l border-b border-emerald-200 bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-600">
                          🟢 Open to Work
                        </div>
                      )}

                      <div className="mb-4">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <Link href={`/u/${cand.username}`} className="text-lg font-black text-zinc-950 hover:text-blue-600 transition-colors">
                            {cand.name}
                          </Link>
                          <span className="text-[10px] font-semibold text-zinc-400">@{cand.username}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs font-semibold text-zinc-500">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4 text-zinc-400" />
                            {cand.universityName}
                          </span>
                          <span className="flex items-center gap-1 font-bold text-zinc-800">
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            {cand.rating} XP ({ratingTitle})
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-blue-500" />
                            {cand.solvedCount} Solved
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-500 leading-relaxed font-semibold mb-5">
                        {cand.bio}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {cand.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-500 text-[10px] font-bold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="border-t border-zinc-100 pt-5 flex items-center justify-between gap-3">
                        <Link
                          href={`/u/${cand.username}`}
                          className="btn-secondary py-2 px-4.5 text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-sm hover:shadow"
                        >
                          Inspect Code Profile
                        </Link>

                        <div className="flex gap-2">
                          {/* Resume Download action */}
                          {isRecruiter ? (
                            <Link
                              href={`/u/${cand.username}/resume?print=true`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-800 transition-colors shadow-sm cursor-pointer flex items-center justify-center"
                              title="Download Resume"
                            >
                              <Download className="h-4 w-4" />
                            </Link>
                          ) : (
                            <button
                              onClick={() =>
                                triggerToast("🔒 Access Restricted: Resume downloads require a verified Recruiter role.")
                              }
                              className="p-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-800 transition-colors shadow-sm cursor-pointer"
                              title="Download Resume"
                            >
                              <Lock className="h-4 w-4 text-zinc-400" />
                            </button>
                          )}

                          {/* Message/Outreach Modal trigger */}
                          <button
                            onClick={() =>
                              isRecruiter
                                ? setOutreachModal({ isOpen: true, candidate: cand })
                                : triggerToast("🔒 Access Restricted: Direct outreach requires a verified Recruiter role.")
                            }
                            className="btn-primary py-2.5 px-4 text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-sm hover:shadow"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Send Outreach
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-zinc-200 bg-white rounded-3xl p-12 text-center max-w-md mx-auto">
                <ShieldAlert className="h-10 w-10 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-base font-bold text-zinc-900 mb-1">No candidates match</h3>
                <p className="text-zinc-500 text-xs font-semibold">
                  Adjust the rating thresholds or skill criteria to widen your talent searches.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Outreach Modal */}
        {outreachModal.isOpen && outreachModal.candidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
            <div className="bg-white border border-zinc-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-lg font-black text-zinc-950 mb-1 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Talent Outreach to @{outreachModal.candidate.username}
              </h3>
              <p className="text-[11px] text-zinc-400 font-semibold mb-4">
                Verify details below to initiate direct communication with {outreachModal.candidate.name}.
              </p>

              <form onSubmit={handleSendOutreach} className="space-y-4">
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-xs font-semibold text-zinc-600">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Target candidate</span>
                    <span className="text-blue-600">Rating: {outreachModal.candidate.rating} XP</span>
                  </div>
                  <div className="font-bold text-zinc-900 text-sm">
                    {outreachModal.candidate.name} ({outreachModal.candidate.universityName})
                  </div>
                </div>

                <div className="text-xs font-bold">
                  <label className="block text-zinc-500 mb-1.5 uppercase">Outreach Message Body</label>
                  <textarea
                    required
                    value={outreachText}
                    onChange={(e) => setOutreachText(e.target.value)}
                    placeholder="Describe the opportunity, role requirements, and salary brackets..."
                    className="w-full rounded-xl border border-zinc-200 p-3 h-28 text-zinc-800 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 shadow-sm resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setOutreachModal({ isOpen: false, candidate: null })}
                    className="btn-secondary py-2 px-4 text-xs tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary py-2 px-4 text-xs tracking-wider"
                  >
                    Send Outreach
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
