"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, Key } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";

type NavbarVariant = "landing" | "app";

interface NavbarProps {
  variant?: NavbarVariant;
  onApiKeyClick?: () => void;
}

export function Navbar({ variant = "landing", onApiKeyClick }: NavbarProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-3xl"
      >
        <div
          className="flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300"
          style={{
            background: scrolled
              ? "rgba(10, 10, 10, 0.85)"
              : "rgba(10, 10, 10, 0.5)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: scrolled
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(255,255,255,0.06)",
            boxShadow: scrolled
              ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"
              : "none",
          }}
        >
          <Link href={variant === "app" ? "/app" : "/"}>
            <span className="sift-logo text-base bg-gradient-to-r from-[#4d65ff] to-[#a78bfa] bg-clip-text text-transparent">
              SIFT
            </span>
          </Link>

          {variant === "landing" && (
            <div className="hidden sm:flex items-center gap-6">
              <Link
                href="#features"
                className="text-xs text-white/40 hover:text-white/80 transition-colors"
              >
                features
              </Link>
              <Link
                href="#how-it-works"
                className="text-xs text-white/40 hover:text-white/80 transition-colors"
              >
                how it works
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2">
            {variant === "app" ? (
              <>
                {onApiKeyClick && (
                  <button
                    onClick={onApiKeyClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
                  >
                    <Key size={11} />
                    API key
                  </button>
                )}
                <button
                  onClick={() => router.push("/app/settings")}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all"
                >
                  <Settings size={14} />
                </button>
                <div className="mx-1 h-4 w-px bg-white/[0.08]" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
                >
                  <LogOut size={11} />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-4 py-1.5 text-xs text-white/50 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-1.5 text-xs rounded-lg bg-[#4d65ff] hover:bg-[#6b83ff] text-white font-medium transition-all duration-200"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
