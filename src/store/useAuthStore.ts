import { create } from "zustand";

export type UserRole = "guest" | "student" | "developer" | "reviewer";

export interface UserProfile {
  id: string;
  matriculationNumber: string;
  email: string;
  displayName: string;
  role: UserRole;
  githubUsername?: string;
  developerStatus?: "none" | "pending" | "approved" | "rejected";
  sessionToken?: string;
}

export interface AuthState {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  devModeEnabled: boolean;
  isLoginModalOpen: boolean;

  login: (profile: Partial<UserProfile>) => void;
  logout: () => void;
  setDevMode: (enabled: boolean) => void;
  setRole: (role: UserRole) => void;
  setLoginModalOpen: (open: boolean) => void;
  canInstallUnvettedGitHub: () => boolean;
  canAccessDeveloperPortal: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: {
    id: "student-tu-demo",
    matriculationNumber: "11823456",
    email: "e11823456@student.tuwien.ac.at",
    displayName: "Stefan Weber",
    role: "student",
    developerStatus: "none",
  },
  isAuthenticated: true,
  devModeEnabled: true,
  isLoginModalOpen: false,

  login: (profile) => {
    const role = profile.role || "student";
    const user: UserProfile = {
      id: profile.id || `tu-${Date.now()}`,
      matriculationNumber: profile.matriculationNumber || "01234567",
      email: profile.email || "student@student.tuwien.ac.at",
      displayName: profile.displayName || "TU Student",
      role,
      githubUsername: profile.githubUsername,
      developerStatus: role === "developer" ? "approved" : "none",
      sessionToken: `token_${Date.now()}`,
    };
    set({ currentUser: user, isAuthenticated: true });
  },

  logout: () => {
    set({
      currentUser: {
        id: "guest",
        matriculationNumber: "00000000",
        email: "guest@tu-cockpit.local",
        displayName: "Guest User",
        role: "guest",
      },
      isAuthenticated: false,
    });
  },

  setDevMode: (enabled) => set({ devModeEnabled: enabled }),

  setRole: (role) => {
    const current = get().currentUser;
    if (current) {
      set({
        currentUser: {
          ...current,
          role,
          developerStatus: role === "developer" ? "approved" : current.developerStatus,
        },
      });
    }
  },

  setLoginModalOpen: (open) => set({ isLoginModalOpen: open }),

  canInstallUnvettedGitHub: () => {
    const role = get().currentUser?.role;
    return role === "developer" || role === "reviewer" || get().devModeEnabled;
  },

  canAccessDeveloperPortal: () => {
    const role = get().currentUser?.role;
    return role === "developer" || role === "reviewer" || get().devModeEnabled;
  },
}));
