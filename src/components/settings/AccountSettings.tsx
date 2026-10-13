import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  User,
  GraduationCap,
  Github,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Save,
  Sparkles,
} from "lucide-react";

export const AccountSettings: React.FC = () => {
  const { currentUser, updateProfile } = useAuthStore();
  const [githubInput, setGithubInput] = useState<string>(
    currentUser?.githubUsername || ""
  );
  const [displayNameInput, setDisplayNameInput] = useState<string>(
    currentUser?.displayName || ""
  );
  const [matriculationInput, setMatriculationInput] = useState<string>(
    currentUser?.matriculationNumber || ""
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGithub = githubInput.trim().replace(/^@/, "");
    updateProfile({
      githubUsername: cleanGithub || undefined,
      displayName: displayNameInput.trim() || "Student",
      matriculationNumber: matriculationInput.trim() || "00000000",
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl text-[var(--tu-text-primary)]">
      <div>
        <h3 className="text-base font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-[var(--tu-accent)]" />
          Student Account & GitHub Community Identity
        </h3>
        <p className="text-xs text-[var(--tu-text-secondary)] mt-1">
          Manage your verified TU Wien student credentials and link your GitHub profile
          for community plugin author attribution.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-[var(--tu-radius)] flex items-center gap-2 text-xs text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Student profile and GitHub username successfully updated!</span>
        </div>
      )}

      {/* Student Identity Card */}
      <div className="bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--tu-accent)]/20 border border-[var(--tu-accent)]/30 text-[var(--tu-accent)] flex items-center justify-center font-bold text-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                {currentUser?.displayName || "TU Wien Student"}
              </h4>
              <p className="text-xs text-[var(--tu-text-secondary)] font-mono">
                {currentUser?.email || "student@student.tuwien.ac.at"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SSO Verified</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--tu-text-secondary)] mb-1.5">
                Full Name / Display Name
              </label>
              <input
                type="text"
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                placeholder="e.g. Stefan Weber"
                className="w-full bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-sm)] px-3 py-2 text-xs focus:outline-none focus:border-[var(--tu-border-focus)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--tu-text-secondary)] mb-1.5">
                Matrikelnummer (Student ID)
              </label>
              <input
                type="text"
                value={matriculationInput}
                onChange={(e) => setMatriculationInput(e.target.value)}
                placeholder="e.g. 11823456"
                className="w-full bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-sm)] px-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--tu-border-focus)] transition-colors"
              />
            </div>
          </div>

          {/* GitHub Profile Linking */}
          <div className="pt-2 border-t border-[var(--tu-border-subtle)]">
            <label className="block text-xs font-semibold text-[var(--tu-text-secondary)] mb-1.5">
              Linked GitHub Username
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--tu-text-muted)]">
                  <Github className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  placeholder="e.g. alice or stefanweber"
                  className="w-full bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-sm)] pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--tu-border-focus)] transition-colors"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-[var(--tu-accent)] hover:bg-[var(--tu-accent-hover)] text-[var(--tu-accent-contrast)] text-xs font-semibold rounded-[var(--tu-radius-sm)] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Save Profile
              </button>
            </div>
            <p className="text-[11px] text-[var(--tu-text-muted)] mt-1.5 leading-relaxed">
              Linking your GitHub username connects your repositories in the{" "}
              <a
                href="https://github.com/tu-cockpit-community"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--tu-text-accent)] hover:underline inline-flex items-center gap-0.5"
              >
                tu-cockpit-community
                <ExternalLink className="w-2.5 h-2.5" />
              </a>{" "}
              organization to your verified student identity. Any plugins created by your
              handle will automatically display your name and Matrikelnummer on the Marketplace.
            </p>
          </div>
        </form>
      </div>

      {/* Community Governance Information */}
      <div className="bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-5 space-y-3">
        <h4 className="font-bold text-xs flex items-center gap-2 text-[var(--tu-text-primary)]">
          <Sparkles className="w-4 h-4 text-[var(--tu-accent)]" />
          Community Organization Publishing & Governance
        </h4>
        <p className="text-xs text-[var(--tu-text-secondary)] leading-relaxed">
          TU Cockpit features a community-governed marketplace. Instead of closed internal
          portals, all third-party plugins are published directly to GitHub. To share your
          own plugin with fellow students:
        </p>
        <ol className="text-xs text-[var(--tu-text-secondary)] space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
          <li>
            Create a repository with a valid <code className="text-[11px] px-1 py-0.5 rounded bg-[var(--tu-bg-surface)] font-mono">manifest.json</code>.
          </li>
          <li>
            Ensure your manifest author specifies your GitHub username: <code className="text-[11px] px-1 py-0.5 rounded bg-[var(--tu-bg-surface)] font-mono">"github": "{githubInput.trim() || "your-handle"}"</code>.
          </li>
          <li>
            Transfer or fork your repo into <code className="text-[11px] px-1 py-0.5 rounded bg-[var(--tu-bg-surface)] font-mono">tu-cockpit-community</code>, or request review from student moderators.
          </li>
        </ol>
        <div className="pt-2">
          <a
            href="https://github.com/tu-cockpit-community"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--tu-text-accent)] hover:underline"
          >
            <span>Visit the Community GitHub Organization</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
