import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main>
      <h1>Opinions Around You</h1>

      <p>
        Discover what people think about places near you.
        Share your experiences and explore local perspectives.
      </p>

      <Link to="/register">Get Started</Link>{" "}
      <Link to="/login">Login</Link>
    </main>
  );
}