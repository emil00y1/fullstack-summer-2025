// utils/hashtagUtils.js

/**
 * Extract hashtags from text content
 * @param {string} text - The text to extract hashtags from
 * @returns {string[]} Array of hashtag names (without the # symbol)
 */
export function extractHashtags(text) {
  if (!text || typeof text !== "string") return [];

  // Match hashtags: # followed by word characters (letters, numbers, underscore)
  // Must be at word boundary to avoid matching parts of words
  const hashtagRegex = /(?:^|\s)#(\w+)/g;
  const hashtags = [];
  let match;

  while ((match = hashtagRegex.exec(text)) !== null) {
    const hashtag = match[1].toLowerCase();
    // Avoid duplicates
    if (!hashtags.includes(hashtag)) {
      hashtags.push(hashtag);
    }
  }

  return hashtags;
}

/**
 * Convert text content to HTML with clickable hashtags
 * @param {string} text - The text content
 * @returns {string} HTML string with clickable hashtag links
 */
export function renderHashtagsAsLinks(text) {
  if (!text || typeof text !== "string") return text;

  // Replace hashtags with clickable links
  return text.replace(/(?:^|\s)(#\w+)/g, (match, hashtag) => {
    const hashtagName = hashtag.substring(1); // Remove the #
    return match.replace(
      hashtag,
      `<a href="/search?q=${encodeURIComponent(
        hashtag
      )}" class="text-blue-500 hover:text-blue-600 hover:underline">${hashtag}</a>`
    );
  });
}

/**
 * Validate hashtag name
 * @param {string} hashtag - The hashtag to validate
 * @returns {boolean} True if valid
 */
export function isValidHashtag(hashtag) {
  if (!hashtag || typeof hashtag !== "string") return false;

  // Hashtag should be 1-50 characters, contain only alphanumeric and underscores
  const validPattern = /^[a-zA-Z0-9_]{1,50}$/;
  return validPattern.test(hashtag);
}

/**
 * Format hashtag for database storage (lowercase, no #)
 * @param {string} hashtag - The hashtag to format
 * @returns {string} Formatted hashtag
 */
export function formatHashtagForStorage(hashtag) {
  if (!hashtag || typeof hashtag !== "string") return "";

  // Remove # if present and convert to lowercase
  return hashtag.replace(/^#/, "").toLowerCase().trim();
}

/**
 * Format hashtag for display (with #)
 * @param {string} hashtag - The hashtag to format
 * @returns {string} Formatted hashtag with #
 */
export function formatHashtagForDisplay(hashtag) {
  if (!hashtag || typeof hashtag !== "string") return "";

  const formatted = formatHashtagForStorage(hashtag);
  return formatted ? `#${formatted}` : "";
}
