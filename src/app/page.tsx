"use client";

import React, { useRef, useState } from "react";
import { ScreeningResult } from "@/lib/types";

type MatchResponse = ScreeningResult;

function getQualitativeScore(value: number | undefined): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (value === undefined)
    return {
      label: "Unknown",
      color: "text-slate-400",
      bgColor: "bg-slate-500/10",
    };
  if (value >= 0.8)
    return {
      label: "Excellent",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    };
  if (value >= 0.6)
    return { label: "Good", color: "text-blue-400", bgColor: "bg-blue-500/10" };
  if (value >= 0.4)
    return {
      label: "Moderate",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    };
  if (value >= 0.2)
    return {
      label: "Low",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    };
  return { label: "Poor", color: "text-red-400", bgColor: "bg-red-500/10" };
}

function getRecommendationStyle(recommendation: string): {
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  const lower = recommendation.toLowerCase();
  if (lower.includes("proceed") || lower.includes("interview")) {
    return {
      icon: "✓",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
    };
  }
  if (lower.includes("manual") || lower.includes("review")) {
    return {
      icon: "⚠",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
    };
  }
  return {
    icon: "✗",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  };
}

function MatchResult({ data }: { data: MatchResponse }): React.ReactElement {
  const matchScore = getQualitativeScore(data.match_score);
  const confidence = getQualitativeScore(data.confidence);
  const recommendation = getRecommendationStyle(data.recommendation);
  const isManualReview =
    recommendation.color === "text-amber-400" ||
    data.recommendation.toLowerCase().includes("manual") ||
    data.recommendation.toLowerCase().includes("review");

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 md:p-8 slide-up">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-400/30 flex items-center justify-center shimmer">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold text-white">
          Match Results
        </h3>
      </div>

      {!isManualReview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="glass-card rounded-xl p-4 sm:p-6 scale-in card-hover">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Match Score
              </span>
              <div
                className={`w-2 h-2 rounded-full ${matchScore.bgColor}`}
              ></div>
            </div>
            <div
              className={`text-2xl sm:text-3xl font-semibold ${matchScore.color} mb-2`}
            >
              {matchScore.label}
            </div>
            <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full ${matchScore.bgColor} progress-animate`}
                style={{ width: `${(data.match_score ?? 0) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {data.match_score?.toFixed(2) ?? "N/A"}/1.00
            </div>
          </div>

          <div
            className="glass-card rounded-xl p-4 sm:p-6 scale-in card-hover"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Confidence
              </span>
              <div
                className={`w-2 h-2 rounded-full ${confidence.bgColor}`}
              ></div>
            </div>
            <div
              className={`text-2xl sm:text-3xl font-semibold ${confidence.color} mb-2`}
            >
              {confidence.label}
            </div>
            <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full ${confidence.bgColor} progress-animate`}
                style={{
                  width: `${(data.confidence ?? 0) * 100}%`,
                  animationDelay: "0.1s",
                }}
              ></div>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {data.confidence?.toFixed(2) ?? "N/A"}/1.00
            </div>
          </div>
        </div>
      )}

      <div
        className={`${recommendation.bgColor} border ${recommendation.borderColor} rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 slide-in-right`}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={`text-xl sm:text-2xl ${recommendation.color}`}>
            {recommendation.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">
              Recommendation
            </h4>
            <p
              className={`text-base sm:text-lg font-semibold ${recommendation.color} mb-2 break-words`}
            >
              {data.recommendation}
            </p>
            {data.requires_human && (
              <div className="flex items-center gap-2 mt-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-subtle"></div>
                <span className="text-xs sm:text-sm text-amber-400 font-medium">
                  Human review required
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="glass-card rounded-xl p-4 sm:p-6 fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h4 className="text-xs text-indigo-300 font-medium uppercase tracking-wider">
            Detailed Analysis
          </h4>
        </div>
        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-xs sm:text-sm break-words">
          {data.reasoning_summary}
        </div>
      </div>
    </div>
  );
}

const staticParticlesData = [
  { id: 0, width: 5, height: 4, left: 7, duration: 30, delay: 0 },
  { id: 1, width: 4, height: 3, left: 20, duration: 32, delay: 1 },
  { id: 2, width: 3, height: 6, left: 33, duration: 19, delay: 2 },
  { id: 3, width: 2, height: 3, left: 46, duration: 20, delay: 3 },
  { id: 4, width: 2, height: 6, left: 59, duration: 15, delay: 4 },
  { id: 5, width: 2, height: 2, left: 72, duration: 31, delay: 0 },
  { id: 6, width: 5, height: 7, left: 85, duration: 26, delay: 1 },
  { id: 7, width: 5, height: 3, left: 98, duration: 28, delay: 2 },
  { id: 8, width: 3, height: 3, left: 11, duration: 19, delay: 3 },
  { id: 9, width: 4, height: 5, left: 24, duration: 24, delay: 4 },
  { id: 10, width: 6, height: 6, left: 37, duration: 24, delay: 0 },
  { id: 11, width: 3, height: 7, left: 50, duration: 27, delay: 1 },
  { id: 12, width: 5, height: 5, left: 63, duration: 17, delay: 2 },
  { id: 13, width: 4, height: 4, left: 76, duration: 34, delay: 3 },
  { id: 14, width: 6, height: 7, left: 89, duration: 22, delay: 4 },
];

function FloatingParticles() {
  return (
    <div className="particles">
      {staticParticlesData.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            left: `${particle.left}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function BubbleAnimation() {
  const bubbles = [
    { id: 1, size: 80, left: 10, duration: 8, delay: 0, drift: "50px" },
    { id: 2, size: 120, left: 25, duration: 10, delay: 2, drift: "-70px" },
    { id: 3, size: 60, left: 40, duration: 7, delay: 4, drift: "30px" },
    { id: 4, size: 100, left: 55, duration: 9, delay: 1, drift: "-50px" },
    { id: 5, size: 70, left: 70, duration: 8, delay: 3, drift: "60px" },
    { id: 6, size: 90, left: 85, duration: 11, delay: 5, drift: "-40px" },
    { id: 7, size: 110, left: 15, duration: 9, delay: 6, drift: "45px" },
    { id: 8, size: 75, left: 60, duration: 8, delay: 2, drift: "-35px" },
    { id: 9, size: 95, left: 80, duration: 10, delay: 4, drift: "55px" },
    { id: 10, size: 65, left: 30, duration: 7, delay: 1, drift: "-45px" },
  ];

  return (
    <div className="bubbles">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble"
          style={
            {
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`,
              "--bubble-drift": bubble.drift,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default function Home(): React.ReactElement {
  const jobInputRef = useRef<HTMLInputElement | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  const [jobFileName, setJobFileName] = useState<string | null>(null);
  const [jobText, setJobText] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);

  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const [isChecking, setIsChecking] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  function openJobPicker() {
    jobInputRef.current?.click();
  }

  function openResumePicker() {
    resumeInputRef.current?.click();
  }

  function onJobFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setJobError(null);
    setJobText(null);
    setJobFileName(null);
    setMatchResult(null);
    setMatchError(null);

    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name || "";
    const isTxtByName = /\.txt$/i.test(name);
    const isTxtByType = file.type === "text/plain";

    if (!isTxtByName && !isTxtByType) {
      setJobError("Job description must be a .txt file.");
      e.currentTarget.value = "";
      return;
    }

    setJobFileName(name);

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setJobText(text);
    };
    reader.onerror = () => {
      setJobError("Failed to read the job description file.");
    };
    reader.readAsText(file);
  }

  function onResumeFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setResumeError(null);
    setResumeFileName(null);
    setResumeFile(null);
    setMatchResult(null);
    setMatchError(null);

    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name || "";
    const allowed = /\.(pdf|docx|doc)$/i.test(name);
    const mimeAllowed =
      file.type === "application/pdf" ||
      file.type === "application/msword" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!allowed && !mimeAllowed) {
      setResumeError("Resume must be a .pdf, .doc or .docx file.");
      e.currentTarget.value = "";
      return;
    }

    setResumeFileName(name);
    setResumeFile(file);
  }

  async function checkMatch() {
    setMatchError(null);
    setMatchResult(null);

    if (!jobText) {
      setJobError(
        "Please upload a .txt job description before checking match.",
      );
      return;
    }

    const resumeToSend = resumeFile ?? resumeInputRef.current?.files?.[0];
    if (!resumeToSend) {
      setResumeError("Please upload a resume file before checking match.");
      return;
    }

    setIsChecking(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeToSend);
      formData.append("jobDescription", jobText);

      const resp = await fetch("/api/match", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Status ${resp.status}`);
      }

      const data = (await resp.json()) as MatchResponse;
      setMatchResult(data);
    } catch (err) {
      const e = err as Error | undefined;
      setMatchError(e?.message || "Failed to fetch match result.");
    } finally {
      setIsChecking(false);
    }
  }

  function onReset() {
    setJobFileName(null);
    setJobText(null);
    setJobError(null);
    setResumeFileName(null);
    setResumeFile(null);
    setResumeError(null);
    setMatchResult(null);
    setMatchError(null);
    setIsChecking(false);
    if (jobInputRef.current) jobInputRef.current.value = "";
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  }

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
      <BubbleAnimation />
      <FloatingParticles />

      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 fade-in">
          <div className="inline-block mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-400/30 flex items-center justify-center float">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-indigo-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2 sm:mb-3 text-white px-4">
            Resume Matching AI
          </h1>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg font-light px-4">
            Intelligent candidate screening powered by AI
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 scale-in">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload Documents
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="space-y-3">
              <button
                type="button"
                onClick={openJobPicker}
                className="w-full btn-hover-effect bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 font-medium glow-on-hover hover:from-indigo-500 hover:to-indigo-600"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm sm:text-base">
                    Upload Job Description
                  </span>
                </div>
              </button>
              {jobFileName ? (
                <div className="glass-card rounded-lg p-2 sm:p-3 flex items-center gap-2 slide-in-right">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm text-slate-300 truncate">
                    {jobFileName}
                  </span>
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-slate-500 text-center">
                  No file selected
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={openResumePicker}
                className="w-full btn-hover-effect bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300 font-medium glow-on-hover hover:from-purple-500 hover:to-purple-600"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-sm sm:text-base">Upload Resume</span>
                </div>
              </button>
              {resumeFileName ? (
                <div className="glass-card rounded-lg p-2 sm:p-3 flex items-center gap-2 slide-in-right">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm text-slate-300 truncate">
                    {resumeFileName}
                  </span>
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-slate-500 text-center">
                  No file selected
                </div>
              )}
            </div>
          </div>

          <input
            ref={jobInputRef}
            type="file"
            accept=".txt,text/plain"
            className="hidden"
            onChange={onJobFileChange}
          />
          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={onResumeFileChange}
          />

          {(jobError || resumeError) && (
            <div className="space-y-2 mb-4 sm:mb-6 fade-in">
              {jobError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm p-3 rounded-lg flex items-center gap-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="break-words">{jobError}</span>
                </div>
              )}
              {resumeError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm p-3 rounded-lg flex items-center gap-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="break-words">{resumeError}</span>
                </div>
              )}
            </div>
          )}

          {jobText && (
            <div className="mb-4 sm:mb-6 fade-in">
              <h3 className="text-xs font-medium text-indigo-300 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Job Description Preview
              </h3>
              <div className="glass-card rounded-xl p-3 sm:p-4 text-slate-300 whitespace-pre-wrap max-h-48 sm:max-h-64 overflow-auto text-xs sm:text-sm leading-relaxed">
                {jobText}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={checkMatch}
              disabled={isChecking}
              className="flex-1 btn-hover-effect bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed glow-on-hover hover:from-emerald-400 hover:to-teal-500 text-sm sm:text-base"
            >
              {isChecking ? (
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <svg
                    className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Check Match
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={onReset}
              className="sm:w-auto btn-hover-effect glass-card text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl hover:bg-slate-700/30 transition-all duration-300 font-medium text-sm sm:text-base"
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="sm:inline">Reset</span>
              </div>
            </button>
          </div>
        </div>

        {matchResult && <MatchResult data={matchResult} />}

        {matchError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 sm:p-4 rounded-xl mt-4 fade-in flex items-start gap-2 sm:gap-3">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="min-w-0">
              <div className="font-semibold text-sm sm:text-base">
                Failed to check match
              </div>
              <div className="text-xs sm:text-sm text-red-300/80 break-words mt-1">
                {matchError}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
