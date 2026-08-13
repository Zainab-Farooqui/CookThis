import { useAuth } from "../context/AuthContext";

const dishes = [
  {
    emoji: "🍝",
    title: "Weeknight pasta",
    text: "Quick recipes you can throw together in under 30 minutes.",
  },
  {
    emoji: "🥘",
    title: "Slow-cooked comfort",
    text: "Save the recipes worth waiting for and revisit them anytime.",
  },
  {
    emoji: "🥗",
    title: "Fresh & light",
    text: "Keep track of the salads and sides your kitchen keeps coming back to.",
  },
  {
    emoji: "🍰",
    title: "Something sweet",
    text: "Build a dessert shelf for the recipes worth celebrating.",
  },
];

function Home() {
  const { user } = useAuth();

  return (
    <section>
      <div className="hero-banner">
        <span className="hero-emoji">🍅</span>
        <h1>Welcome back, {user?.name?.split(" ")[0] || "chef"}!</h1>
        <p>
          Your recipe box is ready. Start collecting ideas, plan your next
          meal, and keep everything you love to cook in one place.
        </p>
      </div>

      <div className="dish-grid">
        {dishes.map((dish) => (
          <div className="dish-card" key={dish.title}>
            <span className="dish-emoji">{dish.emoji}</span>
            <h3>{dish.title}</h3>
            <p>{dish.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Home;
