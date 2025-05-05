// Logo.jsx
function Logo({ width, height, alt, className }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 99 108"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={alt || "Logo"}
      className={className}
    >
      <path
        d="M19.5 1.5H1L32 58.5C37.2 66.1 41.8333 61.6667 43.5 58.5L48 48.5V45.5L47.5 43.5L33.5 12.5C30 4 23.5 2.16667 19.5 1.5Z"
        fill="currentColor"
      />
      <path
        d="M39.5 98.5V71.5L69 7.5C70.6 2.7 76.5 1.16667 79.5 1H97.5L65.5 63.5L62 72V107.5H46C41.2 106.3 39.6667 101 39.5 98.5Z"
        fill="currentColor"
      />
      <path
        d="M19.5 1.5H1L32 58.5C37.2 66.1 41.8333 61.6667 43.5 58.5L48 48.5V45.5L47.5 43.5L33.5 12.5C30 4 23.5 2.16667 19.5 1.5Z"
        stroke="currentColor"
      />
      <path
        d="M39.5 98.5V71.5L69 7.5C70.6 2.7 76.5 1.16667 79.5 1H97.5L65.5 63.5L62 72V107.5H46C41.2 106.3 39.6667 101 39.5 98.5Z"
        stroke="currentColor"
      />
    </svg>
  );
}

export default Logo;
