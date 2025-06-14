// components/HashtagText.jsx
"use client";

import { useRouter } from "next/navigation";

export default function HashtagText({ text, className = "" }) {
  const router = useRouter();

  const handleHashtagClick = (e, hashtag) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/search?q=${encodeURIComponent(hashtag)}`);
  };

  const renderTextWithHashtags = (text) => {
    if (!text || typeof text !== "string") return text;

    // Split text by hashtags while preserving them
    const parts = text.split(/(#\w+)/g);

    return parts.map((part, index) => {
      if (part.match(/^#\w+$/)) {
        // This is a hashtag
        return (
          <span
            key={index}
            onClick={(e) => handleHashtagClick(e, part)}
            className="text-blue-500 hover:text-blue-600 hover:underline cursor-pointer"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return <span className={className}>{renderTextWithHashtags(text)}</span>;
}
