import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isPending) {
    return <p>Checking your session...</p>;
  }

  if (auth.isError) {
    return (
      <div>
        <p>Unable to verify your session.</p>
        <button onClick={() => void auth.refetch()}>Try again</button>
      </div>
    );
  }

  if (!auth.data) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}