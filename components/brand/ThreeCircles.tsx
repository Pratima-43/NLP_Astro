/** The welcome illustration: the three readings overlap, and you are where they meet. */
export function ThreeCircles({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 340" className={className} role="img" aria-labelledby="three-circles-title">
      <title id="three-circles-title">Three overlapping circles labelled Numbers, Stars and Hand, with You in the middle</title>
      <g style={{ mixBlendMode: "multiply" }}>
        <circle cx="130" cy="125" r="100" fill="#fdf1d8" stroke="#b45309" strokeWidth="3" />
        <circle cx="230" cy="125" r="100" fill="#e6e9fe" fillOpacity="0.85" stroke="#4338ca" strokeWidth="3" />
        <circle cx="180" cy="210" r="100" fill="#d5f5ef" fillOpacity="0.85" stroke="#0f766e" strokeWidth="3" />
      </g>
      <g fontFamily="var(--font-heading), sans-serif" fontWeight="600" textAnchor="middle">
        <text x="98" y="105" fontSize="22" fill="#713f12">Numbers</text>
        <text x="262" y="105" fontSize="22" fill="#312e81">Stars</text>
        <text x="180" y="282" fontSize="22" fill="#134e4a">Hand</text>
        <circle cx="180" cy="152" r="30" fill="#1c1a17" />
        <text x="180" y="159" fontSize="19" fill="#ffffff">You</text>
      </g>
      {/* small motifs: a digit, a star, a palm line */}
      <text x="98" y="140" fontSize="34" fontWeight="700" fill="#b45309" textAnchor="middle" fontFamily="var(--font-heading), sans-serif">7</text>
      <path d="M262 122l5.9 12 13.1 1.9-9.5 9.3 2.2 13.1-11.7-6.2-11.7 6.2 2.2-13.1-9.5-9.3 13.1-1.9z" fill="#4338ca" />
      <path d="M156 238c10-8 22-11 36-9m-38 21c14-6 30-7 46-3" fill="none" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
