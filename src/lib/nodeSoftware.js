/**
 * Single source of truth for node software options.
 * When the backend adds a new version, add an entry here; no locale changes needed.
 * `vendor` groups the option (Bitcoin Core vs Knots) and `version` drives both the
 * displayed label and the newest-first ordering in the selector UI.
 */
export const NODE_SOFTWARE_OPTIONS = [
  { value: 'core_25_1', vendor: 'core', version: '25.1' },
  { value: 'core_28_1', vendor: 'core', version: '28.1', isDefault: true },
  { value: 'core_29_2', vendor: 'core', version: '29.2' },
  { value: 'core_31_0', vendor: 'core', version: '31.0' },
  { value: 'knots_29_2', vendor: 'knots', version: '29.2' },
  { value: 'knots_29_3', vendor: 'knots', version: '29.3' },
];

/** Display order and labels of the vendor groups. */
export const NODE_SOFTWARE_VENDORS = [
  { id: 'core', label: 'Bitcoin Core' },
  { id: 'knots', label: 'Bitcoin Knots' },
];

const vendorLabel = (vendor) =>
  (NODE_SOFTWARE_VENDORS.find((v) => v.id === vendor) || {}).label || vendor;

// "31.0" -> [31, 0] for numeric, segment-wise comparison
const parseVersion = (v) => String(v).split('.').map((n) => parseInt(n, 10) || 0);

const compareVersionsDesc = (a, b) => {
  const pa = parseVersion(a.version);
  const pb = parseVersion(b.version);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pb[i] || 0) - (pa[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

/**
 * Returns display label for a nodeSoftware value (e.g. from API).
 * Use for "Configured: {version}" and similar; no need to add translations per version.
 */
export function getNodeSoftwareLabel(value) {
  if (!value) return '';
  const option = NODE_SOFTWARE_OPTIONS.find((o) => o.value === value);
  if (option) return `${vendorLabel(option.vendor)} ${option.version}`;
  if (value.startsWith('core_')) return 'Bitcoin Core';
  if (value.startsWith('knots_')) return 'Bitcoin Knots';
  return value;
}

/**
 * Options grouped by vendor, each group's versions sorted newest-first.
 * Used by the node software selector UI.
 */
export function getGroupedNodeSoftware() {
  return NODE_SOFTWARE_VENDORS.map((v) => ({
    ...v,
    options: NODE_SOFTWARE_OPTIONS.filter((o) => o.vendor === v.id).sort(compareVersionsDesc),
  })).filter((g) => g.options.length > 0);
}
