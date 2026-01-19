"use client";

import React, { useRef, useState } from "react";
import { ScreeningResult } from "@/lib/types";

type MatchResponse = ScreeningResult;

function MatchResult({ data }: { data: MatchResponse }): React.ReactElement {
  return (
    <div className="bg-white/5 p-4 rounded text-white">
      <h3 className="text-lg font-semibold mb-2">Match Result</h3>
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div>
          <strong>Match score:</strong>{" "}
          <span className="font-medium">{data.match_score?.toFixed(2)}</span>
        </div>
        <div>
          <strong>Recommendation:</strong>{" "}
          <span className="font-medium">{data.recommendation}</span>
        </div>
        <div>
          <strong>Requires human:</strong>{" "}
          <span className="font-medium">
            {data.requires_human ? "Yes" : "No"}
          </span>
        </div>
        <div>
          <strong>Confidence:</strong>{" "}
          <span className="font-medium">{data.confidence?.toFixed(2)}</span>
        </div>
        <div>
          <strong>Reasoning summary:</strong>
          <div className="mt-2 whitespace-pre-wrap text-sm text-white/90">
            {data.reasoning_summary}
          </div>
        </div>
      </div>
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
      console.log(data);
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
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl text-white">
        <h1 className="text-2xl font-semibold mb-6">Upload job & resume</h1>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={openJobPicker}
              className="cursor-pointer bg-white text-black px-5 py-2 rounded-md shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Upload Job Description (.txt)
            </button>

            <button
              type="button"
              onClick={openResumePicker}
              className="cursor-pointer bg-white text-black px-5 py-2 rounded-md shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Upload Resume (.pdf/.doc/.docx)
            </button>
          </div>

          <div className="text-sm text-white/80 mt-3 sm:mt-0">
            <div>
              <strong>Job:</strong>{" "}
              {jobFileName ? (
                <span className="font-medium text-white">{jobFileName}</span>
              ) : (
                <span className="text-white/60">No file chosen</span>
              )}
            </div>
            <div className="mt-1">
              <strong>Resume:</strong>{" "}
              {resumeFileName ? (
                <span className="font-medium text-white">{resumeFileName}</span>
              ) : (
                <span className="text-white/60">No file chosen</span>
              )}
            </div>
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

        <div className="space-y-2 mb-6">
          {jobError && (
            <div className="text-red-400 text-sm bg-white/5 p-2 rounded">
              {jobError}
            </div>
          )}
          {resumeError && (
            <div className="text-red-400 text-sm bg-white/5 p-2 rounded">
              {resumeError}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Job description preview</h2>
          {jobText ? (
            <div className="bg-white/5 p-4 rounded text-white/90 whitespace-pre-wrap max-h-72 overflow-auto">
              {jobText}
            </div>
          ) : (
            <div className="text-white/60">No job text loaded.</div>
          )}
        </div>

        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={checkMatch}
            disabled={isChecking}
            className="cursor-pointer bg-white text-black px-4 py-2 rounded-md shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-60"
          >
            {isChecking ? "Checking..." : "Check Match"}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="cursor-pointer bg-white/5 border border-white/10 text-white px-4 py-2 rounded-md hover:bg-white/6 focus:outline-none"
          >
            Reset
          </button>
        </div>

        {matchResult && <MatchResult data={matchResult} />}

        {matchError && (
          <div className="text-red-400 text-sm bg-white/5 p-2 rounded mt-3">
            Failed to check match.
          </div>
        )}
      </div>
    </div>
  );
}
