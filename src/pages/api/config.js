// API endpoint to get runtime configuration
// This allows changing DEVICE_TYPE without rebuilding the app
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Read DEVICE_TYPE from environment (without NEXT_PUBLIC_ prefix)
  // This variable is read at runtime, not at build time
  const deviceType = process.env.DEVICE_TYPE || process.env.NEXT_PUBLIC_DEVICE_TYPE || 'miner';

  res.status(200).json({
    deviceType,
  });
}

