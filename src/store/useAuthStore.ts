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
  updateProfile: (profile: Partial<UserProfile>) => void;
  canInstallUnvettedGitHub: () => boolean;
}

const getStoredProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem("tu_cockpit_user_profile");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load user profile from localStorage:", e);
  }
  return {
    id: "student-tu-demo",
    matriculationNumber: "11823456",
    email: "e11823456@student.tuwien.ac.at",
    displayName: "Stefan Weber",
    role: "student",
    developerStatus: "none",
    githubUsername: "stefanweber",
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: getStoredProfile(),
  isAuthenticated: true,
  devModeEnabled: true,
  isLoginModalOpen: false,

  updateProfile: (profile) => {
    const current = get().currentUser;
    if (current) {
      const updated = {
        ...current,
        ...profile,
      };
      try {
        localStorage.setItem("tu_cockpit_user_profile", JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to persist user profile:", e);
      }
      set({ currentUser: updated });
    }
  },

  login: (profile) => {
    const role = profile.role || "student";
    const user: UserProfile = {
      id: profile.id || `tu-${Date.now()}`,
      matriculationNumber: profile.matriculationNumber || "01234567",
      email: profile.email || "student@student.tuwien.ac.at",
      displayName: profile.displayName || "TU Student",
      role,
      githubUsername: profile.githubUsername || get().currentUser?.githubUsername,
      developerStatus: role === "developer" ? "approved" : "none",
      sessionToken: `token_${Date.now()}`,
    };
    try {
      localStorage.setItem("tu_cockpit_user_profile", JSON.stringify(user));
    } catch (e) {
      console.warn("Failed to persist user profile:", e);
    }
    set({ currentUser: user, isAuthenticated: true });
  },

  logout: () => {
    const guestUser: UserProfile = {
      id: "guest",
      matriculationNumber: "00000000",
      email: "guest@tu-cockpit.local",
      displayName: "Guest User",
      role: "guest",
    };
    try {
      localStorage.setItem("tu_cockpit_user_profile", JSON.stringify(guestUser));
    } catch (e) {
      console.warn("Failed to persist user profile:", e);
    }
    set({
      currentUser: guestUser,
      isAuthenticated: false,
    });
  },

  setDevMode: (enabled) => set({ devModeEnabled: enabled }),

  setRole: (role) => {
    const current = get().currentUser;
    if (current) {
      const updated = {
        ...current,
        role,
        developerStatus: role === "developer" ? "approved" : current.developerStatus,
      };
      try {
        localStorage.setItem("tu_cockpit_user_profile", JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to persist user profile:", e);
      }
      set({ currentUser: updated });
    }
  },

  setLoginModalOpen: (open) => set({ isLoginModalOpen: open }),

  canInstallUnvettedGitHub: () => {
    const role = get().currentUser?.role;
    return role === "developer" || role === "reviewer" || get().devModeEnabled;
  },
}));
