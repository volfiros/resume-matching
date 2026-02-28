"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const features = [
  {
    icon: Zap,
    title: "Multi-agent pipeline",
    description: "LangGraph-powered graph of specialized AI agents that analyze skills, requirements, and fit in parallel.",
  },
  {
    icon: BarChart3,
    title: "Structured scoring",
    description: "Match score, confidence level, and reasoning — not just a number, but a clear breakdown of why.",
  },
  {
    icon: Shield,
    title: "Human-in-the-loop",
    description: "Borderline matches are automatically flagged for human review so nothing slips through.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Navbar variant="landing" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4d65ff]" />
            Powered by Gemini 2.5 Flash + LangGraph
          </div>

          <h1 className="text-5xl sm:text-7xl mb-6 leading-none">
            <span className="sift-logo bg-gradient-to-r from-[#4d65ff] via-[#818cf8] to-[#a78bfa] bg-clip-text text-transparent">
              SIFT
            </span>
            <br />
            <span className="font-bold tracking-tight text-white/90">through every resume.</span>
          </h1>

          <p className="text-lg text-white/40 max-w-xl mx-auto mb-10 leading-relaxed">
            Upload a job description and one or more resumes. Get structured match scores, confidence levels, and hiring recommendations — instantly.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#4d65ff] hover:bg-[#6b83ff] text-white text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              Start screening
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/[0.08] hover:border-white/20 text-white/60 hover:text-white text-sm transition-all duration-200"
            >
              Sign in
            </Link>
          </div>
        </motion.div>

        <motion.div
          id="features"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-28 max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-left"
            >
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#4d65ff]/10">
                <f.icon size={16} className="text-[#4d65ff]" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-white">{f.title}</h3>
              <p className="text-[13px] leading-relaxed text-white/40">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <footer className="border-t border-white/[0.06] px-6 py-6 text-center">
        <p className="text-xs text-white/20">© 2026 SIFT. All rights reserved.</p>
      </footer>
    </div>
  );
}
