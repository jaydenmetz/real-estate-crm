/**
 * HTML Entity Utilities
 * Centralized handling of HTML encoding/decoding to prevent display issues
 *
 * Problem: Text containing special characters (&, <, >, ", ') can be HTML-encoded
 * when saved to database, causing display issues like "0 &amp; Wagon Wheel Drive"
 *
 * Solution: Decode entities when displaying, never encode when saving user input
 */

/**
 * Decode HTML entities in a string
 * Converts &amp; → &, &lt; → <, &gt; → >, &quot; → ", etc.
 *
 * @param {string} html - String potentially containing HTML entities
 * @returns {string} Decoded string with actual characters
 */
export const decodeHTML = (html) => {
  if (!html || typeof html !== 'string') return html;

  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

/**
 * Decode HTML entities in an object's string values (recursive)
 * Useful for cleaning API responses or form data
 *
 * @param {Object} obj - Object with potentially encoded string values
 * @returns {Object} New object with decoded string values
 */
export const decodeHTMLInObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => decodeHTMLInObject(item));
  }

  const decoded = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      decoded[key] = decodeHTML(value);
    } else if (typeof value === 'object' && value !== null) {
      decoded[key] = decodeHTMLInObject(value);
    } else {
      decoded[key] = value;
    }
  }

  return decoded;
};

/**
 * Ensure a string is NOT HTML-encoded (for saving user input)
 * If string contains entities, decode them before saving
 *
 * @param {string} str - User input string
 * @returns {string} Plain text without HTML encoding
 */
export const ensurePlainText = (str) => {
  if (!str || typeof str !== 'string') return str;

  // Check if string contains HTML entities
  if (/&[a-z]+;|&#\d+;/i.test(str)) {
    return decodeHTML(str);
  }

  return str;
};

/**
 * Clean text for safe storage (without HTML encoding)
 * Use this before saving user input to database
 *
 * @param {string} text - User input text
 * @returns {string} Clean text ready for database storage
 */
export const cleanTextForStorage = (text) => {
  if (!text || typeof text !== 'string') return text;

  // Decode any entities that might exist
  const decoded = decodeHTML(text);

  // Trim whitespace
  return decoded.trim();
};
