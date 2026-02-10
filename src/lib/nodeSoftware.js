/**
 * Single source of truth for node software options.
 * When the backend adds a new version, add it here; no locale changes needed.
 */
export const NODE_SOFTWARE_OPTIONS = [
  { value: 'core_25_1', label: 'Bitcoin Core 25.1' },
  { value: 'core_28_1', label: 'Bitcoin Core 28.1 (Default)' },
  { value: 'core_29_2', label: 'Bitcoin Core 29.2' },
  { value: 'knots_29_2', label: 'Bitcoin Knots 29.2' },
];

/**
 * Returns display label for a nodeSoftware value (e.g. from API).
 * Use for "Configured: {version}" and similar; no need to add translations per version.
 */
export function getNodeSoftwareLabel(value) {
  if (!value) return '';
  const option = NODE_SOFTWARE_OPTIONS.find((o) => o.value === value);
  if (option) return option.label;
  if (value.startsWith('core_')) return 'Bitcoin Core';
  if (value.startsWith('knots_')) return 'Bitcoin Knots';
  return value;
}
