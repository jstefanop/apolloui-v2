import fs from 'fs';
import path from 'path';

// Runtime device configuration.
//
// This has to be read from FILES, not from process.env. Next.js inlines every
// NEXT_PUBLIC_* reference at build time — including inside API routes, which are
// server code — so `process.env.NEXT_PUBLIC_CHASSIS` here compiles down to
// whatever the value was when `yarn build` ran. On a device that is mid-update
// that is baked in permanently: swap the board, re-flash, or lose BOARD_NAME to
// an apt upgrade, and the UI keeps insisting the hardware is what it used to be,
// with only a rebuild to fix it.
//
// /etc/armbian-release is the same source backend/utils/set_UI_mode.sh reads, so
// the two cannot drift apart. The .env it writes is the fallback for USB miners,
// which are detected by probing ports and cannot be re-derived here.

const ARMBIAN_RELEASE = '/etc/armbian-release';

// Keep in step with set_UI_mode.sh.
const CHASSIS_BY_BOARD = {
  'Apollo 3': 'apollo-iii',
  'Solo Node': 'solo-node',
};

const readFileSafe = (file) => {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    return null;
  }
};

const readShellVar = (contents, key) => {
  if (!contents) return null;
  const match = contents.match(new RegExp(`^\\s*${key}=(.*)$`, 'm'));
  if (!match) return null;
  return match[1].trim().replace(/^["']|["']$/g, '') || null;
};

const readBoardName = () => readShellVar(readFileSafe(ARMBIAN_RELEASE), 'BOARD_NAME');

// The UI's own .env, written at boot by set_UI_mode.sh.
const readUiEnv = (key) => {
  const cwd = process.cwd();
  for (const file of ['.env', '.env.local']) {
    const value = readShellVar(readFileSafe(path.join(cwd, file)), key);
    if (value) return value;
  }
  return null;
};

const isTruthy = (value) =>
  value != null && value !== '' && value !== 'false' && value !== '0';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const boardName = readBoardName();

  // Board name first — it is the hardware talking. The environment is the
  // development fallback, where there is no Armbian release file at all.
  const chassis =
    (boardName && CHASSIS_BY_BOARD[boardName]) ||
    readUiEnv('NEXT_PUBLIC_CHASSIS') ||
    process.env.CHASSIS ||
    process.env.NEXT_PUBLIC_CHASSIS ||
    null;

  const usbMiners =
    readUiEnv('NEXT_PUBLIC_USB_MINERS') ??
    process.env.USB_MINERS ??
    process.env.NEXT_PUBLIC_USB_MINERS;

  const deviceType =
    readUiEnv('NEXT_PUBLIC_DEVICE_TYPE') ||
    process.env.DEVICE_TYPE ||
    process.env.NEXT_PUBLIC_DEVICE_TYPE ||
    'miner';

  res.status(200).json({
    deviceType,
    chassis,
    // Presence is the signal — the script writes "true", but earlier builds wrote
    // a board name, so don't compare against a specific value.
    usbMiners: isTruthy(usbMiners),
  });
}
