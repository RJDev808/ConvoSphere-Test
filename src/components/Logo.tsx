// src/components/Logo.tsx

// A reusable, unique SVG logo component for brand consistency.
export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#4f46e5' }} /> 
          <stop offset="100%" style={{ stopColor: '#a855f7' }} /> 
        </linearGradient>
      </defs>
      <path
        fill="url(#logoGradient)"
        d="M50 10 C 27.9 10 10 27.9 10 50 C 10 72.1 27.9 90 50 90 C 58.5 90 66.4 87.5 73 83.2 L 73 69.8 C 67.2 73.4 60.9 75.8 54.2 75.8 C 38 75.8 25.2 63 25.2 46.8 C 25.2 30.6 38 17.8 54.2 17.8 C 60.9 17.8 67.2 20.2 73 23.8 L 73 10.4 C 66.4 6.1 58.5 4.2 50 4.2 L 50 10 Z M 90 50 C 90 38.3 84.1 27.8 75.8 21.1 L 62.4 21.1 C 68.2 26.9 71.6 34.6 71.6 43.2 C 71.6 51.8 68.2 59.5 62.4 65.3 L 75.8 65.3 C 84.1 58.6 90 48.1 90 50 Z"
      />
    </svg>
  );
}
