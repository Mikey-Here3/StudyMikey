"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  ShieldAlert,
  Users,
  ArrowRight,
  Zap,
  Flame,
  Target,
  Timer,
  Star,
  ChevronRight,
  Shield,
  Award,
  Swords,
} from "lucide-react";
import { joinContestAction } from "@/lib/actions/contest-actions";

interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isUniversityOnly: boolean;
  status: string;
  universityName: string | null;
}

interface ContestsClientProps {
  initialContests: Contest[];
  registeredContestIds: string[];
  isAuthenticated: boolean;
}

/* ─── Countdown Hook ─── */
function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
      return {
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      };
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

/* ─── Live Elapsed Hook ─── */
function useElapsed(startDate: string, endDate: string) {
  const [progress, setProgress] = useState(0);
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const s = new Date(startDate).getTime();
      const e = new Date(endDate).getTime();
      const total = e - s;
      const elapsed = now - s;
      const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
      const rem = Math.max(0, e - now);
      const mLeft = Math.floor(rem / 60000);
      const sLeft = Math.floor((rem % 60000) / 1000);
      return { pct, remaining: `${mLeft}m ${sLeft}s left` };
    };
    const { pct, remaining: r } = calc();
    setProgress(pct);
    setRemaining(r);
    const interval = setInterval(() => {
      const { pct, remaining: r } = calc();
      setProgress(pct);
      setRemaining(r);
    }, 1000);
    return () => clearInterval(interval);
  }, [startDate, endDate]);

  return { progress, remaining };
}

/* ─── Countdown Display Component ─── */
function CountdownTimer({ targetDate }: { targetDate: string }) {
  const { d, h, m, s } = useCountdown(targetDate);
  return (
    <div className="flex gap-1.5">
      {[
        { val: d, label: "D" },
        { val: h, label: "H" },
        { val: m, label: "M" },
        { val: s, label: "S" },
      ].map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="bg-zinc-100 border border-zinc-200 rounded-lg px-2 py-1.5 min-w-[36px] tabular-nums">
            <span className="text-sm font-black text-zinc-900">{String(unit.val).padStart(2, "0")}</span>
          </div>
          <span className="text-[8px] font-bold text-zinc-400 mt-0.5 block">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Live Progress Bar ─── */
function LiveProgressBar({ startDate, endDate }: { startDate: string; endDate: string }) {
  const { progress, remaining } = useElapsed(startDate, endDate);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          LIVE
        </span>
        <span className="text-[10px] font-semibold text-zinc-500">{remaining}</span>
      </div>
      <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(244,63,94,0.3)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Contest Card Component ─── */
function ContestCard({
  contest,
  isRegistered,
  isLive,
  isFinished,
  isUpcoming,
  onRegister,
  isRegistering,
  index,
}: {
  contest: Contest;
  isRegistered: boolean;
  isLive: boolean;
  isFinished: boolean;
  isUpcoming: boolean;
  onRegister: () => void;
  isRegistering: boolean;
  index: number;
}) {
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);

  // Determine difficulty tier based on duration
  const tier =
    contest.durationMinutes >= 180
      ? { label: "EXPERT", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" }
      : contest.durationMinutes >= 120
        ? { label: "ADVANCED", text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" }
        : { label: "PRO", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" };

  // Mock participant count
  const participantCount = 5 + (contest.title.length % 20);

  return (
    <div
      className="group relative bg-white border border-zinc-200/80 rounded-2xl overflow-hidden hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-[2px] transition-all duration-500"
      style={{
        animation: `fadeInUp 0.5s ${index * 0.12}s cubic-bezier(0.16, 1, 0.3, 1) both`,
      }}
    >
      {/* Top Accent Line */}
      <div
        className={`h-[2.5px] w-full bg-gradient-to-r ${
          isLive ? "from-rose-500 via-amber-500 to-rose-500" : isUpcoming ? "from-blue-500 via-indigo-500 to-purple-500" : "from-zinc-300 via-zinc-200 to-zinc-300"
        }`}
      />

      {/* Live Glow Effect */}
      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-rose-50/60 to-transparent pointer-events-none" />
      )}

      <div className="p-6 flex flex-col h-full">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* Tier Badge */}
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${tier.bg} ${tier.border} border ${tier.text}`}>
              {tier.label}
            </span>
            {/* Duration */}
            <span className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400">
              <Timer className="h-3 w-3" />
              {contest.durationMinutes}m
            </span>
          </div>

          {/* Status Badge */}
          {isLive && (
            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-rose-50 border border-rose-200 text-rose-600 flex items-center gap-1.5 shadow-sm animate-pulse">
              <Flame className="h-3 w-3" />
              LIVE NOW
            </span>
          )}
          {isUpcoming && (
            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-50 border border-blue-200 text-blue-600 flex items-center gap-1.5">
              <Target className="h-3 w-3" />
              UPCOMING
            </span>
          )}
          {isFinished && (
            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3" />
              ENDED
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-zinc-900 mb-2 leading-tight group-hover:text-rose-600 transition-colors duration-300">
          {contest.title}
        </h3>

        {/* University Badge */}
        {contest.universityName && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-indigo-100 bg-indigo-50/50 text-[10px] font-bold text-indigo-600 mb-2 w-fit">
            <Shield className="h-3 w-3" />
            {contest.universityName} Only
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-5 line-clamp-3 flex-grow">
          {contest.description}
        </p>

        {/* Live Progress / Countdown / Date */}
        <div className="mb-5">
          {isLive && <LiveProgressBar startDate={contest.startTime} endDate={contest.endTime} />}
          {isUpcoming && (
            <div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Starts In</p>
              <CountdownTimer targetDate={contest.startTime} />
            </div>
          )}
          {isFinished && (
            <div className="flex items-center gap-2 text-[10px] font-semibold text-zinc-400">
              <Calendar className="h-3.5 w-3.5" />
              Ended {end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="border-t border-zinc-100 pt-4 mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400">
              <Users className="h-3.5 w-3.5" />
              <span>{participantCount} registered</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400">
              <Calendar className="h-3.5 w-3.5" />
              {start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" · "}
              {start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          {/* Action Button */}
          {isFinished ? (
            <Link
              href={`/contests/${contest.id}`}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 hover:border-zinc-300 transition-all duration-300"
            >
              <Award className="h-3.5 w-3.5" /> View Standings
              <ChevronRight className="h-3 w-3 ml-auto" />
            </Link>
          ) : isRegistered || isLive ? (
            <Link
              href={`/contests/${contest.id}`}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-xs font-black text-white uppercase tracking-wider shadow-md shadow-rose-200/60 hover:shadow-lg hover:shadow-rose-300/50 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Swords className="h-3.5 w-3.5" /> Enter Arena
              <ArrowRight className="h-3.5 w-3.5 ml-auto group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <button
              onClick={onRegister}
              disabled={isRegistering}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-black text-white uppercase tracking-wider shadow-md shadow-blue-200/50 hover:shadow-lg hover:shadow-blue-300/40 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isRegistering ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5" /> Register Now
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Contests Feed ─── */
export default function ContestsClient({
  initialContests,
  registeredContestIds,
  isAuthenticated,
}: ContestsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "past">("live");
  const [searchQuery, setSearchQuery] = useState("");
  const [registrations, setRegistrations] = useState<string[]>(registeredContestIds);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const now = useMemo(() => new Date(), []);

  // Count contests per tab
  const tabCounts = useMemo(() => {
    const live = initialContests.filter((c) => {
      const s = new Date(c.startTime);
      const e = new Date(c.endTime);
      return now >= s && now <= e && c.status !== "FINISHED";
    }).length;
    const upcoming = initialContests.filter((c) => {
      const s = new Date(c.startTime);
      return now < s && c.status !== "FINISHED";
    }).length;
    const past = initialContests.filter((c) => {
      const e = new Date(c.endTime);
      return now > e || c.status === "FINISHED";
    }).length;
    return { live, upcoming, past };
  }, [initialContests, now]);

  // Auto-select first non-empty tab
  useEffect(() => {
    if (tabCounts.live > 0) setActiveTab("live");
    else if (tabCounts.upcoming > 0) setActiveTab("upcoming");
    else if (tabCounts.past > 0) setActiveTab("past");
  }, [tabCounts]);

  const getTabContests = () => {
    return initialContests.filter((contest) => {
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);
      const matchesSearch =
        contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contest.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (contest.universityName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      if (!matchesSearch) return false;

      if (activeTab === "live") return now >= start && now <= end && contest.status !== "FINISHED";
      if (activeTab === "upcoming") return now < start && contest.status !== "FINISHED";
      return now > end || contest.status === "FINISHED";
    });
  };

  const handleRegister = async (contestId: string) => {
    if (!isAuthenticated) {
      router.push("/auth/login?callbackUrl=/contests");
      return;
    }
    setRegisteringId(contestId);
    setMessage(null);
    const res = await joinContestAction(contestId);
    setRegisteringId(null);
    if (res.success) {
      setRegistrations((prev) => [...prev, contestId]);
      setMessage({ type: "success", text: res.message || "Registered successfully!" });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to register." });
    }
  };

  const filteredContests = getTabContests();

  const tabs = [
    { key: "live" as const, label: "Live Now", icon: Flame, count: tabCounts.live, accentColor: "rose" },
    { key: "upcoming" as const, label: "Upcoming", icon: Target, count: tabCounts.upcoming, accentColor: "blue" },
    { key: "past" as const, label: "Past Contests", icon: Trophy, count: tabCounts.past, accentColor: "zinc" },
  ];

  return (
    <div>
      {/* ─── Hero Banner ─── */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-white via-rose-50/30 to-white border border-zinc-200/80 p-8 md:p-12 shadow-[0_2px_40px_-8px_rgba(0,0,0,0.04)]">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />
        {/* Glow orbs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-200/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-200/60">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">
                  Contest Arena
                </h1>
                <p className="text-xs font-semibold text-zinc-400 mt-0.5">
                  Professional Competitive Programming
                </p>
              </div>
            </div>
            <p className="text-sm text-zinc-500 font-medium max-w-lg leading-relaxed">
              Battle-tested coding challenges hosted by expert admins. Compete in live arenas,
              climb the leaderboard, and prove your algorithmic mastery.
            </p>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 mt-6">
              <div className="text-center">
                <p className="text-xl font-black text-zinc-900">{initialContests.length}</p>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Total</p>
              </div>
              <div className="h-8 w-px bg-zinc-200" />
              <div className="text-center">
                <p className="text-xl font-black text-rose-600">{tabCounts.live}</p>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Live</p>
              </div>
              <div className="h-8 w-px bg-zinc-200" />
              <div className="text-center">
                <p className="text-xl font-black text-blue-600">{tabCounts.upcoming}</p>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Upcoming</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search arenas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-900 placeholder-zinc-400 outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10 transition-all duration-300 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {message.text}
        </div>
      )}

      {/* ─── Tab Bar ─── */}
      <div className="flex items-center gap-2 mb-8 bg-zinc-50 border border-zinc-200/80 rounded-2xl p-1.5 shadow-sm">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                isSelected
                  ? tab.key === "live"
                    ? "bg-white text-rose-700 border border-rose-200 shadow-md shadow-rose-100/40"
                    : tab.key === "upcoming"
                      ? "bg-white text-blue-700 border border-blue-200 shadow-md shadow-blue-100/40"
                      : "bg-white text-zinc-700 border border-zinc-200 shadow-md"
                  : "text-zinc-400 hover:text-zinc-600 border border-transparent"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                  isSelected
                    ? tab.key === "live"
                      ? "bg-rose-50 text-rose-600"
                      : tab.key === "upcoming"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-zinc-100 text-zinc-500"
                    : "bg-zinc-100 text-zinc-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Contest Cards Grid ─── */}
      {filteredContests.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredContests.map((contest, idx) => {
            const start = new Date(contest.startTime);
            const end = new Date(contest.endTime);
            const isRegistered = registrations.includes(contest.id);
            const isLive = now >= start && now <= end && contest.status !== "FINISHED";
            const isFinished = now > end || contest.status === "FINISHED";
            const isUpcoming = now < start && contest.status !== "FINISHED";

            return (
              <ContestCard
                key={contest.id}
                contest={contest}
                isRegistered={isRegistered}
                isLive={isLive}
                isFinished={isFinished}
                isUpcoming={isUpcoming}
                onRegister={() => handleRegister(contest.id)}
                isRegistering={registeringId === contest.id}
                index={idx}
              />
            );
          })}
        </div>
      ) : (
        <div className="border border-zinc-200 bg-white rounded-2xl p-16 text-center max-w-md mx-auto shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-base font-black text-zinc-900 mb-2">No Contests Found</h3>
          <p className="text-zinc-500 text-xs font-semibold leading-relaxed">
            There are no contests matching this category right now. Check back soon for new competitive arenas!
          </p>
        </div>
      )}
    </div>
  );
}
