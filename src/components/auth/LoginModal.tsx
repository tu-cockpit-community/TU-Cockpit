import React, { useState } from "react";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { AuthService } from "@/services/auth/AuthService";
import {
  X,
  User,
  Shield,
  Code,
  GraduationCap,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Sliders,
} from "lucide-react";

export const LoginModal: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    isLoginModalOpen,
    devModeEnabled,
    login,
    logout,
    setRole,
    setDevMode,
    setLoginModalOpen,
  } = useAuthStore();

  const [matrNr, setMatrNr] = useState<string>(currentUser?.matriculationNumber || "11823456");
  const [email, setEmail] = useState<string>(currentUser?.email || "e11823456@student.tuwien.ac.at");
  const [name, setName] = useState<string>(currentUser?.displayName || "Stefan Weber");
  const [github, setGithub] = useState<string>(currentUser?.githubUsername || "tuwien-student");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const vEmail = AuthService.validateStudentEmail(email);
    if (!vEmail.valid) {
      setErrorMsg(vEmail.error || "Invalid student email");
      return;
    }
    const vMatr = AuthService.validateMatriculationNumber(matrNr);
    if (!vMatr.valid) {
      setErrorMsg(vMatr.error || "Invalid matriculation number");
      return;
    }

    setErrorMsg(null);
    login({
      matriculationNumber: matrNr,
      email,
      displayName: name,
      githubUsername: github,
      role: currentUser?.role || "student",
    });
    setLoginModalOpen(false);
  };

  const roles: Array<{ role: UserRole; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }> = [
    {
      role: "student",
      title: "Student",
      desc: "Standard academic tier: install verified store tools and use embedded portals.",
      icon: GraduationCap,
    },
    {
      role: "developer",
      title: "Student Developer",
      desc: "Developer tier: direct GitHub installation, sideload local plugins, publish applications.",
      icon: Code,
    },
    {
      role: "reviewer",
      title: "Store Reviewer",
      desc: "Community maintainer tier: review, verify, and approve community store submissions.",
      icon: Shield,
    },
    {
      role: "guest",
      title: "Guest",
      desc: "Read-only access to marketplace and institutional portals.",
      icon: User,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-6 max-w-lg w-full shadow-2xl relative text-[var(--tu-text-primary)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--tu-border-subtle)] mb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--tu-accent)]" />
            <h3 className="font-semibold text-base">Student Authentication & Profile</h3>
          </div>
          <button
            onClick={() => setLoginModalOpen(false)}
            className="text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-[var(--tu-radius)] bg-[var(--tu-danger)]/10 border border-[var(--tu-danger)]/30 text-[var(--tu-danger)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--tu-text-secondary)] mb-1">
                Matriculation No. (8 digits)
              </label>
              <input
                type="text"
                value={matrNr}
                onChange={(e) => setMatrNr(e.target.value)}
                placeholder="01234567"
                className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] px-3 py-1.5 text-xs font-mono text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--tu-text-secondary)] mb-1">
                Student Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Stefan Weber"
                className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] px-3 py-1.5 text-xs text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--tu-text-secondary)] mb-1">
              Official TU Email (eXXXXXXX@student.tuwien.ac.at)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e11823456@student.tuwien.ac.at"
              className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] px-3 py-1.5 text-xs font-mono text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--tu-text-secondary)] mb-1">
              Linked GitHub Profile (Optional)
            </label>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="github-username"
              className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] px-3 py-1.5 text-xs font-mono text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity shadow flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Save Profile
            </button>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => logout()}
                className="px-3 py-2 text-xs rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[var(--tu-danger)] hover:bg-[var(--tu-bg-hover)] transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            )}
          </div>
        </form>

        {/* Tiered Roles Matrix */}
        <div className="border-t border-[var(--tu-border-subtle)] pt-4">
          <label className="block text-xs font-semibold text-[var(--tu-text-secondary)] uppercase tracking-wider mb-2">
            Switch Access Tier (RBAC)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {roles.map((r) => {
              const Icon = r.icon;
              const isCurrent = currentUser?.role === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setRole(r.role)}
                  className={`p-3 rounded-[var(--tu-radius)] border text-left transition-all text-xs flex flex-col justify-between ${
                    isCurrent
                      ? "border-[var(--tu-accent)] bg-[var(--tu-bg-card)] shadow"
                      : "border-[var(--tu-border)] bg-[var(--tu-bg-surface)] hover:bg-[var(--tu-bg-hover)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[var(--tu-text-primary)] flex items-center gap-1.5 capitalize">
                      <Icon className="w-3.5 h-3.5 text-[var(--tu-accent)]" />
                      {r.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-[var(--tu-accent)]">Active</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--tu-text-secondary)]">{r.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Developer Mode Toggle */}
        <div className="border-t border-[var(--tu-border-subtle)] pt-4 mt-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--tu-text-accent)]" />
            <div>
              <span className="font-semibold block text-[var(--tu-text-primary)]">Developer Sideloading Mode</span>
              <span className="text-[11px] text-[var(--tu-text-muted)]">Unlocks local plugin testing and GitHub sideloading</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDevMode(!devModeEnabled)}
            className={`px-3 py-1 text-xs font-semibold rounded-[var(--tu-radius-sm)] border transition-all ${
              devModeEnabled
                ? "bg-[var(--tu-success)]/15 border-[var(--tu-success)]/40 text-[var(--tu-success)]"
                : "bg-[var(--tu-bg-card)] border-[var(--tu-border)] text-[var(--tu-text-secondary)]"
            }`}
          >
            {devModeEnabled ? "Enabled" : "Disabled"}
          </button>
        </div>
      </div>
    </div>
  );
};
