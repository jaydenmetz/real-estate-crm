/**
 * HTML Utility Functions
 */

/**
 * Decode HTML entities in a string
 * Converts &amp; → &, &lt; → <, &gt; → >, etc.
 *
 * @param {string} str - String potentially containing HTML entities
 * @returns {string} - Decoded string
 */
export const decodeHTMLEntities = (str) => {
  if (!str || typeof str !== 'string') return str;

  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

/**
 * Encode HTML entities in a string (opposite of decode)
 * Converts & → &amp;, < → &lt;, > → &gt;, etc.
 *
 * @param {string} str - String to encode
 * @returns {string} - Encoded string
 */
export const encodeHTMLEntities = (str) => {
  if (!str || typeof str !== 'string') return str;

  const textarea = document.createElement('textarea');
  textarea.textContent = str;
  return textarea.innerHTML;
};
