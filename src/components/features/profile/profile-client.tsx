"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ExternalLink, Code, Award, CheckCircle2, ShieldAlert } from "lucide-react";
import {
  updateProfileAction,
  createProjectAction,
  deleteProjectAction,
  addCertificateAction,
  deleteCertificateAction,
} from "@/lib/actions/profile-actions";

interface ProfileClientProps {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  profile: {
    userId: string;
    bio?: string | null;
    rating?: number;
    maxRating?: number;
    level?: number;
    xp?: number;
    streak?: number;
    skills?: string[] | null;
    resumeUrl?: string | null;
    githubLink?: string | null;
    isOpenToWork?: boolean;
  };
  initialProjects?: any[];
  initialCertificates?: any[];
  isOwnProfile: boolean;
}

export function ProfileClient({
  user,
  profile,
  initialProjects = [],
  initialCertificates = [],
  isOwnProfile,
}: ProfileClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(profile.bio || "");
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [githubLink, setGithubLink] = useState(profile.githubLink || "");
  const [isOpenToWork, setIsOpenToWork] = useState(profile.isOpenToWork || false);
  const [resumeUrl, setResumeUrl] = useState(profile.resumeUrl || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Default fallback showcase projects
  const defaultProjects = [
    {
      id: "fallback-proj-1",
      title: "Distributed Cache System",
      description: "A fast, memory-mapped LRU cache written in C++ with custom socket API structures. Secured with Dockerized VPC limits.",
      repoUrl: "https://github.com/jane-coder/lru-cache",
      demoUrl: "https://demo.studymikey.com/cache",
      technologies: ["C++", "Docker", "Socket.IO", "Redis"],
    },
    {
      id: "fallback-proj-2",
      title: "Next.js Developer Arena",
      description: "Fullstack workspace rendering live scoring pipelines, compiler worker SSE metrics, and candidate resume sourcing.",
      repoUrl: "https://github.com/jane-coder/studymikey",
      demoUrl: null,
      technologies: ["Next.js", "Drizzle ORM", "TailwindCSS"],
    },
  ];

  // Default fallback certificates
  const defaultCertificates = [
    {
      id: "fallback-cert-1",
      name: "AWS Certified Developer - Associate",
      issuingOrg: "Amazon Web Services (AWS)",
      issueDate: "2025-10-12",
      isVerified: true,
    },
    {
      id: "fallback-cert-2",
      name: "University First Place Code Duel Champion",
      issuingOrg: "FAST NUCES Department of Computing",
      issueDate: "2026-03-01",
      isVerified: true,
    },
  ];

  // Projects & Certificates state
  const [projectsList, setProjectsList] = useState<any[]>(
    initialProjects.length > 0 ? initialProjects : defaultProjects
  );
  const [certificatesList, setCertificatesList] = useState<any[]>(
    initialCertificates.length > 0 ? initialCertificates : defaultCertificates
  );

  // Dialog controls
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingCert, setIsAddingCert] = useState(false);

  // Form states
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projRepo, setProjRepo] = useState("");
  const [projDemo, setProjDemo] = useState("");
  const [projTech, setProjTech] = useState("");

  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [reposLoaded, setReposLoaded] = useState(false);

  const handleSyncGithub = async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch("/api/github/repos");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setGithubRepos(data.repos || []);
      setReposLoaded(true);
    } catch (err) {
      console.error(err);
      alert("Failed to synchronize with your GitHub account.");
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleSelectRepo = (repoName: string) => {
    const repo = githubRepos.find((r) => r.name === repoName);
    if (repo) {
      const cleanName = repo.name.replace(/[-_]/g, " ").replace(/\b\w/g, (char: string) => char.toUpperCase());
      setProjTitle(cleanName);
      setProjDesc(repo.description || "");
      setProjRepo(repo.html_url);
      setProjTech(repo.language || "");
    }
  };

  const [certName, setCertName] = useState("");
  const [certOrg, setCertOrg] = useState("");
  const [certDate, setCertDate] = useState("");

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (projectsList.length >= 5) {
      alert("Maximum limit of 5 showcase projects reached.");
      return;
    }

    const techArray = projTech
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const res = await createProjectAction({
      title: projTitle,
      description: projDesc,
      repoUrl: projRepo,
      demoUrl: projDemo,
      technologies: techArray,
    });

    if (res.success && res.project) {
      setProjectsList((prev) => [...prev, res.project]);
      setIsAddingProject(false);
      // Reset
      setProjTitle("");
      setProjDesc("");
      setProjRepo("");
      setProjDemo("");
      setProjTech("");
    } else {
      alert(res.error || "Failed to add project.");
    }
  };

  const handleDeleteProject = async (id: string) => {
    const res = await deleteProjectAction(id);
    if (res.success) {
      setProjectsList((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert(res.error || "Failed to delete project.");
    }
  };

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (certificatesList.length >= 3) {
      alert("Maximum limit of 3 verified certificates reached.");
      return;
    }

    const res = await addCertificateAction({
      name: certName,
      issuingOrg: certOrg,
      issueDate: certDate,
      fileUrl: "https://cloudinary.com/dummy-cert-file.pdf",
    });

    if (res.success && res.certificate) {
      setCertificatesList((prev) => [...prev, res.certificate]);
      setIsAddingCert(false);
      // Reset
      setCertName("");
      setCertOrg("");
      setCertDate("");
    } else {
      alert(res.error || "Failed to add certificate.");
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    const res = await deleteCertificateAction(id);
    if (res.success) {
      setCertificatesList((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert(res.error || "Failed to delete certificate.");
    }
  };

  // Submission Heatmap frequency grids (Emerald Light Mode)
  const heatmapWeeks = Array.from({ length: 24 }, (_, i) =>
    Array.from({ length: 7 }, (_, j) => {
      const val = Math.random();
      if (val > 0.85) return "bg-emerald-500 shadow-sm";
      if (val > 0.6) return "bg-emerald-400/70";
      if (val > 0.4) return "bg-emerald-200/50";
      return "bg-zinc-100";
    })
  );

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (tag: string) => {
    setSkills(skills.filter((s) => s !== tag));
  };

  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMsg("Generating upload signature...");

    try {
      const sigRes = await fetch("/api/upload/signature", { method: "POST" });
      if (!sigRes.ok) throw new Error("Failed to get signature");
      const sigData = await sigRes.json();

      setStatusMsg("Uploading resume to Cloudinary...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", sigData.timestamp.toString());
      formData.append("signature", sigData.signature);
      formData.append("folder", sigData.folder);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/raw/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!cloudRes.ok) throw new Error("Cloudinary upload failed");
      const cloudData = await cloudRes.json();

      setResumeUrl(cloudData.secure_url);
      setStatusMsg("Upload complete!");
    } catch (err: any) {
      console.error(err);
      setStatusMsg("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setStatusMsg("Saving profile changes...");

    try {
      const res = await updateProfileAction({
        bio,
        skills,
        githubLink,
        isOpenToWork,
        resumeUrl,
      });

      if (!res.success) {
        setStatusMsg(res.error || "Failed to update profile.");
      } else {
        setStatusMsg("Profile updated successfully!");
        setIsEditing(false);
        router.refresh();
      }
    } catch (err) {
      setStatusMsg("An error occurred during save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 text-zinc-900 selection:bg-blue-500/10 relative z-10">
      {/* Background Gradients */}
      <div className="absolute inset-0 glow-mesh pointer-events-none -z-10" />
      <div className="absolute inset-0 mesh-grid opacity-[0.4] pointer-events-none -z-10" />

      {/* Header Profile Sheet */}
      <div className="card-premium p-8 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-500/10 uppercase">
            {user.username.substring(0, 2)}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
              @{user.username}
              {isOpenToWork && (
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full animate-pulse">
                  Open to work
                </span>
              )}
            </h1>
            <p className="text-sm font-semibold text-zinc-500 mt-1">{user.email}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-3 flex items-center gap-2">
              System Class:{" "}
              <span className="text-blue-600 font-extrabold">
                {user.role}
              </span>
            </p>
          </div>
        </div>

        {isOwnProfile && (
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setStatusMsg("");
            }}
            className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50 hover:text-zinc-955 hover:border-zinc-300 active:scale-[0.98] transition-all duration-200 cursor-pointer relative z-10"
          >
            {isEditing ? "Cancel Edit" : "Configure Profile"}
          </button>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Sidebars widgets */}
        <div className="space-y-6">
          {/* Competitive Coding Dashboard */}
          <div className="card-premium p-6 rounded-2xl">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Competitor Standings
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                <span className="block text-2xl font-black text-zinc-900">
                  {profile.rating || 1200}
                </span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 block mt-0.5">
                  Rating
                </span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                <span className="block text-2xl font-black text-zinc-900">
                  {profile.maxRating || 1200}
                </span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 block mt-0.5">
                  Peak Rating
                </span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                <span className="block text-2xl font-black text-zinc-900">
                  {profile.level || 1}
                </span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 block mt-0.5">
                  Level
                </span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                <span className="block text-2xl font-black text-zinc-900">
                  {profile.streak || 0}d
                </span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 block mt-0.5">
                  Active Streak
                </span>
              </div>
            </div>
          </div>

          {/* Tagged Skills panel */}
          <div className="card-premium p-6 rounded-2xl">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Verified Stack
            </h2>
            {isEditing ? (
              <div className="space-y-4">
                <form onSubmit={handleAddSkill} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Next.js"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-3 text-xs font-bold hover:bg-blue-500 text-white cursor-pointer"
                  >
                    Add
                  </button>
                </form>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span
                      key={s}
                      onClick={() => handleRemoveSkill(s)}
                      className="rounded-lg bg-zinc-50 border border-zinc-200 px-2.5 py-1 text-xs cursor-pointer hover:border-red-500 hover:text-red-600 transition-colors"
                    >
                      {s} &times;
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-1 text-xs text-blue-700 font-semibold"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-400">No stack tools listed.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Solving Activity Heatmap Grid */}
          <div className="card-premium p-6 rounded-2xl overflow-x-auto">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Submission Heatmap (Solving Frequency)
            </h2>
            <div className="flex gap-1 min-w-[500px]">
              {heatmapWeeks.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-1 flex-1">
                  {week.map((densityClass, dIndex) => (
                    <div
                      key={dIndex}
                      className={`h-3 w-3 rounded-sm transition-all hover:scale-125 ${densityClass}`}
                      title="Submission records matching index activity"
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-400 mt-4 font-semibold px-1">
              <span>Past 6 Months Standings</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <span className="h-2.5 w-2.5 bg-zinc-100 rounded-sm" />
                <span className="h-2.5 w-2.5 bg-emerald-200/50 rounded-sm" />
                <span className="h-2.5 w-2.5 bg-emerald-400/70 rounded-sm" />
                <span className="h-2.5 w-2.5 bg-emerald-500 rounded-sm" />
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Bio Panel */}
          <div className="card-premium p-6 rounded-2xl">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Developer Profile Description
            </h2>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-sm text-zinc-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                placeholder="Describe your technical profile, projects, and programming goals..."
              />
            ) : (
              <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {bio || "No developer profile description provided yet."}
              </p>
            )}
          </div>

          {/* Projects Showcase widget */}
          <div className="card-premium p-6 rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-5">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Code className="h-4.5 w-4.5" />
                Showcase Projects ({projectsList.length}/5)
              </h2>
              {isOwnProfile && (
                <button
                  onClick={() => {
                    setProjTitle("");
                    setProjDesc("");
                    setProjRepo("");
                    setProjDemo("");
                    setProjTech("");
                    setGithubRepos([]);
                    setReposLoaded(false);
                    setIsAddingProject(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 hover:bg-zinc-50 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Project
                </button>
              )}
            </div>

            {projectsList.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {projectsList.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4.5 rounded-xl border border-zinc-200 bg-zinc-50/20 flex flex-col justify-between hover:border-zinc-300 transition-colors relative group"
                  >
                    {isOwnProfile && (
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg border border-zinc-100 bg-white text-zinc-400 hover:text-red-600 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <div>
                      <h3 className="text-xs font-black text-zinc-950 mb-1">{proj.title}</h3>
                      <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold mb-4 line-clamp-3">
                        {proj.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(proj.technologies || []).map((tech: string) => (
                          <span
                            key={tech}
                            className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-400 font-bold text-[8px]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 text-[10px] font-bold">
                      {proj.repoUrl && (
                        <a
                          href={proj.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          Code <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {proj.demoUrl && (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline flex items-center gap-0.5"
                        >
                          Live <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-zinc-400 font-bold">
                No projects added to showcase.
              </div>
            )}
          </div>

          {/* Verified Certificates widget */}
          <div className="card-premium p-6 rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-5">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Award className="h-4.5 w-4.5" />
                Verified Certificates ({certificatesList.length}/3)
              </h2>
              {isOwnProfile && (
                <button
                  onClick={() => setIsAddingCert(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 hover:bg-zinc-50 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Certificate
                </button>
              )}
            </div>

            {certificatesList.length > 0 ? (
              <div className="space-y-3">
                {certificatesList.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/20 flex items-center justify-between relative group hover:border-zinc-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg border border-amber-100 bg-amber-50 flex items-center justify-center text-amber-600">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-zinc-950">{cert.name}</h3>
                        <div className="text-[10px] text-zinc-400 font-bold">
                          Issued by: <span className="text-zinc-600">{cert.issuingOrg}</span> • Issued: <span className="text-zinc-500 font-mono">{cert.issueDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {cert.isVerified && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded border border-emerald-100 bg-emerald-50 text-[9px] font-black uppercase text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      )}
                      {isOwnProfile && (
                        <button
                          onClick={() => handleDeleteCertificate(cert.id)}
                          className="p-1.5 rounded-lg border border-zinc-100 bg-white text-zinc-400 hover:text-red-600 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Delete Certificate"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-zinc-400 font-bold">
                No verified certificates uploaded.
              </div>
            )}
          </div>

          {/* Showcase links */}
          <div className="card-premium p-6 rounded-2xl">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Upload Verified Resume
            </h2>

            {isEditing ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    GitHub Link
                  </label>
                  <input
                    type="text"
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    placeholder="https://github.com/username"
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    Upload Resume Document (PDF)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleUploadResume}
                    className="w-full text-xs text-zinc-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-zinc-200 file:text-xs file:font-semibold file:bg-zinc-50 file:text-zinc-600 file:cursor-pointer hover:file:bg-zinc-100"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="isOpenCheck"
                    checked={isOpenToWork}
                    onChange={(e) => setIsOpenToWork(e.target.checked)}
                    className="rounded border-zinc-200 bg-zinc-50 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isOpenCheck" className="text-xs text-zinc-500 font-bold">
                    Mark Profile Open To work
                  </label>
                </div>

                {statusMsg && (
                  <div className="text-xs font-semibold p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-zinc-500">
                    {statusMsg}
                  </div>
                )}

                <button
                  onClick={handleSaveProfile}
                  disabled={saving || uploading}
                  className="btn-primary px-6 py-3"
                >
                  {saving ? "Saving Changes..." : "Save Developer Assets"}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {githubLink && (
                  <a
                    href={githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center gap-2"
                  >
                    🔗 GitHub Profile Link
                  </a>
                )}

                <a
                  href={`/u/${user.username}/resume`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-5 py-3 flex items-center gap-2"
                >
                  📄 Access Verified Resume
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Project Modal */}
      {isAddingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black text-zinc-950 mb-1 flex items-center gap-1.5">
              <Plus className="h-5 w-5 text-blue-600" />
              Add Project to Showcase
            </h3>
            <p className="text-[10px] text-zinc-400 font-semibold mb-5 uppercase tracking-wide">
              Display a custom repo card with live demonstrations.
            </p>

            {/* Sync from GitHub Section */}
            <div className="mb-5 p-4 rounded-2xl border border-blue-100 bg-blue-50/20 text-xs font-semibold">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="font-bold text-blue-900 block">Import repository details</span>
                  <span className="text-[10px] text-zinc-400">Select any repository to populate title, description, and tags.</span>
                </div>
                {!reposLoaded ? (
                  <button
                    type="button"
                    onClick={handleSyncGithub}
                    disabled={loadingRepos}
                    className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-white hover:bg-blue-500 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loadingRepos ? "Connecting..." : "Sync from GitHub"}
                  </button>
                ) : (
                  <div className="w-full sm:w-auto">
                    <select
                      onChange={(e) => handleSelectRepo(e.target.value)}
                      defaultValue=""
                      className="w-full sm:w-48 rounded-lg border border-zinc-200 bg-white p-2 text-[10px] font-bold text-zinc-700 outline-none focus:border-blue-500 shadow-sm"
                    >
                      <option value="" disabled>Choose Repository...</option>
                      {githubRepos.map((repo) => (
                        <option key={repo.name} value={repo.name}>
                          {repo.name} ({repo.language || "C++"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed KV Store"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    className="input-premium py-2 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Tech Tags (comma separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. C++, Redis, Go"
                    value={projTech}
                    onChange={(e) => setProjTech(e.target.value)}
                    className="input-premium py-2 px-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Project Description</label>
                <textarea
                  required
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Explain LRU eviction structures, memory capacities, or VPC configurations..."
                  className="w-full rounded-xl border border-zinc-200 p-3 h-20 text-zinc-800 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 shadow-sm resize-none"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={projRepo}
                    onChange={(e) => setProjRepo(e.target.value)}
                    className="input-premium py-2 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Live Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://demo.studymikey.com/..."
                    value={projDemo}
                    onChange={(e) => setProjDemo(e.target.value)}
                    className="input-premium py-2 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingProject(false)}
                  className="btn-secondary py-2 px-4 text-xs tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-4 text-xs tracking-wider"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Certificate Modal */}
      {isAddingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black text-zinc-950 mb-1 flex items-center gap-1.5">
              <Plus className="h-5 w-5 text-blue-600" />
              Upload Verified Certificate
            </h3>
            <p className="text-[10px] text-zinc-400 font-semibold mb-5 uppercase tracking-wide">
              Credentials will be queued for administrator verification.
            </p>

            <form onSubmit={handleAddCertificate} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Certificate Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certified Developer"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  className="input-premium py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Issuing Organization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services"
                  value={certOrg}
                  onChange={(e) => setCertOrg(e.target.value)}
                  className="input-premium py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Issue Date</label>
                <input
                  type="date"
                  required
                  value={certDate}
                  onChange={(e) => setCertDate(e.target.value)}
                  className="input-premium py-2 px-3 text-xs text-zinc-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingCert(false)}
                  className="btn-secondary py-2 px-4 text-xs tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-4 text-xs tracking-wider"
                >
                  Submit Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
