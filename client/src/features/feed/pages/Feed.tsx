import { useState } from "react";

interface MockOpinion {
  id: string;
  username: string;
  initials: string;
  location: string;
  time: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
}

const mockOpinions: MockOpinion[] = [
  {
    id: "1",
    username: "Aditi Rao",
    initials: "AR",
    location: "Indiranagar, Bengaluru",
    time: "2 hours ago",
    title: "We need more shaded walking paths",
    content:
      "Walking around Indiranagar in the afternoon is becoming difficult. More trees and shaded footpaths would make this area much more pedestrian-friendly.",
    category: "Infrastructure",
    likes: 24,
    comments: 8,
  },
  {
    id: "2",
    username: "Karthik S",
    initials: "KS",
    location: "12th Main, Bengaluru",
    time: "4 hours ago",
    title: "Where can I find the best filter coffee?",
    content:
      "Looking for underrated places serving authentic filter coffee around 12th Main. Not necessarily fancy cafes—just great coffee and a nice atmosphere.",
    category: "Food & Drink",
    likes: 17,
    comments: 12,
  },
  {
    id: "3",
    username: "Nisha M",
    initials: "NM",
    location: "Domlur, Bengaluru",
    time: "Yesterday",
    title: "The park renovation is a huge improvement 🌿",
    content:
      "The cleaner walking paths, better seating, and improved greenery make this park much more enjoyable. Hoping the maintenance continues!",
    category: "Public Spaces",
    likes: 42,
    comments: 6,
  },
  {
    id: "4",
    username: "Rahul Varma",
    initials: "RV",
    location: "Koramangala, Bengaluru",
    time: "Yesterday",
    title: "Traffic signals need better timing",
    content:
      "Some junctions have unnecessarily long waiting times even when there is very little traffic on the other side. Better signal coordination could help everyone.",
    category: "Traffic",
    likes: 31,
    comments: 15,
  },
];

export default function FeedPage() {
  const [likedOpinions, setLikedOpinions] = useState<string[]>([]);

  function toggleLike(id: string) {
    setLikedOpinions((previous) =>
      previous.includes(id)
        ? previous.filter((opinionId) => opinionId !== id)
        : [...previous, id]
    );
  }

  return (
    <main className="feed-page">
      <header className="feed-header">
        <div>
          <p className="eyebrow">YOUR COMMUNITY</p>
          <h1>Your local pulse</h1>
          <p className="feed-subtitle">
            Discover what people around you are thinking.
          </p>
        </div>

        <div className="location-badge">
          <span>📍</span>
          <span>Indiranagar, Bengaluru</span>
        </div>
      </header>

      <section className="feed-list">
        {mockOpinions.map((opinion) => {
          const isLiked = likedOpinions.includes(opinion.id);

          return (
            <article className="opinion-card" key={opinion.id}>
              <div className="opinion-author">
                <div className="avatar">{opinion.initials}</div>

                <div className="author-details">
                  <strong>{opinion.username}</strong>
                  <span>
                    {opinion.location} · {opinion.time}
                  </span>
                </div>

                <span className="category-tag">{opinion.category}</span>
              </div>

              <div className="opinion-content">
                <h2>{opinion.title}</h2>
                <p>{opinion.content}</p>
              </div>

              <footer className="opinion-actions">
                <button
                  type="button"
                  className={`action-button ${isLiked ? "liked" : ""}`}
                  onClick={() => toggleLike(opinion.id)}
                  aria-pressed={isLiked}
                >
                  {isLiked ? "♥" : "♡"}{" "}
                  {opinion.likes + (isLiked ? 1 : 0)} Likes
                </button>

                <button
                  type="button"
                  className="action-button"
                  onClick={() =>
                    alert(`Comments for "${opinion.title}" coming soon!`)
                  }
                >
                  ♧ {opinion.comments} Comments
                </button>

                <button
                  type="button"
                  className="action-button location-action"
                  onClick={() => alert(opinion.location)}
                >
                  ↗ Location
                </button>
              </footer>
            </article>
          );
        })}
      </section>
    </main>
  );
}