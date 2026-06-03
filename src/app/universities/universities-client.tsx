"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, Search, Users, Award, ShieldAlert, ChevronRight, School } from "lucide-react";

interface University {
  id: string;
  name: string;
  slug: string;
  emailDomain: string;
  score: number;
  nationalRank: number;
  solverCount: number;
  avgRating: number;
}

interface UniversitiesClientProps {
  initialUniversities: University[];
}

export default function UniversitiesClient({ initialUniversities }: UniversitiesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUniversities = initialUniversities.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.emailDomain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting based on score DESC
  const sortedUniversities = [...filteredUniversities].sort((a, b) => b.score - a.score);

  // Calculate aggregates
  const totalSolvers = initialUniversities.reduce((acc, curr) => acc + (curr.solverCount || 0), 0);
  const highestRated = initialUniversities.length > 0 
    ? [...initialUniversities].sort((a, b) => b.score - a.score)[0].name
    : "N/A";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950 flex items-center justify-start gap-3">
            <Building2 className="h-8 w-8 text-zinc-700" />
            University Leaderboards
          </h1>
          <p className="text-zinc-500 mt-2 text-xs sm:text-sm font-semibold max-w-xl leading-relaxed">
            Compare active student solved statistics, check rankings, and view campus rosters.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full self-start md:self-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search universities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-semibold text-zinc-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 transition-all duration-200 shadow-sm"
          />
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:border-zinc-350 transition-colors group">
          <div className="h-10 w-10 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700 flex-shrink-0">
            <School className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[9px] font-black text-zinc-450 uppercase tracking-widest mb-0.5">Universities</span>
            <span className="text-lg font-black text-zinc-950">{initialUniversities.length} Institutions</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:border-zinc-350 transition-colors group">
          <div className="h-10 w-10 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700 flex-shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[9px] font-black text-zinc-450 uppercase tracking-widest mb-0.5">Active Solvers</span>
            <span className="text-lg font-black text-zinc-950">{totalSolvers} Students</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:border-zinc-350 transition-colors group">
          <div className="h-10 w-10 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700 flex-shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[9px] font-black text-zinc-450 uppercase tracking-widest mb-0.5">Top Institution</span>
            <span className="text-xs sm:text-sm font-black text-zinc-950 truncate block mt-0.5">{highestRated}</span>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      {sortedUniversities.length > 0 ? (
        <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-black uppercase tracking-widest bg-zinc-50/50 text-[9px]">
                  <th className="py-4.5 pl-6 w-20 text-center">Rank</th>
                  <th className="py-4.5 pl-4">University</th>
                  <th className="py-4.5">Domain</th>
                  <th className="py-4.5 text-center w-36">Active Solvers</th>
                  <th className="py-4.5 text-center w-36">Average Rating</th>
                  <th className="py-4.5 text-center w-36">Score</th>
                  <th className="py-4.5 pr-6 w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs font-semibold text-zinc-700">
                {sortedUniversities.map((univ, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={univ.id} className="hover:bg-zinc-50/30 transition-colors group relative">
                      <td className="py-5 pl-6 text-center">
                        {rank === 1 && <span className="text-lg">🥇</span>}
                        {rank === 2 && <span className="text-lg">🥈</span>}
                        {rank === 3 && <span className="text-lg">🥉</span>}
                        {rank > 3 && <span className="font-black text-zinc-400">{rank}</span>}
                      </td>
                      <td className="py-5 pl-4 font-black text-zinc-900 max-w-sm truncate">
                        {univ.name}
                      </td>
                      <td className="py-5 font-mono font-bold text-zinc-500 text-[10px]">
                        @{univ.emailDomain}
                      </td>
                      <td className="py-5 text-center font-bold text-zinc-800">
                        {univ.solverCount || 0}
                      </td>
                      <td className="py-5 text-center font-bold text-zinc-800">
                        {univ.avgRating ? `${univ.avgRating} XP` : "N/A"}
                      </td>
                      <td className="py-5 text-center">
                        <span className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-850 font-bold font-mono text-[10px]">
                          {univ.score}
                        </span>
                      </td>
                      <td className="py-5 pr-6 text-right">
                        <Link
                          href={`/universities/${univ.slug}`}
                          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-600 hover:text-rose-500 cursor-pointer"
                        >
                          View Roster 
                          <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="border border-zinc-200 bg-white rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm">
          <ShieldAlert className="h-10 w-10 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-sm font-black text-zinc-950 mb-1 uppercase tracking-wider">No Universities Found</h3>
          <p className="text-zinc-500 text-xs font-semibold">
            There are currently no registered universities matching this search criteria.
          </p>
        </div>
      )}
    </div>
  );
}
