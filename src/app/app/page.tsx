"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, FileText, X, ChevronRight } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { Navbar } from "@/components/Navbar";
import { loadApiKey } from "@/lib/apiKey";

export default function AppPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumes, setResumes] = useState<File[]>([]);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGeminiApiKey(loadApiKey());
  }, []);

  const handleResumeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ["pdf", "doc", "docx"].includes(f.name.split(".").pop()?.toLowerCase() ?? "")
    );
    if (files.length) setResumes((prev) => [...prev, ...files]);
    else toast.error("Only PDF and DOCX files are supported");
  };

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setResumes((prev) => [...prev, ...files]);
  };

  const removeResume = (index: number) => {
    setResumes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return toast.error("Job description is required");
    if (!resumes.length) return toast.error("Upload at least one resume");
    if (!geminiApiKey.trim()) {
      toast.error("No API key saved — add one in Settings");
      router.push("/app/settings");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("geminiApiKey", geminiApiKey);
    resumes.forEach((f) => formData.append("resumes", f));

    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    try {
      const [res, resumeBase64s] = await Promise.all([
        fetch("/api/match", { method: "POST", body: formData }),
        Promise.all(resumes.map(toBase64)),
      ]);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Screening failed");

      const base64ByName: Record<string, string> = {};
      resumes.forEach((f, i) => { base64ByName[f.name] = resumeBase64s[i]; });

      const jobId = crypto.randomUUID();
      sessionStorage.setItem(`sift-job-${jobId}`, JSON.stringify({
        title: jobTitle || "Untitled position",
        description: jobDescription,
        results: data.results.map((r: { resumeName: string }) => ({
          ...r,
          resumeBase64: base64ByName[r.resumeName],
        })),
      }));
      toast.success("Screening complete!");
      router.push(`/app/job/${jobId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar variant="app" onApiKeyClick={() => router.push("/app/settings")} />

      <main className="mx-auto max-w-5xl px-6 pt-28 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-semibold text-white mb-1">New screening</h1>
          <p className="text-sm text-white/30 mb-8">
            {session?.user?.name ? `Hi ${session.user.name} —` : ""} Upload a job description and resumes to get started.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Position title (e.g. Senior Frontend Engineer)"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#4d65ff]/40 focus:ring-1 focus:ring-[#4d65ff]/20 transition-all"
                />
                <textarea
                  placeholder="Paste job description here…"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={10}
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#4d65ff]/40 focus:ring-1 focus:ring-[#4d65ff]/20 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleResumeDrop}
                  onClick={() => resumeInputRef.current?.click()}
                  className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-white/[0.01] hover:border-[#4d65ff]/40 hover:bg-[#4d65ff]/[0.03] transition-all cursor-pointer min-h-[160px] p-6"
                >
                  <Upload size={20} className="text-white/20 mb-3" />
                  <p className="text-sm text-white/30 text-center">
                    Drop resumes here or click to browse
                  </p>
                  <p className="mt-1 text-xs text-white/15">PDF, DOC, DOCX</p>
                  <input
                    ref={resumeInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleResumeSelect}
                  />
                </div>

                <AnimatePresence>
                  {resumes.map((file, i) => (
                    <motion.div
                      key={`${file.name}-${i}`}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                    >
                      <FileText size={14} className="text-[#4d65ff] shrink-0" />
                      <span className="text-sm text-white/70 truncate flex-1">{file.name}</span>
                      <span className="text-xs text-white/20 shrink-0">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                      <button
                        type="button"
                        onClick={() => removeResume(i)}
                        className="text-white/20 hover:text-white/60 transition-colors shrink-0"
                      >
                        <X size={13} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-white/20">
                {resumes.length} resume{resumes.length !== 1 ? "s" : ""} selected
              </p>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#4d65ff] hover:bg-[#6b83ff] disabled:opacity-50 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 disabled:translate-y-0"
              >
                {loading ? "Screening…" : "Run screening"}
                <ChevronRight size={14} />
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
