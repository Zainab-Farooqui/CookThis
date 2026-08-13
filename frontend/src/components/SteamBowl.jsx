function SteamBowl() {
  return (
    <div className="steam-pot" aria-hidden="true">
      <svg width="72" height="56" viewBox="0 0 72 56" fill="none">
        <path
          className="steam-line"
          d="M28 26 C 24 20, 32 16, 28 10"
          stroke="#3f7d5c"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          className="steam-line"
          d="M36 26 C 32 18, 40 14, 36 6"
          stroke="#e8503a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          className="steam-line"
          d="M44 26 C 40 20, 48 16, 44 10"
          stroke="#f2b705"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M14 28 h44 a2 2 0 0 1 2 2 c0 12-10.75 18-24 18S12 42 12 30a2 2 0 0 1 2-2Z"
          fill="#e8503a"
        />
        <ellipse cx="36" cy="28" rx="24" ry="4" fill="#c63f2c" />
      </svg>
    </div>
  );
}

export default SteamBowl;
