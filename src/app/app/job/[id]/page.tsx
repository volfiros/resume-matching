"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { Navbar } from "@/components/Navbar";

type ScreeningResult = {
  resumeName: string;
  candidateName?: string;
  matchScore: number;
  confidence: number;
  recommendation: string;
  requiresHuman: boolean;
  reasoning: string;
  resumeBase64?: string;
};

type JobData = {
  title: string;
  description: string;
  results: ScreeningResult[];
};

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value * 100}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

function RecommendationIcon({ rec }: { rec: string }) {
  if (rec === "Proceed to interview") return <CheckCircle size={14} className="text-emerald-400" />;
  if (rec === "Reject") return <XCircle size={14} className="text-red-400" />;
  return <AlertTriangle size={14} className="text-amber-400" />;
}

function scoreColor(score: number) {
  if (score >= 0.7) return "#34d399";
  if (score >= 0.4) return "#fbbf24";
  return "#f87171";
}

function ResultCard({ result, index }: { result: ScreeningResult; index: number }) {
  const matchPct = Math.round(result.matchScore * 100);
  const confPct = Math.round(result.confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <p className="text-xs text-white/30 mb-1 font-mono">resume {String(index + 1).padStart(2, "0")}</p>
          <h3 className="text-sm font-medium text-white truncate">
            {result.candidateName || result.resumeName}
          </h3>
          {result.candidateName && (
            <p className="text-xs text-white/25 font-mono truncate mt-0.5">{result.resumeName}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
          <RecommendationIcon rec={result.recommendation} />
          <span className="text-xs text-white/70">{result.recommendation}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/30">Match</span>
            <span className="text-sm font-semibold" style={{ color: scoreColor(result.matchScore) }}>
              {matchPct}%
            </span>
          </div>
          <ScoreBar value={result.matchScore} color={scoreColor(result.matchScore)} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/30">Confidence</span>
            <span className="text-sm font-semibold text-[#818cf8]">{confPct}%</span>
          </div>
          <ScoreBar value={result.confidence} color="#818cf8" />
        </div>
      </div>

      <p className="text-[13px] leading-relaxed text-white/40">{result.reasoning}</p>

      <div className="mt-4 flex items-center gap-2">
        {result.resumeBase64 && (
          <button
            onClick={() => {
              const [header, data] = result.resumeBase64!.split(",");
              const mime = header.match(/:(.*?);/)?.[1] ?? "application/pdf";
              const binary = atob(data);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
              window.open(url, "_blank");
            }}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-white/40 hover:text-white/70 hover:border-white/[0.12] transition-all"
          >
            <FileText size={11} />
            View resume
          </button>
        )}
        {result.requiresHuman && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-3 py-1.5">
            <Clock size={12} className="text-amber-400 shrink-0" />
            <span className="text-xs text-amber-400/80">Human review recommended</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function JobResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [jobData, setJobData] = useState<JobData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`sift-job-${id}`);
    if (!raw) { router.push("/app"); return; }
    setJobData(JSON.parse(raw));
  }, [id, router]);

  if (!jobData) return null;

  const sorted = [...jobData.results].sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar variant="app" />

      <main className="mx-auto max-w-5xl px-6 pt-28 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push("/app")}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-6"
          >
            <ArrowLeft size={13} />
            New screening
          </button>
          <p className="text-xs text-white/25 mb-1 font-mono">results</p>
          <h1 className="text-2xl font-semibold text-white">{jobData.title}</h1>
          <p className="mt-1 text-sm text-white/30">
            {jobData.results.length} candidate{jobData.results.length !== 1 ? "s" : ""} screened
            {" · "}
            {jobData.results.filter((r) => r.recommendation === "Proceed to interview").length} recommended
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sorted.map((result, i) => (
            <ResultCard key={result.resumeName} result={result} index={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
