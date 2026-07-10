export const KEYWORD_MAX_LENGTH = 100;

export function normalizeKeyword(keyword, rowNumber) {
  if (!keyword || typeof keyword !== 'string') {
    return {
      isValid: false,
      normalized: '',
      error: 'Empty keyword',
      rowNumber
    };
  }

  // Trim whitespace
  let normalized = keyword.trim();
  
  // Check length
  if (normalized.length === 0) {
    return {
      isValid: false,
      normalized: '',
      error: 'Empty keyword',
      rowNumber
    };
  }

  if (normalized.length > KEYWORD_MAX_LENGTH) {
    return {
      isValid: false,
      normalized: '',
      error: `Keyword exceeds maximum length of ${KEYWORD_MAX_LENGTH} characters`,
      rowNumber
    };
  }

  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Normalize line breaks
  normalized = normalized.replace(/\r\n|\r|\n/g, ' ');
  
  return {
    isValid: true,
    normalized: normalized.toLowerCase().trim(),
    original: normalized,
    rowNumber
  };
}

export function validateKeywords(keywords) {
  const results = [];
  const seenKeywords = new Set();
  
  keywords.forEach((keyword, index) => {
    const rowNumber = index + 1;
    const result = normalizeKeyword(keyword, rowNumber);
    
    if (!result.isValid) {
      results.push({
        ...result,
        isDuplicate: false
      });
    } else {
      const isDuplicate = seenKeywords.has(result.normalized);
      seenKeywords.add(result.normalized);
      
      results.push({
        ...result,
        isDuplicate
      });
    }
  });
  
  return results;
}

export function getKeywordStats(results) {
  const totalRows = results.length;
  const validKeywords = results.filter(r => r.isValid && !r.isDuplicate).length;
  const duplicates = results.filter(r => r.isDuplicate).length;
  const invalidRows = results.filter(r => !r.isValid).length;
  
  return {
    totalRows,
    validKeywords,
    duplicates,
    invalidRows,
    uniqueKeywords: validKeywords
  };
}