"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { 
  Menu, 
  X, 
  Users, 
  Trophy, 
  GraduationCap, 
  LogOut, 
  ArrowRight, 
  User, 
  Compass, 
  Info, 
  Mail,
  Home,
  ChevronDown,
  Palette
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  const dropdownLinks = [
    { name: "Practice Arena", href: "/problems", desc: "Solve algorithmic C++ programming challenges", icon: Compass },
    { name: "Campus Contests", href: "/contests", desc: "Compete in scheduled university duels", icon: Trophy },
    { name: "Leaderboards", href: "/universities", desc: "National standings & solver counts", icon: GraduationCap },
  ];

  const isArenaActive = ["/problems", "/contests", "/universities"].some(p => pathname.startsWith(p));

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md text-zinc-900 transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-16">
        
        {/* Logo + Nav Links */}
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="group text-2xl font-black tracking-tight flex items-center transition-all duration-200"
          >
            <span className="text-rose-600 transition-colors">
              StudyMikey
            </span>
            <span className="text-rose-600 transition-all duration-300 group-hover:scale-150 group-hover:translate-x-0.5 font-black">
              .
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-[11px] font-black uppercase tracking-wider text-zinc-500">
            {/* Guest-only Home Link */}
            {!session && (
              <Link
                href="/"
                className={`relative py-1 flex items-center gap-1.5 transition-colors hover:text-zinc-950 ${
                  pathname === "/" ? "text-zinc-950 font-black" : ""
                }`}
              >
                <Home className="h-3.5 w-3.5" />
                Home
                {pathname === "/" && (
                  <span className="absolute bottom-[-20px] left-0 h-[2.5px] w-full rounded-full bg-rose-600 glow-nav-shadow" />
                )}
              </Link>
            )}

            {/* Dropdown Menu for Dev Arena — using group with invisible bridge */}
            <div className="relative group">
              <button
                className={`relative py-1 flex items-center gap-1.5 transition-colors hover:text-zinc-950 font-black uppercase cursor-pointer ${
                  isArenaActive ? "text-zinc-950" : ""
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                Dev Arena
                <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
                {isArenaActive && (
                  <span className="absolute bottom-[-20px] left-0 h-[2.5px] w-full rounded-full bg-rose-600 glow-nav-shadow" />
                )}
              </button>

              {/* Invisible bridge + Sub-menu panel — top-full ensures no gap */}
              <div className="absolute top-full left-0 pt-3 w-72 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-[0_10px_40px_rgba(0,0,0,0.08)] transform translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
                  <div className="flex flex-col gap-1">
                    {dropdownLinks.map((subLink) => {
                      const SubIcon = subLink.icon;
                      const isSubActive = pathname === subLink.href;
                      return (
                        <Link
                          key={subLink.name}
                          href={subLink.href}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                            isSubActive
                              ? "bg-rose-50 border border-rose-100 text-rose-600"
                              : "hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900"
                          }`}
                        >
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 ${
                            isSubActive ? "border-rose-200 bg-rose-100/50 text-rose-600" : "border-zinc-200 bg-zinc-50 text-zinc-400"
                          }`}>
                            <SubIcon className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="text-[11px] font-black tracking-wide uppercase">{subLink.name}</div>
                            <div className="text-[9px] font-medium text-zinc-500 normal-case leading-normal mt-0.5">{subLink.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Nav Links */}
            {links.map((link) => {
              const isActive = pathname === link.href;
              const LinkIcon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-1 flex items-center gap-1.5 transition-colors hover:text-zinc-950 ${
                    isActive ? "text-zinc-950 font-black" : ""
                  }`}
                >
                  <LinkIcon className={`h-3.5 w-3.5 ${isActive ? "text-rose-600" : "text-zinc-400"}`} />
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-[-20px] left-0 h-[2.5px] w-full rounded-full bg-rose-600 glow-nav-shadow" />
                  )}
                </Link>
              );
            })}

            {/* Recruiter Portal Link */}
            {session?.user?.role === "RECRUITER" && (
              <Link
                href="/recruiter"
                className={`relative py-1 flex items-center gap-1.5 transition-colors hover:text-rose-700 ${
                  pathname === "/recruiter"
                    ? "text-rose-600 font-black"
                    : "text-rose-600/80 font-bold"
                }`}
              >
                <Users className="h-3.5 w-3.5 text-rose-500" />
                Talent Sourcing
                {pathname === "/recruiter" && (
                  <span className="absolute bottom-[-20px] left-0 h-[2.5px] w-full rounded-full bg-rose-600 glow-nav-shadow" />
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === "red" ? "green" : "red")}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:bg-white hover:text-zinc-900 hover:border-zinc-300 transition-all duration-200 cursor-pointer shadow-sm"
            title={`Switch to ${theme === "red" ? "Green" : "Red"} theme`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{theme === "red" ? "Crimson" : "Emerald"}</span>
            <span className={`h-2.5 w-2.5 rounded-full ${theme === "red" ? "bg-rose-500" : "bg-emerald-500"} shadow-sm`} />
          </button>

          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-500 font-bold">
                Hi,{" "}
                <Link
                  href={`/u/${session.user.username}`}
                  className="text-zinc-800 font-extrabold hover:text-rose-600 transition-colors"
                >
                  @{session.user.username}
                </Link>
                <span className="ml-2 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-rose-100 bg-rose-50/50 text-rose-600 shadow-sm">
                  {session.user.role}
                </span>
              </span>

              <button
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 hover:border-zinc-300 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-[11px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-xl bg-rose-700 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white hover:bg-rose-600 active:scale-[0.98] transition-all duration-200 flex items-center gap-1 shadow-sm"
              >
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle Menu */}
        <div className="flex md:hidden items-center gap-3">
          {/* Mobile Theme Switcher */}
          <button
            onClick={() => setTheme(theme === "red" ? "green" : "red")}
            className="flex items-center justify-center h-9 w-9 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-white hover:text-zinc-900 transition-all cursor-pointer"
            title={`Switch to ${theme === "red" ? "Green" : "Red"} theme`}
          >
            <span className={`h-3 w-3 rounded-full ${theme === "red" ? "bg-rose-500" : "bg-emerald-500"} shadow-sm`} />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-zinc-600 hover:text-zinc-950 focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pt-4 pb-6 border-t border-zinc-150 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-wide text-zinc-500">
            {/* Mobile guest-only Home Link */}
            {!session && (
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-zinc-50 hover:text-zinc-950 transition-colors ${
                  pathname === "/" ? "bg-zinc-50 text-zinc-950 font-black border border-zinc-200" : ""
                }`}
              >
                <Home className="h-4 w-4 text-zinc-400" />
                Home
              </Link>
            )}

            {/* Dev Arena Sections */}
            <div className="space-y-1">
              <div className="text-[9px] font-black tracking-widest text-zinc-400 uppercase px-2.5 py-1">Dev Arena</div>
              {dropdownLinks.map((subLink) => {
                const SubIcon = subLink.icon;
                const isSubActive = pathname === subLink.href;
                return (
                  <Link
                    key={subLink.name}
                    href={subLink.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-zinc-50 hover:text-zinc-950 transition-colors ${
                      isSubActive ? "bg-zinc-50 text-zinc-950 font-black border border-zinc-200" : ""
                    }`}
                  >
                    <SubIcon className="h-4 w-4 text-zinc-400" />
                    {subLink.name}
                  </Link>
                );
              })}
            </div>

            {/* Standard Nav Links */}
            {links.map((link) => {
              const isActive = pathname === link.href;
              const LinkIcon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-zinc-50 hover:text-zinc-950 transition-colors ${
                    isActive ? "bg-zinc-50 text-zinc-950 font-black border border-zinc-200" : ""
                  }`}
                >
                  <LinkIcon className={`h-4 w-4 ${isActive ? "text-rose-600" : "text-zinc-400"}`} />
                  {link.name}
                </Link>
              );
            })}

            {session?.user?.role === "RECRUITER" && (
              <Link
                href="/recruiter"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 p-2.5 rounded-xl hover:bg-zinc-50 hover:text-rose-700 transition-colors ${
                  pathname === "/recruiter" ? "bg-rose-50/50 text-rose-700 font-black border border-rose-100" : "text-rose-600/80"
                }`}
              >
                <Users className="h-4 w-4 text-rose-500" />
                Talent Sourcing
              </Link>
            )}

            <div className="border-t border-zinc-150 pt-4 mt-2">
              {session ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-zinc-500 font-bold flex items-center gap-1.5 normal-case">
                      <User className="h-4 w-4 text-zinc-400" />
                      @{session.user.username}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-rose-100 bg-rose-50/50 text-rose-600 shadow-sm">
                      {session.user.role}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/auth/login" });
                    }}
                    className="w-full text-center rounded-xl border border-zinc-200 bg-white py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-950 transition-all font-bold"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl bg-rose-700 text-white hover:bg-rose-600 transition-all font-bold"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
