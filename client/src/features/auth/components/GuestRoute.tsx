import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function GuestRoute() {
  const auth = useAuth();

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

  if (auth.data) {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
}