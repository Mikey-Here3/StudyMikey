import React from "react";
import Link from "next/link";
import { Terminal, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-rose-950/80 to-zinc-950 text-zinc-400 border-t border-rose-900/15 pt-16 pb-12 px-6 relative z-10 font-sans transition-all duration-300">
      <div className="max-w-7xl mx-auto grid gap-10 md:grid-cols-2 lg:grid-cols-6 mb-12">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-5">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-900/30">
              <Terminal className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white flex items-center">
              StudyMikey<span className="text-rose-600">.</span>
            </span>
          </Link>
          <p className="text-[11px] text-zinc-500 font-semibold max-w-xs leading-relaxed uppercase tracking-wider">
            Automated evaluation platforms, sandboxed code execution, and verified candidate talent matching.
          </p>
          <div className="flex items-center gap-3.5 pt-2">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 hover:text-white border border-zinc-850 flex items-center justify-center transition-all" aria-label="GitHub">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 hover:text-white border border-zinc-850 flex items-center justify-center transition-all" aria-label="Twitter / X">
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 hover:text-white border border-zinc-850 flex items-center justify-center transition-all" aria-label="LinkedIn">
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4.5">Platform</h4>
          <ul className="space-y-2.5 text-xs font-bold text-zinc-500">
            <li><Link href="/problems" className="hover:text-white transition-colors">Practice Arena</Link></li>
            <li><Link href="/contests" className="hover:text-white transition-colors">Coding Contests</Link></li>
            <li><Link href="/universities" className="hover:text-white transition-colors">University Ranks</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4.5">Sourcing</h4>
          <ul className="space-y-2.5 text-xs font-bold text-zinc-500">
            <li><Link href="/recruiter" className="hover:text-white transition-colors">Recruiter Portal</Link></li>
            <li><Link href="/admin" className="hover:text-white transition-colors">Verification Queue</Link></li>
            <li><Link href="/auth/signup?role=RECRUITER" className="hover:text-white transition-colors">Partner Sign Up</Link></li>
          </ul>
        </div>

        {/* Links Column 3 */}
        <div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4.5">Support</h4>
          <ul className="space-y-2.5 text-xs font-bold text-zinc-500">
            <li><Link href="/admin" className="hover:text-white transition-colors">Contest Admin</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Newsletter Signup Column */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Newsletter</h4>
          <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">Get updates on new coding tournaments and platform releases.</p>
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl p-1 focus-within:border-rose-700 transition-all">
            <input 
              type="email" 
              placeholder="you@domain.com" 
              className="w-full bg-transparent border-none outline-none text-xs text-white px-2 py-1 placeholder-zinc-600 font-semibold"
            />
            <button className="h-7 w-7 rounded-lg bg-rose-700 hover:bg-rose-600 text-white flex items-center justify-center transition-all cursor-pointer" aria-label="Subscribe">
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto border-t border-zinc-900 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] font-semibold text-zinc-600">
        <div>
          &copy; {new Date().getFullYear()} StudyMikey Inc. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
