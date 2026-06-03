import React from "react";
import { db } from "@/db";
import { universities, profiles, users, contests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Award, Building2, Calendar, Trophy, Users, ShieldAlert, ArrowLeft, ArrowRight, Star } from "lucide-react";

export default async function UniversityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let universityInfo: any = null;
  let studentsList: any[] = [];
  let campusContests: any[] = [];

  try {
    // 1. Fetch university details
    const [univ] = await db
      .select()
      .from(universities)
      .where(eq(universities.slug, slug))
      .limit(1);

    universityInfo = univ;

    if (univ) {
      // 2. Fetch student rankings inside this university
      studentsList = await db
        .select({
          id: users.id,
          username: users.username,
          rating: profiles.rating,
          skills: profiles.skills,
        })
        .from(profiles)
        .innerJoin(users, eq(profiles.userId, users.id))
        .where(eq(profiles.universityId, univ.id))
        .orderBy(desc(profiles.rating));

      // 3. Fetch contests hosted by/for this university
      campusContests = await db
        .select()
        .from(contests)
        .where(eq(contests.universityId, univ.id));
    }
  } catch (error) {
    console.warn("University details database query error, loading fallback mockup dataset.", error);
  }

  // Fallback to mockup data if university doesn't exist in database or offline
  if (!universityInfo) {
    const isFast = slug === "fast-nu" || slug === "default";
    universityInfo = {
      id: "univ-1",
      name: isFast
        ? "FAST National University of Computer and Emerging Sciences"
        : "National University of Sciences and Technology",
      slug: isFast ? "fast-nu" : "nust",
      emailDomain: isFast ? "nu.edu.pk" : "nust.edu.pk",
      score: isFast ? 1845 : 1620,
      nationalRank: isFast ? 1 : 2,
    };

    studentsList = [
      { id: "s-1", username: "jane_coder", rating: 1845, skills: ["C++", "Next.js", "Redis"] },
      { id: "s-2", username: "alice_cp", rating: 1720, skills: ["C++", "Go", "Docker"] },
      { id: "s-3", username: "alex_smith", rating: 1620, skills: ["Python", "PostgreSQL"] },
    ];

    campusContests = [
      {
        id: "mock-contest-upcoming",
        title: "University Code Duel (FAST)",
        description: "Private university-wide practice arena for FAST NUCES students.",
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
        durationMinutes: 120,
        status: "APPROVED",
      },
    ];
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 py-16 px-4 sm:px-6 relative overflow-hidden animate-fade-in-up">
      {/* Background grids */}
      <div className="absolute inset-0 glow-mesh pointer-events-none z-0" />
      <div className="absolute inset-0 mesh-grid opacity-[0.35] pointer-events-none z-0" />
      
      {/* Background glow */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10 animate-fade-in-up">
        
        {/* Back Link */}
        <Link
          href="/universities"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-550 hover:text-zinc-800 mb-8 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          University Rankings
        </Link>

        {/* Branded Banner Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 mb-10 shadow-sm relative overflow-hidden hover:border-zinc-300 transition-colors">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full border border-rose-100 bg-rose-50/50 text-[10px] font-black text-rose-600 uppercase tracking-widest">
                  University Profile
                </span>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-md">
                  @{universityInfo.emailDomain} Domain
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-950 max-w-2xl leading-tight">
                {universityInfo.name}
              </h1>

              <p className="text-zinc-500 text-xs sm:text-sm font-semibold max-w-xl leading-relaxed">
                Roster standings, students index, and active contests hosted by {universityInfo.name}.
              </p>
            </div>

            {/* Rank Stat Bubble */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 text-center min-w-[160px] shadow-sm shrink-0">
              <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                National Rank
              </span>
              <span className="text-4xl font-black text-zinc-900 block tracking-tight">
                #{universityInfo.nationalRank}
              </span>
              <span className="text-[10px] font-black text-zinc-500 mt-2 block border-t border-zinc-200 pt-1.5 font-mono">
                SCORE: {universityInfo.score}
              </span>
            </div>
          </div>
        </div>

        {/* Splits Layout */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* Left Pane: Campus Contests (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[320px]">
              <h2 className="text-xs font-black text-zinc-950 uppercase tracking-widest border-b border-zinc-150 pb-4 mb-5 flex items-center gap-2">
                <Trophy className="h-4.5 w-4.5 text-zinc-400" />
                Active Contests
              </h2>

              {campusContests.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {campusContests.map((c) => {
                    const start = new Date(c.startTime);
                    return (
                      <div
                        key={c.id}
                        className="p-5 rounded-2xl border border-zinc-250 bg-zinc-50/50 flex flex-col justify-between hover:border-zinc-300 transition-colors group cursor-pointer"
                      >
                        <div>
                          <h3 className="text-xs font-black text-zinc-950 mb-1.5 group-hover:text-rose-600 transition-colors">
                            {c.title}
                          </h3>
                          <p className="text-[11px] text-zinc-500 font-semibold line-clamp-2 leading-relaxed mb-4">
                            {c.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                          <span>
                            <Calendar className="h-3.5 w-3.5 inline mr-1 text-zinc-400" />
                            {start.toLocaleDateString()}
                          </span>
                          <Link
                            href={`/contests/${c.id}`}
                            className="text-rose-600 hover:text-rose-550 flex items-center gap-0.5 cursor-pointer font-bold"
                          >
                            Enter Lobby <ArrowRight className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <ShieldAlert className="h-10 w-10 text-zinc-400 mx-auto mb-4 animate-bounce" />
                  <p className="text-zinc-500 text-xs font-black uppercase tracking-wider">No contests scheduled</p>
                  <p className="text-zinc-450 text-[10px] mt-1.5 font-semibold">
                    No custom academic challenges scheduled yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Students Ranking (8 cols) */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[320px]">
              <h2 className="text-xs font-black text-zinc-950 uppercase tracking-widest border-b border-zinc-150 pb-4 mb-5 flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-zinc-400" />
                Student Roster
              </h2>

              {studentsList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-400 font-black uppercase tracking-widest text-[9px]">
                        <th className="pb-4.5 w-16 text-center">Rank</th>
                        <th className="pb-4.5 pl-3">Student</th>
                        <th className="pb-4.5">Key Skills</th>
                        <th className="pb-4.5 text-right pr-6 w-36">DSA Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-xs font-semibold text-zinc-700">
                      {studentsList.map((student, index) => {
                        const rank = index + 1;
                        return (
                          <tr key={student.id} className="hover:bg-zinc-50/20 transition-all group relative">
                            <td className="py-4 text-center relative">
                              {/* Gen Z style active row indicator */}
                              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-rose-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-200" />
                              
                              {rank === 1 && <span className="text-base">🥇</span>}
                              {rank === 2 && <span className="text-base">🥈</span>}
                              {rank === 3 && <span className="text-base">🥉</span>}
                              {rank > 3 && <span className="font-black text-zinc-400">{rank}</span>}
                            </td>
                            <td className="py-4 pl-3 font-black text-zinc-900">
                              <Link
                                href={`/u/${student.username}`}
                                className="hover:text-rose-600 transition-colors cursor-pointer"
                              >
                                @{student.username}
                              </Link>
                            </td>
                            <td className="py-4">
                              <div className="flex flex-wrap gap-1">
                                {(student.skills || []).slice(0, 3).map((skill: string) => (
                                  <span
                                    key={skill}
                                    className="px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-500 font-black text-[9px] uppercase tracking-wider"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {(student.skills || []).length > 3 && (
                                  <span className="text-[9px] font-black text-zinc-400 px-1 py-0.5 uppercase tracking-wide">
                                    +{(student.skills || []).length - 3}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 text-right pr-6 font-mono font-black text-zinc-950 text-xs">
                              <div className="flex items-center justify-end gap-1.5">
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                {student.rating}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <ShieldAlert className="h-10 w-10 text-zinc-400 mx-auto mb-4 animate-bounce" />
                  <p className="text-zinc-550 text-xs font-black uppercase tracking-wider">No student records</p>
                  <p className="text-zinc-450 text-[10px] mt-1.5 font-semibold">
                    No active students enrolled under this email domain yet.
                  </p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
