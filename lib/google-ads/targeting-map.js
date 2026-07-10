export const GEO_TARGET_MAP = {
  'US': { criterionId: '2840', name: 'United States' },
  'GB': { criterionId: '2826', name: 'United Kingdom' },
  'CA': { criterionId: '2124', name: 'Canada' },
  'AU': { criterionId: '2036', name: 'Australia' },
  'PK': { criterionId: '2586', name: 'Pakistan' },
  'IN': { criterionId: '2356', name: 'India' },
  'AE': { criterionId: '2784', name: 'United Arab Emirates' },
  'DE': { criterionId: '2276', name: 'Germany' },
  'FR': { criterionId: '2250', name: 'France' },
  'ES': { criterionId: '2724', name: 'Spain' },
  'IT': { criterionId: '2380', name: 'Italy' },
  'NL': { criterionId: '2528', name: 'Netherlands' },
};

export const LANGUAGE_TARGET_MAP = {
  'en': { criterionId: '1000', name: 'English' },
  'es': { criterionId: '1003', name: 'Spanish' },
  'fr': { criterionId: '1002', name: 'French' },
  'de': { criterionId: '1001', name: 'German' },
  'it': { criterionId: '1004', name: 'Italian' },
};

export const NETWORK_MAP = {
  'SEARCH': 1,
  'DISPLAY': 2,
  'SEARCH_AND_DISPLAY': 3,
};

export function getGeoTargetResource(countryCode) {
  const geo = GEO_TARGET_MAP[countryCode];
  if (!geo) {
    throw new Error(`No Google Ads geo target mapping for country code: ${countryCode}`);
  }
  return `geoTargetConstants/${geo.criterionId}`;
}

export function getLanguageResource(languageCode) {
  const lang = LANGUAGE_TARGET_MAP[languageCode];
  if (!lang) {
    throw new Error(`No Google Ads language target mapping for language code: ${languageCode}`);
  }
  return `languageConstants/${lang.criterionId}`;
}

export function getKeywordPlanNetwork(network) {
  const networkValue = NETWORK_MAP[network];
  if (networkValue === undefined) {
    throw new Error(`No Google Ads network mapping for: ${network}`);
  }
  return networkValue;
}

export function validateTargeting(countryCode, languageCode, network) {
  const errors = [];
  if (!GEO_TARGET_MAP[countryCode]) {
    errors.push(`Unsupported country code: ${countryCode}`);
  }
  if (!LANGUAGE_TARGET_MAP[languageCode]) {
    errors.push(`Unsupported language code: ${languageCode}`);
  }
  if (NETWORK_MAP[network] === undefined) {
    errors.push(`Unsupported network: ${network}`);
  }
  return errors;
}
