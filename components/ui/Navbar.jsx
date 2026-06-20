"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Upload, Bell, Menu, LogOut, User, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function Navbar({ onMenuClick }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-4 sm:px-6"
      style={{
        height: "var(--navbar-height)",
        background: "rgba(15,15,15,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Left — Logo + Menu */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          id="navbar-menu-btn"
          onClick={onMenuClick}
          className="btn-ghost p-2 rounded-lg"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm gradient-bg"
            style={{ boxShadow: "0 4px 12px rgba(255,0,64,0.3)" }}
          >
            V
          </div>
          <span
            className="font-bold text-lg hidden sm:block gradient-text"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            VideoStream
          </span>
        </Link>
      </div>

      {/* Center — Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            id="navbar-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos..."
            className="input-field pl-10 pr-4 py-2 text-sm rounded-full"
            style={{ background: "var(--bg-surface)" }}
          />
        </div>
      </form>

      {/* Right — Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {session ? (
          <>
            <Link
              href="/upload"
              id="navbar-upload-btn"
              className="btn-primary hidden sm:inline-flex py-2 px-4 text-xs"
            >
              <Upload size={14} />
              Upload
            </Link>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                id="navbar-user-btn"
                onClick={() => setMenuOpen((p) => !p)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full transition-all duration-200"
                style={{
                  background: menuOpen ? "var(--bg-surface)" : "transparent",
                  border: "1px solid",
                  borderColor: menuOpen ? "var(--border-brand)" : "var(--border-subtle)",
                }}
              >
                <div className="avatar w-7 h-7 text-sm">
                  {session.user.image ? (
                    <Image src={session.user.image} alt={session.user.name} width={28} height={28} className="rounded-full" />
                  ) : (
                    session.user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:block max-w-[80px] truncate">
                  {session.user.name}
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    color: "var(--text-muted)",
                    transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl py-1.5 animate-scale-in"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-normal)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                    top: "100%",
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="px-3 py-2 mb-1" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <p className="text-sm font-semibold truncate">{session.user.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {session.user.email}
                    </p>
                  </div>
                  <Link
                    href={`/channel/${session.user.id}`}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-white hover:bg-opacity-5"
                  >
                    <User size={15} style={{ color: "var(--text-muted)" }} />
                    My Channel
                  </Link>
                  <Link
                    href="/upload"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-white hover:bg-opacity-5 sm:hidden"
                  >
                    <Upload size={15} style={{ color: "var(--text-muted)" }} />
                    Upload Video
                  </Link>
                  <button
                    id="navbar-logout-btn"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm w-full transition-colors hover:bg-white hover:bg-opacity-5"
                    style={{ color: "var(--brand-red)" }}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-sm">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary py-2 px-4 text-xs">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
