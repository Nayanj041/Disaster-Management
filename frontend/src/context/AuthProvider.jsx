import { createContext, useContext } from "react";
import { useAuthStore } from "../store/useAuthStore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = useAuthStore();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { authUser, updateUser, updateUserStats } = context;

  return {
    ...context,
    user: authUser,
    isAuthenticated: !!authUser,
    isAdmin: authUser?.role === "admin",
    updateUser,
    updateUserStats,
  };
};
