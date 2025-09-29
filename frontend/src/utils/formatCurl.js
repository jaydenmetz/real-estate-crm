// Utility to format curl commands with proper line breaks for readability
export const formatCurlCommand = (curlCommand) => {
  if (!curlCommand || typeof curlCommand !== 'string') return '';

  // If already formatted with backslashes, return as is
  if (curlCommand.includes(' \\\n')) {
    return curlCommand;
  }

  // Parse the curl command
  let formatted = curlCommand;

  // Extract the base command and URL
  const urlMatch = formatted.match(/^curl\s+(-X\s+\w+\s+)?"([^"]+)"/);
  if (!urlMatch) {
    // Try without quotes
    const urlMatchNoQuotes = formatted.match(/^curl\s+(-X\s+\w+\s+)?(\S+)/);
    if (!urlMatchNoQuotes) return curlCommand;
  }

  // Split into components
  const parts = [];

  // Extract method if present
  const methodMatch = formatted.match(/curl\s+-X\s+(\w+)/);
  if (methodMatch) {
    formatted = formatted.replace(/-X\s+\w+\s*/, '');
  }

  // Extract URL
  const urlPattern = /curl\s+"([^"]+)"|curl\s+(\S+)/;
  const urlExtract = formatted.match(urlPattern);
  if (urlExtract) {
    const url = urlExtract[1] || urlExtract[2];
    parts.push(`curl ${methodMatch ? `-X ${methodMatch[1]} ` : ''}'${url}'`);
    formatted = formatted.replace(urlPattern, '');
  }

  // Extract headers
  const headerPattern = /-H\s+"([^"]+)"/g;
  const headers = [...formatted.matchAll(headerPattern)];
  headers.forEach(header => {
    parts.push(`  -H '${header[1]}'`);
  });

  // Extract data
  const dataPattern = /-d\s+'([^']+)'|-d\s+"([^"]+)"/;
  const dataMatch = formatted.match(dataPattern);
  if (dataMatch) {
    const data = dataMatch[1] || dataMatch[2];
    // Format JSON data if present
    try {
      const jsonData = JSON.parse(data);
      const formattedJson = JSON.stringify(jsonData, null, 2);
      // For single-line JSON, keep it inline
      if (!formattedJson.includes('\n')) {
        parts.push(`  -d '${data}'`);
      } else {
        // For multi-line JSON, use a different format
        parts.push(`  -d '${data}'`);
      }
    } catch {
      // Not JSON, keep as is
      parts.push(`  -d '${data}'`);
    }
  }

  // Join with backslash continuation
  return parts.join(' \\\n');
};

// Format curl for display (with syntax highlighting)
export const formatCurlForDisplay = (curlCommand) => {
  const formatted = formatCurlCommand(curlCommand);
  if (!formatted) return '';

  // Add syntax highlighting classes (for future use)
  return formatted
    .replace(/(curl|'https?:\/\/[^']+')/, '<span class="curl-url">$1</span>')
    .replace(/(-X|-H|-d)/g, '<span class="curl-flag">$1</span>')
    .replace(/(GET|POST|PUT|DELETE|PATCH)/g, '<span class="curl-method">$1</span>');
};