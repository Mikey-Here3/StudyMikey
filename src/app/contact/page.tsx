"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, Building2, HelpCircle, CheckCircle, Send, MapPin } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("GENERAL");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contacts = [
    {
      title: "Technical Support",
      description: "For questions about compilers, problem sandboxes, or user profiles.",
      email: "support@studymikey.com",
      icon: HelpCircle,
    },
    {
      title: "Academic Partnerships",
      description: "Host university-exclusive contests or set up department scoreboards.",
      email: "campus@studymikey.com",
      icon: Building2,
    },
    {
      title: "Recruiter Sourcing",
      description: "For corporate subscriptions, sourcing filters, or developer outreach packages.",
      email: "sales@studymikey.com",
      icon: Mail,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-rose-500/10 relative overflow-hidden py-16 px-4 sm:px-6 animate-fade-in-up">
      {/* Background decoration */}
      <div className="absolute inset-0 glow-mesh pointer-events-none z-0" />
      <div className="absolute inset-0 mesh-grid opacity-[0.35] pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto relative z-10 grid gap-12 lg:grid-cols-12 items-stretch animate-fade-in-up">
        
        {/* Left column: Contact info (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
          
          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tight text-zinc-950 animate-fade-in-up">
              Contact Us
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 font-semibold leading-relaxed">
              Have questions about competitive leagues, custom compilers, or recruiter accounts? Get in touch with our team.
            </p>
          </div>

          {/* Contact options */}
          <div className="space-y-4">
            {contacts.map((ch) => {
              const Icon = ch.icon;
              return (
                <div 
                  key={ch.title} 
                  className="bg-white border border-zinc-200 p-5 rounded-3xl shadow-sm hover:border-zinc-300 hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="h-8 w-8 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-center mb-3 shadow-sm transform group-hover:scale-105 transition-transform text-zinc-700">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-xs font-black text-zinc-950">{ch.title}</h3>
                  <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed mt-1">{ch.description}</p>
                  <a 
                    href={`mailto:${ch.email}`} 
                    className="text-[10px] font-black text-rose-600 hover:text-rose-500 uppercase tracking-widest mt-3 inline-block group-hover:underline"
                  >
                    {ch.email}
                  </a>
                </div>
              );
            })}
          </div>

          {/* Physical Address */}
          <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-3xl flex items-start gap-4 shadow-sm">
            <div className="h-9 w-9 rounded-xl bg-zinc-200/50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-[9px] font-black text-zinc-950 uppercase tracking-widest">Workspace Office</h4>
              <p className="text-[11px] text-zinc-500 font-semibold mt-0.5 leading-relaxed font-sans">
                National Software Technology Park, Sector I-9, Islamabad, Pakistan
              </p>
            </div>
          </div>

        </div>

        {/* Right column: Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-zinc-300 transition-colors backdrop-blur-md animate-fade-in-up">
          
          {submitted && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-200">
              <CheckCircle className="h-10 w-10 text-rose-600 mb-4 animate-bounce" />
              <h3 className="text-base font-black text-zinc-950">Message Sent</h3>
              <p className="text-xs text-zinc-500 font-semibold max-w-sm mt-1.5 leading-relaxed">
                Thank you for contacting us. We will follow up directly on your email address shortly.
              </p>
            </div>
          )}

          <div>
            <h2 className="text-xs font-black text-zinc-950 uppercase tracking-widest border-b border-zinc-150 pb-4 mb-6 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-zinc-400" />
              Send a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-450 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ashan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-white/85 p-3 text-xs text-zinc-900 placeholder-zinc-450 outline-none transition-all duration-300 focus:border-rose-500 focus:bg-white focus:-translate-y-[1px] focus:shadow-md focus:ring-4 focus:ring-rose-500/5 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-450 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-white/85 p-3 text-xs text-zinc-900 placeholder-zinc-450 outline-none transition-all duration-300 focus:border-rose-500 focus:bg-white focus:-translate-y-[1px] focus:shadow-md focus:ring-4 focus:ring-rose-500/5 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-450 mb-1.5">Department</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-xs font-bold text-zinc-700 outline-none focus:border-rose-500 transition-colors shadow-sm cursor-pointer"
                >
                  <option value="GENERAL" className="bg-white text-zinc-700">General Support</option>
                  <option value="SUPPORT" className="bg-white text-zinc-700">Technical Compiler Inquiries</option>
                  <option value="CAMPUS" className="bg-white text-zinc-700">University Integration</option>
                  <option value="SALES" className="bg-white text-zinc-700">Recruiter Sourcing Packages</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-450 mb-1.5">Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain your campus integration details or recruiter dashboard requirements..."
                  className="w-full rounded-xl border border-zinc-200 bg-white/85 p-3.5 h-32 text-zinc-900 text-xs font-semibold outline-none focus:border-rose-500 focus:bg-white focus:-translate-y-[1px] focus:shadow-md focus:ring-4 focus:ring-rose-500/5 shadow-inner resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full btn-primary py-3.5 px-6 text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98]"
                >
                  <Send className="h-4 w-4" />
                  Submit Message
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
