"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { ShieldCheck, UserCheck, Code2, Calendar, FileText, CheckCircle2, AlertTriangle, ShieldAlert, Plus, Trash2, Globe, Building } from "lucide-react";
import { verifyUserAction, createProblemAction, createContestAction } from "@/lib/actions/admin-actions";

type AdminTab = "verification" | "problems" | "contests";

export default function AdminPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<AdminTab>("verification");
  
  // Status feedback messages
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 1. Verification Queue State (Simulated roster data)
  const [pendingTeachers, setPendingTeachers] = useState([
    { id: "t-1", name: "Dr. John Carter", email: "j.carter@nu.edu.pk", document: "faculty_id_card.pdf", university: "FAST National University" },
    { id: "t-2", name: "Prof. Amara Cole", email: "cole_amara@nust.edu.pk", document: "nust_prof_credential.pdf", university: "NUST Islamabad" },
  ]);

  const [pendingRecruiters, setPendingRecruiters] = useState([
    { id: "r-1", name: "Sarah Jenkins", company: "Google Cloud Sourcing Ltd.", email: "sarah.jenkins@google.com", domain: "google.com" },
    { id: "r-2", name: "Keith Miller", company: "TechStartup Corp", email: "keith.miller@techstartup.io", domain: "techstartup.io" },
  ]);

  const handleVerify = async (userId: string, role: string, action: "APPROVE" | "REJECT") => {
    setFeedback(null);
    const res = await verifyUserAction(userId, role, action);
    
    if (res.success) {
      setFeedback({ type: "success", text: res.message || "Action processed successfully." });
      
      // Remove verified candidate from local lists
      if (role === "TEACHER") {
        setPendingTeachers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        setPendingRecruiters((prev) => prev.filter((u) => u.id !== userId));
      }
    } else {
      setFeedback({ type: "error", text: res.error || "Action failed." });
    }
  };

  // 2. Problem Creator Form States
  const [probTitle, setProbTitle] = useState("");
  const [probSlug, setProbSlug] = useState("");
  const [probDifficulty, setProbDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [probDesc, setProbDesc] = useState("");
  const [probConstraints, setProbConstraints] = useState("");
  const [probTimeLimit, setProbTimeLimit] = useState(2000);
  const [probMemLimit, setProbMemLimit] = useState(256);
  const [probTemplate, setProbTemplate] = useState(`#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Write your template code\n};`);
  
  const [testCases, setTestCases] = useState<Array<{ inputData: string; expectedOutput: string; isHidden: boolean }>>([
    { inputData: "3 2 4\n6", expectedOutput: "1 2", isHidden: false },
    { inputData: "2 7 11 15\n9", expectedOutput: "0 1", isHidden: true },
  ]);

  const handleAddTestCase = () => {
    setTestCases((prev) => [...prev, { inputData: "", expectedOutput: "", isHidden: true }]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index: number, field: string, value: any) => {
    setTestCases((prev) =>
      prev.map((tc, i) => (i === index ? { ...tc, [field]: value } : tc))
    );
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    const slugValue = probSlug || probTitle.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    const res = await createProblemAction({
      title: probTitle,
      slug: slugValue,
      difficulty: probDifficulty,
      description: probDesc,
      constraints: probConstraints,
      timeLimit: probTimeLimit,
      memoryLimit: probMemLimit,
      templateCodeCpp: probTemplate,
      testCases,
    });

    setSubmitting(false);

    if (res.success) {
      setFeedback({ type: "success", text: res.message || "Problem published!" });
      // Reset
      setProbTitle("");
      setProbSlug("");
      setProbDesc("");
      setProbConstraints("");
      setTestCases([{ inputData: "", expectedOutput: "", isHidden: false }]);
    } else {
      setFeedback({ type: "error", text: res.error || "Failed to create problem." });
    }
  };

  // 3. Contest Scheduler Form States
  const [contestTitle, setContestTitle] = useState("");
  const [contestDesc, setContestDesc] = useState("");
  const [contestStart, setContestStart] = useState("");
  const [contestEnd, setContestEnd] = useState("");
  const [contestDuration, setContestDuration] = useState(120);
  const [contestUnivOnly, setContestUnivOnly] = useState(false);

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    const res = await createContestAction({
      title: contestTitle,
      description: contestDesc,
      startTime: contestStart,
      endTime: contestEnd,
      durationMinutes: contestDuration,
      isUniversityOnly: contestUnivOnly,
    });

    setSubmitting(false);

    if (res.success) {
      setFeedback({ type: "success", text: res.message || "Contest scheduled!" });
      // Reset
      setContestTitle("");
      setContestDesc("");
      setContestStart("");
      setContestEnd("");
      setContestUnivOnly(false);
    } else {
      setFeedback({ type: "error", text: res.error || "Failed to schedule contest." });
    }
  };

  const isAdminOrTeacher = session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER";

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Verification Alert Gate */}
        {!isAdminOrTeacher && (
          <div className="mb-8 p-4.5 rounded-2xl border border-indigo-100 bg-indigo-50/50 text-indigo-800 text-xs font-semibold flex items-center gap-3 shadow-sm">
            <ShieldAlert className="h-5.5 w-5.5 text-indigo-600 flex-shrink-0" />
            <div>
              <span className="font-bold">Administrative Dashboard Preview:</span> You are currently viewing this panel in Developer Preview mode. Form submissions will execute mockup logs and provide mock verification standings.
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-10 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/10">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-950">
              Admin & Creator Workspace
            </h1>
            <p className="text-zinc-500 text-xs font-semibold mt-1">
              Verify credentials, compose online judge tasks, configure coding templates, and manage live contests.
            </p>
          </div>
        </div>

        {/* Global Feedback notification */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-xl border text-xs font-bold flex items-center gap-2.5 shadow-sm ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            {feedback.text}
          </div>
        )}

        {/* Selection Tabs Menu */}
        <div className="flex border-b border-zinc-200 gap-6 mb-8 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => { setActiveTab("verification"); setFeedback(null); }}
            className={`pb-3 relative hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "verification" ? "text-zinc-900" : "text-zinc-400"
            }`}
          >
            <UserCheck className="h-4.5 w-4.5" />
            Verification Queue
            {activeTab === "verification" && (
              <span className="absolute bottom-0 left-0 h-[2.5px] w-full rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab("problems"); setFeedback(null); }}
            className={`pb-3 relative hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "problems" ? "text-zinc-900" : "text-zinc-400"
            }`}
          >
            <Code2 className="h-4.5 w-4.5" />
            Problem Creator
            {activeTab === "problems" && (
              <span className="absolute bottom-0 left-0 h-[2.5px] w-full rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab("contests"); setFeedback(null); }}
            className={`pb-3 relative hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "contests" ? "text-zinc-900" : "text-zinc-400"
            }`}
          >
            <Calendar className="h-4.5 w-4.5" />
            Contest Scheduler
            {activeTab === "contests" && (
              <span className="absolute bottom-0 left-0 h-[2.5px] w-full rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
            )}
          </button>
        </div>

        {/* Tab content bodies */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* TAB 1: Verification Queue */}
          {activeTab === "verification" && (
            <div className="lg:col-span-12 space-y-8">
              {/* Teacher approval queue */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3.5 mb-5 flex items-center gap-2">
                  <Building className="h-4.5 w-4.5 text-blue-600" />
                  Teacher Verification Requests
                </h2>

                {pendingTeachers.length > 0 ? (
                  <div className="divide-y divide-zinc-100">
                    {pendingTeachers.map((teach) => (
                      <div key={teach.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-bold text-zinc-950">{teach.name}</div>
                          <div className="text-[11px] text-zinc-400 font-semibold">{teach.email} • {teach.university}</div>
                          <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600">
                            <FileText className="h-3.5 w-3.5" />
                            Document: {teach.document} (Faculty Credentials PDF)
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerify(teach.id, "TEACHER", "APPROVE")}
                            className="btn-primary py-2 px-4 text-xs font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerify(teach.id, "TEACHER", "REJECT")}
                            className="btn-secondary py-2 px-4 text-xs font-bold text-zinc-500 hover:text-red-600 hover:border-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-zinc-400 text-xs font-bold">
                    No pending teacher verification requests.
                  </div>
                )}
              </div>

              {/* Recruiter approval queue */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3.5 mb-5 flex items-center gap-2">
                  <Globe className="h-4.5 w-4.5 text-blue-600" />
                  Recruiter Verification Requests
                </h2>

                {pendingRecruiters.length > 0 ? (
                  <div className="divide-y divide-zinc-100">
                    {pendingRecruiters.map((rec) => (
                      <div key={rec.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-bold text-zinc-950">{rec.name}</div>
                          <div className="text-[11px] text-zinc-400 font-semibold">{rec.company} • {rec.email}</div>
                          <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                            domain: verified @{rec.domain} via DNS TXT record check
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerify(rec.id, "RECRUITER", "APPROVE")}
                            className="btn-primary py-2 px-4 text-xs font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerify(rec.id, "RECRUITER", "REJECT")}
                            className="btn-secondary py-2 px-4 text-xs font-bold text-zinc-500 hover:text-red-600 hover:border-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-zinc-400 text-xs font-bold">
                    No pending recruiter verification requests.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Coding Problem Creator */}
          {activeTab === "problems" && (
            <div className="lg:col-span-12">
              <form onSubmit={handleCreateProblem} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6">
                <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3.5 mb-2 flex items-center gap-2">
                  <Code2 className="h-4.5 w-4.5 text-blue-600" />
                  Define DSA Coding Problem
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Problem Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Reverse Linked List"
                      value={probTitle}
                      onChange={(e) => setProbTitle(e.target.value)}
                      className="input-premium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">URL Slug (leave blank to auto-generate)</label>
                    <input
                      type="text"
                      placeholder="e.g. reverse-linked-list"
                      value={probSlug}
                      onChange={(e) => setProbSlug(e.target.value)}
                      className="input-premium"
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Difficulty</label>
                    <select
                      value={probDifficulty}
                      onChange={(e) => setProbDifficulty(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-sm text-zinc-800 outline-none focus:border-blue-500 transition-colors shadow-sm"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Time Limit (ms)</label>
                    <input
                      type="number"
                      required
                      value={probTimeLimit}
                      onChange={(e) => setProbTimeLimit(parseInt(e.target.value))}
                      className="input-premium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Memory Limit (MB)</label>
                    <input
                      type="number"
                      required
                      value={probMemLimit}
                      onChange={(e) => setProbMemLimit(parseInt(e.target.value))}
                      className="input-premium"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Problem Description (Markdown)</label>
                    <textarea
                      required
                      rows={8}
                      placeholder="Describe the task, inputs, and expected outcomes..."
                      value={probDesc}
                      onChange={(e) => setProbDesc(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-xs text-zinc-900 outline-none focus:border-blue-500 focus:bg-white resize-none shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Constraints</label>
                    <textarea
                      rows={8}
                      placeholder="e.g. 1 <= nums.length <= 10^5..."
                      value={probConstraints}
                      onChange={(e) => setProbConstraints(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-xs text-zinc-900 outline-none focus:border-blue-500 focus:bg-white resize-none shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">C++ Code Template</label>
                  <textarea
                    required
                    rows={6}
                    value={probTemplate}
                    onChange={(e) => setProbTemplate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 font-mono text-xs text-zinc-900 outline-none focus:border-blue-500 focus:bg-white resize-none shadow-sm"
                  />
                </div>

                {/* Test Cases Panel */}
                <div className="border-t border-zinc-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-zinc-950 uppercase tracking-wider">
                      Validation Test Cases
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddTestCase}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:bg-zinc-50"
                    >
                      <Plus className="h-3.5 w-3.5 text-zinc-500" /> Add Case
                    </button>
                  </div>

                  <div className="space-y-4">
                    {testCases.map((tc, index) => (
                      <div key={index} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/30 flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 min-w-0">
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Input Data</label>
                          <textarea
                            required
                            rows={1}
                            value={tc.inputData}
                            onChange={(e) => handleTestCaseChange(index, "inputData", e.target.value)}
                            placeholder="e.g. 5\n1 2 3 4 5"
                            className="w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs font-mono text-zinc-900 focus:outline-none focus:border-blue-500 resize-none"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Expected Output</label>
                          <textarea
                            required
                            rows={1}
                            value={tc.expectedOutput}
                            onChange={(e) => handleTestCaseChange(index, "expectedOutput", e.target.value)}
                            placeholder="e.g. 5 4 3 2 1"
                            className="w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs font-mono text-zinc-900 focus:outline-none focus:border-blue-500 resize-none"
                          />
                        </div>

                        <div className="flex items-center gap-4 mb-2">
                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-zinc-500">
                            <input
                              type="checkbox"
                              checked={tc.isHidden}
                              onChange={(e) => handleTestCaseChange(index, "isHidden", e.target.checked)}
                              className="rounded border-zinc-200 text-blue-600 focus:ring-blue-500"
                            />
                            <span>Hidden</span>
                          </label>

                          <button
                            type="button"
                            disabled={testCases.length <= 1}
                            onClick={() => handleRemoveTestCase(index)}
                            className="p-2 rounded border border-zinc-200 bg-white text-zinc-400 hover:text-red-600 hover:border-red-200 disabled:opacity-50"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-zinc-100 pt-5">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary px-8 py-3.5 text-xs font-bold uppercase tracking-widest"
                  >
                    {submitting ? "Publishing problem..." : "Publish Judge Problem"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Contest Scheduler */}
          {activeTab === "contests" && (
            <div className="lg:col-span-12">
              <form onSubmit={handleCreateContest} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6">
                <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3.5 mb-2 flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-blue-600" />
                  Schedule Live Coding Contest
                </h2>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Contest Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weekly Challenge #43"
                    value={contestTitle}
                    onChange={(e) => setContestTitle(e.target.value)}
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Contest Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide overview details, prizes, or rules..."
                    value={contestDesc}
                    onChange={(e) => setContestDesc(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-xs text-zinc-900 outline-none focus:border-blue-500 focus:bg-white resize-none shadow-sm"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={contestStart}
                      onChange={(e) => setContestStart(e.target.value)}
                      className="input-premium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">End Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={contestEnd}
                      onChange={(e) => setContestEnd(e.target.value)}
                      className="input-premium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      required
                      value={contestDuration}
                      onChange={(e) => setContestDuration(parseInt(e.target.value))}
                      className="input-premium"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-600">
                    <input
                      type="checkbox"
                      checked={contestUnivOnly}
                      onChange={(e) => setContestUnivOnly(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Make this contest University-Only</span>
                  </label>
                </div>

                <div className="border-t border-zinc-100 pt-5">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary px-8 py-3.5 text-xs font-bold uppercase tracking-widest"
                  >
                    {submitting ? "Scheduling..." : "Schedule Live Contest"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
