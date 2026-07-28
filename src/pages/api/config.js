// Runtime device configuration.
//
// NEXT_PUBLIC_* variables are inlined at build time, so reading them in the
// browser would pin the UI to whatever the hardware looked like when it was
// built — and rebuilding on an aarch64 device takes minutes. This route runs
// server-side on every request, so it sees the live environment: backend/utils/
// set_UI_mode.sh writes the file at boot and only the service needs restarting.
//
// The variables it writes (see that script) are the only source of truth here:
//   NEXT_PUBLIC_CHASSIS     "apollo-iii" | "solo-node" | absent on Apollo I/II
//   NEXT_PUBLIC_USB_MINERS  set when external USB boards were detected
//
// Absence is meaningful, not unknown: rc.local only runs the detection script for
// Solo Node and Apollo III, so "no chassis" identifies a legacy Apollo I/II.
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const deviceType = process.env.DEVICE_TYPE || process.env.NEXT_PUBLIC_DEVICE_TYPE || 'miner';
  const chassis = process.env.CHASSIS || process.env.NEXT_PUBLIC_CHASSIS || null;
  const usbMiners = process.env.USB_MINERS || process.env.NEXT_PUBLIC_USB_MINERS || null;

  res.status(200).json({
    deviceType,
    chassis,
    // Presence is the signal — the script writes "true", but earlier builds wrote
    // a board name, so don't compare against a specific value.
    usbMiners: usbMiners != null && usbMiners !== '' && usbMiners !== 'false',
  });
}
