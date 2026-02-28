"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Key, Clipboard, Copy, Save, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { Navbar } from "@/components/Navbar";
import { saveApiKey, loadApiKey } from "@/lib/apiKey";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = loadApiKey();
    if (existing) {
      setGeminiApiKey(existing);
      setSaved(true);
    }
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) return toast.error("Clipboard is empty");
      setGeminiApiKey(text.trim());
      setSaved(false);
    } catch {
      toast.error("Clipboard access denied — check browser permissions");
    }
  };

  const handleCopy = async () => {
    if (!geminiApiKey) return toast.error("No key to copy");
    await navigator.clipboard.writeText(geminiApiKey);
    toast.success("Copied to clipboard");
  };

  const handleSave = () => {
    if (!geminiApiKey.trim()) return toast.error("Paste an API key first");
    saveApiKey(geminiApiKey);
    setSaved(true);
    toast.success("API key saved for 7 days");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar variant="app" />

      <main className="mx-auto max-w-3xl px-6 pt-28 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={() => router.push("/app")}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-6"
          >
            <ArrowLeft size={13} />
            Back
          </button>
          <h1 className="text-2xl font-semibold text-white mb-1">Settings</h1>
          <p className="text-sm text-white/30 mb-8">Manage your account and preferences.</p>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <h2 className="text-sm font-medium text-white mb-1">Account</h2>
              <p className="text-xs text-white/30 mb-4">{session?.user?.email}</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#4d65ff]/20 flex items-center justify-center text-[#4d65ff] text-sm font-semibold">
                  {session?.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="text-sm text-white">{session?.user?.name}</p>
                  <p className="text-xs text-white/30">{session?.user?.email}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-1">
                <Key size={14} className="text-[#4d65ff]" />
                <h2 className="text-sm font-medium text-white">Gemini API key</h2>
                {saved && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle size={11} />
                    Saved
                  </span>
                )}
              </div>
              <p className="text-xs text-white/30 mb-4">
                Stored locally in your browser for 7 days — sent to our server only during screening to call Gemini, never stored server-side.
                Get your key from{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4d65ff] hover:text-[#6b83ff] transition-colors"
                >
                  Google AI Studio
                </a>
                .
              </p>

              <input
                type="password"
                readOnly
                value={geminiApiKey}
                placeholder="Click 'Paste' to add your key"
                className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none font-mono cursor-default mb-3"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePaste}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] text-xs text-white/60 hover:text-white transition-all"
                  >
                    <Clipboard size={12} />
                    Paste
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={!geminiApiKey}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] text-xs text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  disabled={!geminiApiKey || saved}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4d65ff] hover:bg-[#6b83ff] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium text-white transition-all duration-200"
                >
                  <Save size={13} />
                  Save
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
