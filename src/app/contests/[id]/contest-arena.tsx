"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Trophy, Clock, Code, Users, Award, Bell, ShieldAlert, ArrowRight, MessageSquare, Terminal } from "lucide-react";

interface Problem {
  id: string;
  title: string;
  slug?: string;
  points: number;
  difficulty?: string;
}

interface Ranking {
  rank: number;
  username: string;
  score: number;
  penaltyTime: number; // in seconds
}

interface ContestArenaProps {
  contest: {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    status: string;
    universityName: string | null;
  };
  initialRankings: Ranking[];
  problems: Problem[];
  currentUser: { username: string; role: string } | null;
}

export default function ContestArena({
  contest,
  initialRankings,
  problems,
  currentUser,
}: ContestArenaProps) {
  const [rankings, setRankings] = useState<Ranking[]>(initialRankings);
  const [timeLeft, setTimeLeft] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [feed, setFeed] = useState<Array<{ id: string; user: string; text: string; time: string; type: "success" | "info" | "error" }>>([
    {
      id: "init-1",
      user: "system",
      text: "Welcome to StudyMikey Competitive Arena! Contest has started.",
      time: "1m ago",
      type: "info",
    },
  ]);
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Remaining duration countdown calculation
  useEffect(() => {
    const end = new Date(contest.endTime).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("CONTEST FINISHED");
        setIsFinished(true);
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hrs.toString().padStart(2, "0")}:${mins
          .toString()
          .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [contest.endTime]);

  // Live submit feed simulation ticker to show dynamic live activity
  useEffect(() => {
    if (isFinished) return;

    const mockUsers = ["bob_algo", "alex_smith", "alice_cp", "dr_carter"];
    const mockProblems = problems.length > 0 ? problems : [{ id: "1", title: "Two Sum", points: 100 }];
    const statusOutcomes = ["ACCEPTED", "ACCEPTED", "WA", "TLE", "ACCEPTED"];

    const feedInterval = setInterval(() => {
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const randomProblem = mockProblems[Math.floor(Math.random() * mockProblems.length)];
      const randomStatus = statusOutcomes[Math.floor(Math.random() * statusOutcomes.length)];

      const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
      const itemKey = Math.random().toString();

      // Add to feed
      let feedText = "";
      let feedType: "success" | "error" | "info" = "info";

      if (randomStatus === "ACCEPTED") {
        feedText = `solved ${randomProblem.title} (+${randomProblem.points} Pts)`;
        feedType = "success";

        // Dynamically update standings rankings
        setRankings((prev) => {
          const updated = prev.map((rank) => {
            if (rank.username === randomUser) {
              return {
                ...rank,
                score: rank.score + randomProblem.points,
                penaltyTime: rank.penaltyTime + Math.floor(Math.random() * 600) + 120,
              };
            }
            return rank;
          });

          // Re-sort
          return updated
            .sort((a, b) => {
              if (b.score !== a.score) return b.score - a.score;
              return a.penaltyTime - b.penaltyTime;
            })
            .map((r, i) => ({ ...r, rank: i + 1 }));
        });
      } else if (randomStatus === "WA") {
        feedText = `failed submission on ${randomProblem.title}: Wrong Answer`;
        feedType = "error";
      } else {
        feedText = `failed submission on ${randomProblem.title}: Time Limit Exceeded`;
        feedType = "info";
      }

      setFeed((prev) => [
        ...prev,
        {
          id: itemKey,
          user: randomUser,
          text: feedText,
          time: timestamp,
          type: feedType,
        },
      ]);
    }, 12000); // Trigger every 12 seconds

    return () => clearInterval(feedInterval);
  }, [problems, isFinished]);

  // Scroll feed to bottom automatically
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [feed]);

  return (
    <div>
      {/* Contest Info Header */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-blue-600">
              Contest Mode
            </span>
            {contest.universityName && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">
                {contest.universityName} Only
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
            {contest.title}
          </h1>
          <p className="text-zinc-500 text-xs font-semibold mt-1">
            {contest.description}
          </p>
        </div>

        {/* Timer Box */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-6 py-4 text-center min-w-[160px] shadow-sm">
          <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
            <Clock className="h-3.5 w-3.5" />
            Time Remaining
          </div>
          <span className="text-2xl font-black tracking-tight text-zinc-900 block font-mono">
            {timeLeft || "Loading..."}
          </span>
        </div>
      </div>

      {/* Main Splits */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Side: Problem list (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex-1">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3 mb-4 flex items-center gap-2">
              <Code className="h-4.5 w-4.5 text-blue-600" />
              Contest Problems
            </h2>

            <div className="flex flex-col gap-3">
              {problems.map((prob) => {
                const problemSlug = prob.slug || prob.title.toLowerCase().replace(/ /g, "-");
                return (
                  <Link
                    key={prob.id}
                    href={`/problems/${problemSlug}?contestId=${contest.id}`}
                    className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 hover:shadow-sm active:scale-[0.99] transition-all duration-200 group flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                        {prob.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-zinc-400">
                          {prob.points} points
                        </span>
                        {prob.difficulty && (
                          <span
                            className={`text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                              prob.difficulty === "EASY"
                                ? "bg-emerald-50 text-emerald-600"
                                : prob.difficulty === "MEDIUM"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Announcements & live feed */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm h-64 flex flex-col justify-between">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3 mb-3 flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-blue-600" />
              Live Feed Standings
            </h2>

            <div className="flex-1 overflow-y-auto pr-1 text-xs space-y-2 mb-2 font-mono scrollbar-thin">
              {feed.map((item) => (
                <div
                  key={item.id}
                  className={`p-2 rounded border flex items-start gap-2 ${
                    item.type === "success"
                      ? "bg-emerald-50/50 border-emerald-100 text-emerald-700"
                      : item.type === "error"
                      ? "bg-red-50/50 border-red-100 text-red-700"
                      : "bg-zinc-50 border-zinc-100 text-zinc-600"
                  }`}
                >
                  <span className="text-zinc-400 font-semibold flex-shrink-0">{item.time}</span>
                  <div>
                    <span className="font-bold text-zinc-900 mr-1.5">
                      {item.user === "system" ? "📢" : `@${item.user}`}
                    </span>
                    <span className="font-medium">{item.text}</span>
                  </div>
                </div>
              ))}
              <div ref={feedEndRef} />
            </div>
          </div>
        </div>

        {/* Right Side: Leaderboards rankings (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3 mb-6 flex items-center gap-2">
              <Trophy className="h-4.5 w-4.5 text-amber-500 fill-amber-50" />
              Live Standings Board
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="pb-3.5 w-12 text-center">Rank</th>
                    <th className="pb-3.5 pl-2">User</th>
                    <th className="pb-3.5 text-center w-24">Solved</th>
                    <th className="pb-3.5 text-right w-32">Penalty Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rankings.map((row) => {
                    const isSelf = currentUser && row.username === currentUser.username;
                    
                    const formatPenalty = (totalSecs: number) => {
                      const hrs = Math.floor(totalSecs / 3600);
                      const mins = Math.floor((totalSecs % 3600) / 60);
                      const secs = totalSecs % 60;
                      return `${hrs.toString().padStart(2, "0")}:${mins
                        .toString()
                        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                    };

                    return (
                      <tr
                        key={row.username}
                        className={`transition-colors ${
                          isSelf
                            ? "bg-blue-50/40 font-bold text-blue-700"
                            : "hover:bg-zinc-50/50"
                        }`}
                      >
                        <td className="py-3 text-center">
                          {row.rank === 1 && <span className="text-lg">🥇</span>}
                          {row.rank === 2 && <span className="text-lg">🥈</span>}
                          {row.rank === 3 && <span className="text-lg">🥉</span>}
                          {row.rank > 3 && (
                            <span className="font-bold text-zinc-500">{row.rank}</span>
                          )}
                        </td>
                        <td className="py-3 pl-2 font-bold text-zinc-900 flex items-center gap-2">
                          <Link href={`/u/${row.username}`} className="hover:text-blue-600 transition-colors">
                            @{row.username}
                          </Link>
                          {isSelf && (
                            <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-blue-200 bg-blue-100/50 text-blue-600">
                              You
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-center font-bold text-zinc-700">
                          {row.score} pts
                        </td>
                        <td className="py-3 text-right font-mono text-zinc-400 font-semibold">
                          {row.penaltyTime > 0 ? formatPenalty(row.penaltyTime) : "--"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
