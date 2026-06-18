// API endpoint to get runtime configuration.
// Values come from .env written on boot by backend/utils/set_UI_mode.sh.
// Reading them server-side (no NEXT_PUBLIC_ prefix needed) lets us change
// device state without rebuilding the Next.js app.

const parseUsbMiners = (raw) => {
  if (!raw || raw === 'none') return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const deriveMode = (chassis, hasInternalMiner, hasUsbMiners) => {
  if (chassis === 'apollo-iii') return hasUsbMiners ? 'apollo-iii+usb' : 'apollo-iii';
  if (chassis === 'apollo-ii') return 'apollo-ii';
  // solo-node chassis
  return hasUsbMiners ? 'solo-node+miner' : 'solo-node';
};

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const chassis =
    process.env.CHASSIS || process.env.NEXT_PUBLIC_CHASSIS || 'solo-node';
  const internalMiner =
    process.env.INTERNAL_MINER || process.env.NEXT_PUBLIC_INTERNAL_MINER || 'none';
  const usbMinersRaw =
    process.env.USB_MINERS || process.env.NEXT_PUBLIC_USB_MINERS || 'none';

  const usbMiners = parseUsbMiners(usbMinersRaw);
  const hasInternalMiner = internalMiner !== 'none';
  const hasUsbMiners = usbMiners.length > 0;
  const mode = deriveMode(chassis, hasInternalMiner, hasUsbMiners);

  // Legacy field for backward compat. Old code checks `deviceType === 'solo-node'`
  // to hide the Miner nav; mirror that semantics from the new flags.
  const deviceType =
    process.env.DEVICE_TYPE ||
    process.env.NEXT_PUBLIC_DEVICE_TYPE ||
    (mode === 'solo-node' ? 'solo-node' : 'miner');

  res.status(200).json({
    deviceType,
    chassis,
    internalMiner,
    usbMiners,
    hasInternalMiner,
    hasUsbMiners,
    mode,
    isHybrid: hasInternalMiner && hasUsbMiners,
  });
}
