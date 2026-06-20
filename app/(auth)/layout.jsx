import Link from "next/link";

export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "var(--bg-primary)",
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(255,0,64,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(108,99,255,0.08) 0%, transparent 50%)",
      }}
    >
      {/* Auth Navbar */}
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm gradient-bg"
          >
            V
          </div>
          <span className="font-bold text-lg gradient-text" style={{ fontFamily: "Outfit, sans-serif" }}>
            VideoStream
          </span>
        </Link>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
