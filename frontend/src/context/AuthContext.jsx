
import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser
} from "../api/auth.api";

const AuthContext = createContext(null);

function getPayload(response) {
  return response?.data ?? response;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        const payload = getPayload(response);

        setUser(payload.user ?? payload);
      } catch {
        localStorage.removeItem("accessToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function login(credentials) {
    const response = await loginUser(credentials);
    const payload = getPayload(response);

    // Supports either { token } or { data: { token } } responses.
    const token = payload.token ?? payload.accessToken;

    if (!token) {
      throw new Error(
        "Login response did not contain an authentication token."
      );
    }

    localStorage.setItem("accessToken", token);

    const currentUserResponse = await getCurrentUser();
    const currentUserPayload = getPayload(currentUserResponse);

    setUser(currentUserPayload.user ?? currentUserPayload);

    return currentUserPayload;
  }

  async function register(userData) {
    return await registerUser(userData);
  }

  function logout() {
    localStorage.removeItem("accessToken");
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
