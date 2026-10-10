import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "../features/auth/api";
import { AUTH_QUERY_KEY } from "../features/auth/hooks/useAuth";

export default function AppLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      await logout();
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      await queryClient.invalidateQueries();
      navigate("/login", { replace: true });
    } catch {
      setError("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <header>
        <nav>
          <Link to="/feed">Feed</Link>{" "}
          <Link to="/nearby">Nearby</Link>{" "}
          <Link to="/create">Create opinion</Link>{" "}
          <Link to="/profile">Profile</Link>{" "}
          <button onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </nav>
        {error && <p role="alert">{error}</p>}
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
}