import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { User, Shield, Code, LogIn } from "lucide-react";

export const UserProfileBadge: React.FC = () => {
  const { currentUser, isAuthenticated, setLoginModalOpen } = useAuthStore();

  if (!isAuthenticated || !currentUser) {
    return (
      <button
        onClick={() => setLoginModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity text-xs font-semibold cursor-pointer shadow-sm"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Student Login</span>
      </button>
    );
  }

  const roleColors: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
    student: {
      bg: "bg-[var(--tu-accent)]/15 border-[var(--tu-accent)]/30",
      text: "text-[var(--tu-accent)]",
      icon: User,
    },
    developer: {
      bg: "bg-purple-500/15 border-purple-500/30",
      text: "text-purple-400",
      icon: Code,
    },
    reviewer: {
      bg: "bg-amber-500/15 border-amber-500/30",
      text: "text-amber-400",
      icon: Shield,
    },
    guest: {
      bg: "bg-[var(--tu-bg-card)] border-[var(--tu-border)]",
      text: "text-[var(--tu-text-muted)]",
      icon: User,
    },
  };

  const style = roleColors[currentUser.role] || roleColors.student;
  const RoleIcon = style.icon;

  return (
    <button
      onClick={() => setLoginModalOpen(true)}
      title="Manage Student Profile & Roles"
      className="flex items-center gap-2 px-2.5 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:border-[var(--tu-border-focus)] transition-all cursor-pointer text-xs"
    >
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-[var(--tu-text-primary)]">
          {currentUser.displayName}
        </span>
        <span className="text-[10px] font-mono text-[var(--tu-text-muted)] hidden lg:inline">
          ({currentUser.matriculationNumber})
        </span>
      </div>

      <span
        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 capitalize ${style.bg} ${style.text}`}
      >
        <RoleIcon className="w-3 h-3" />
        {currentUser.role}
      </span>
    </button>
  );
};
