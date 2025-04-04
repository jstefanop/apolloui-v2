import packageJson from '../../package.json';
import { MdOutlineUsb } from 'react-icons/md';
import { CgServer } from 'react-icons/cg';
import { Icon } from '@chakra-ui/react';

export const displayHashrate = (
  hashrate,
  unit = 'h',
  withUnit = true,
  precision = 2,
  returnObject = false
) => {
  const hashrateUnits = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s'];
  precision = typeof precision === 'number' ? precision : 2;
  let i = hashrateUnits.indexOf(unit);
  while (i > 0) {
    hashrate *= 1000;
    i--;
  }
  i = 0;
  while (hashrate >= 1000) {
    hashrate /= 1000;
    i++;
  }

  return withUnit
    ? `${parseFloat(hashrate).toFixed(precision)} ${hashrateUnits[i]}`
    : returnObject
    ? {
        value: parseFloat(hashrate).toFixed(precision),
        unit: hashrateUnits[i],
      }
    : parseFloat(parseFloat(hashrate).toFixed(precision));
};

export const convertHashrateStringToValue = (hashrateString, unit = 'GH/s') => {
  if (!hashrateString) return 0;
  let hashValue = parseFloat(hashrateString);
  let multiplier = 1;

  // Find the multiplier
  if (hashrateString.toUpperCase().includes('K')) {
    multiplier = 1e3;
  } else if (hashrateString.toUpperCase().includes('M')) {
    multiplier = 1e6;
  } else if (hashrateString.toUpperCase().includes('G')) {
    multiplier = 1e9;
  } else if (hashrateString.toUpperCase().includes('T')) {
    multiplier = 1e12;
  } else if (hashrateString.toUpperCase().includes('P')) {
    multiplier = 1e15;
  }

  switch (unit.toUpperCase()) {
    case 'H/S':
      return hashValue * multiplier;
    case 'KH/S':
      return (hashValue * multiplier) / 1e3;
    case 'MH/S':
      return (hashValue * multiplier) / 1e6;
    case 'GH/S':
      return (hashValue * multiplier) / 1e9;
    case 'TH/S':
      return (hashValue * multiplier) / 1e12;
    case 'PH/S':
      return (hashValue * multiplier) / 1e15;
    default:
      return (hashValue * multiplier) / 1e9;
  }
};

export const numberToText = (number) => {
  let text = '';
  const units = ['quadrillion', 'trillion', 'billion', 'million', 'thousand'];
  const values = [1000000000000000, 1000000000000, 1000000000, 1000000, 1000];
  for (let i = 0; i < units.length; i++) {
    if (number >= values[i]) {
      text = `${Math.floor(number / values[i])} ${units[i]}`;
      break;
    }
  }
  if (!text) {
    text = `${number}`;
  }
  return `About ${text}`;
};

export const percentColor = (value) => {
  return value <= 40
    ? '#03a9f4'
    : value <= 55
    ? '#8bc34a'
    : value <= 70
    ? '#ffab00'
    : value <= 85
    ? '#ff5722'
    : '#f44336';
};

export const bytesToSize = (bytes, decimals = 2, withUnits = true) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${
    withUnits ? ' ' + sizes[i] : ''
  }`;
};

export const tempColor = (value) => {
  if (value && value < 60) return 'primary';
  else if (value >= 60 && value < 75) return 'success';
  else if (value >= 75 && value < 85) return 'warning';
  else if (value >= 85) return 'danger';
};

export const powerColor = (value) => {
  if (value && value < 200) return 'primary';
  else if (value >= 200 && value < 250) return 'success';
  else if (value >= 250 && value < 300) return 'warning';
  else if (value >= 300) return 'danger';
};

export const minerModeIcon = (mode) => {
  switch (mode) {
    case 'eco':
      return 'fa-leaf';
    case 'balanced':
      return 'fa-balance-scale';
    case 'turbo':
      return 'fa-rocket';
    case 'custom':
      return 'fa-diagnoses';
    default:
      return 'fa-leaf';
  }
};

export const convertTemp = (celsius, unit, addUnit) => {
  let temp = celsius || 0;
  if (unit === 'f') temp = (temp * 9) / 5 + 32;
  if (addUnit) return temp.toFixed(2) + '°' + unit.toUpperCase();
  return parseFloat(temp.toFixed(2));
};

export const isValidBitcoinAddress = (address) => {
  // Separate the main address from the additional string if it exists
  const [mainAddress, additionalString] = address.split('.');

  // Regex for valid Bitcoin addresses:
  // - '1' or '3': legacy and segwit (P2PKH, P2SH)
  // - 'bc1': bech32 (P2WPKH, P2WSH, P2TR)
  const addressRegex = /^(1|3)[a-zA-HJ-NP-Z0-9]{25,34}$|^(bc1)[a-zA-HJ-NP-Z0-9]{39,60}$/;

  // Validate the main address
  if (!addressRegex.test(mainAddress)) {
    return false;
  }

  // If there's an additional string, ensure it contains only alphanumeric characters
  if (additionalString && !/^[a-zA-Z0-9]+$/.test(additionalString)) {
    return false;
  }

  return true;
};

export const isTaprootAddress = (address) => {
  // Separate the main address from the additional string if it exists
  const [mainAddress, additionalString] = address.split('.');

  // Pattern for Bitcoin Taproot address (bc1p with 38 additional characters)
  const taprootPattern = /^bc1p[0-9a-zA-Z]{38}$/;

  // Validate the main address
  if (!taprootPattern.test(mainAddress)) {
    return false;
  }

  // If there's an additional string, ensure it contains only alphanumeric characters
  if (additionalString && !/^[a-zA-Z0-9]+$/.test(additionalString)) {
    return false;
  }

  return true;
};

export const isCompatibleBitcoinAddress = (address) => {
  // Separate the main address from the additional string if it exists
  const [mainAddress, additionalString] = address.split('.');

  // Validate the main address
  if (mainAddress.startsWith('bc1q')) {
    // P2WPKH (Bech32)
    if (mainAddress.length === 42) {
      return true;
      // P2WSH (Bech32)
    } else if (mainAddress.length === 62) {
      return false;
    }
    // P2TR (Taproot)
  } else if (mainAddress.startsWith('bc1p') && mainAddress.length === 62) {
    return false;
  }

  // If there's an additional string, ensure it contains only alphanumeric characters
  if (additionalString && !/^[a-zA-Z0-9]+$/.test(additionalString)) {
    return false;
  }

  return true;
};

export const presetPools = [
  {
    name: 'Ocean.xyz',
    url: 'stratum+tcp://mine.ocean.xyz:3334',
    webUrl: 'https://www.ocean.xyz/',
  },
  {
    name: 'Braiins',
    url: 'stratum+tcp://stratum.braiins.com:3333',
    webUrl: 'https://braiins.com/pool',
  },
  {
    id: 'custom',
    name: 'Setup Custom Pool',
  },
];

export const shortenBitcoinAddress = (address, chars = 5) => {
  if (!address) return null;
  if (address.length <= chars * 2) {
    return address; // Return the address unchanged if it's already shorter or equal to 10 characters
  } else {
    const prefix = address.substring(0, chars);
    const suffix = address.substring(address.length - chars);
    return prefix + '...' + suffix;
  }
};

export const getVersionFromPackageJson = () => {
  try {
    // Return the version
    const version = packageJson.version;
    return version;
  } catch (error) {
    console.error(
      'Error reading the package.json file. Make sure the file exists and is valid JSON.',
      error
    );
    return null;
  }
};

export const getNodeErrorMessage = (error) => {
  let parsedError;
  let sentence = null;
  let type = 'warning';
  if (!error.length) return { sentence, type };

  parsedError = error[0].message || error[0].code || 'Unknown error';
  sentence = `There was an error getting stats for Node: ${parsedError}`;

  if (error[0].code === 'ECONNREFUSED') {
    sentence = 'Connection refused. Your node is not running.';
  }

  if (error[0].type === 'authentication') {
    sentence = 'Waiting for node response...';
    type = 'info';
  }

  if (error[0].code === '-28') {
    sentence = 'Your node is starting up...';
    type = 'info';
  }

  return { sentence, type };
};

export const getMinerHashboardType = (comport) => {
  if (comport && comport.includes('ttyS1')) {
    return (
      <>
        Internal <Icon as={CgServer} ml="2" />
      </>
    );
  }
  return (
    <>
      External <Icon as={MdOutlineUsb} ml="2" />
    </>
  );
};

export const filterRecentShares = (dataArray, intervalInSeconds) => {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  const cutoffTimeInSeconds = currentTimeInSeconds - intervalInSeconds;

  return _.filter(dataArray, item => item.lastshare >= cutoffTimeInSeconds);
};
