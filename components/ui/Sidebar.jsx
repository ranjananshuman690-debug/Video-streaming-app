"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  TrendingUp,
  Clock,
  Heart,
  Upload,
  User,
  Compass,
  ChevronRight,
} from "lucide-react";

const mainLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/trending", label: "Trending", icon: TrendingUp },
  { href: "/explore", label: "Explore", icon: Compass },
];

const accountLinks = [
  { href: "/history", label: "History", icon: Clock, auth: true },
  { href: "/liked", label: "Liked Videos", icon: Heart, auth: true },
  { href: "/upload", label: "Upload", icon: Upload, auth: true },
];

export default function Sidebar({ open }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  function NavItem({ href, label, icon: Icon }) {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative"
        style={{
          background: isActive ? "rgba(255,0,64,0.12)" : "transparent",
          color: isActive ? "var(--brand-red)" : "var(--text-secondary)",
        }}
        title={!open ? label : undefined}
      >
        <Icon
          size={20}
          className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ color: isActive ? "var(--brand-red)" : "inherit" }}
        />
        {open && (
          <span className="text-sm font-medium truncate animate-fade-in">
            {label}
          </span>
        )}
        {isActive && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
            style={{ background: "var(--brand-red)" }}
          />
        )}
      </Link>
    );
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-300 overflow-hidden"
      style={{
        width: open ? "var(--sidebar-width)" : "var(--sidebar-collapsed)",
        paddingTop: "var(--navbar-height)",
        background: "var(--bg-primary)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto overflow-x-hidden">
        {/* Main Navigation */}
        <div className="mb-2">
          {open && (
            <p
              className="px-3 text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Menu
            </p>
          )}
          {mainLinks.map((link) => (
            <NavItem key={link.href} {...link} />
          ))}
        </div>

        <div
          className="my-2"
          style={{ height: "1px", background: "var(--border-subtle)" }}
        />

        {/* Account Links */}
        <div>
          {open && (
            <p
              className="px-3 text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              You
            </p>
          )}
          {accountLinks.map((link) => {
            if (link.auth && !session) return null;
            return <NavItem key={link.href} {...link} />;
          })}
          {session && (
            <NavItem
              href={`/channel/${session.user.id}`}
              label="My Channel"
              icon={User}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      {open && (
        <div
          className="px-4 py-3 text-xs animate-fade-in"
          style={{
            color: "var(--text-muted)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <p>© 2024 VideoStream</p>
          <p className="mt-0.5">All rights reserved</p>
        </div>
      )}
    </aside>
  );
}
