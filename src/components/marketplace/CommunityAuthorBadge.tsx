import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Github, Sparkles, UserCheck, User } from "lucide-react";

export interface AuthorData {
  name: string;
  github?: string;
  url?: string;
  avatarUrl?: string;
  matriculationNumber?: string;
}

export interface CommunityAuthorBadgeProps {
  author: AuthorData;
  className?: string;
}

export const CommunityAuthorBadge: React.FC<CommunityAuthorBadgeProps> = ({
  author,
  className = "",
}) => {
  const { currentUser } = useAuthStore();

  const isSelf = Boolean(
    currentUser?.githubUsername &&
      author.github &&
      currentUser.githubUsername.trim().toLowerCase() ===
        author.github.trim().toLowerCase()
  );

  if (isSelf) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--tu-accent)]/15 border border-[var(--tu-accent)]/40 text-[var(--tu-accent)] text-[11px] font-semibold shadow-sm transition-all duration-200 group ${className}`}
        title="Plugin authored by your linked GitHub identity"
      >
        <Sparkles className="w-3.5 h-3.5 text-[var(--tu-accent)] shrink-0 animate-pulse" />
        <span className="truncate">
          Published by You: {currentUser?.displayName || author.name} (Matrikelnr:{" "}
          {currentUser?.matriculationNumber || author.matriculationNumber || "Verified"})
        </span>
        <UserCheck className="w-3 h-3 ml-0.5 text-[var(--tu-accent)] opacity-80" />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[11px] text-[var(--tu-text-secondary)] ${className}`}
    >
      {author.avatarUrl ? (
        <img
          src={author.avatarUrl}
          alt={author.name}
          className="w-3.5 h-3.5 rounded-full object-cover shrink-0 border border-[var(--tu-border-subtle)]"
        />
      ) : (
        <User className="w-3.5 h-3.5 text-[var(--tu-text-muted)] shrink-0" />
      )}
      <span className="truncate">
        Author: {author.name}
        {author.matriculationNumber
          ? ` (Matrikelnr: ${author.matriculationNumber})`
          : ""}
      </span>
      {author.github && (
        <span className="inline-flex items-center gap-1 text-[var(--tu-text-muted)] shrink-0">
          <span>•</span>
          <a
            href={`https://github.com/${author.github}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--tu-text-primary)] inline-flex items-center gap-0.5 transition-colors"
            title={`View GitHub profile @${author.github}`}
          >
            <Github className="w-3 h-3" />
            <span>@{author.github}</span>
          </a>
        </span>
      )}
    </div>
  );
};
