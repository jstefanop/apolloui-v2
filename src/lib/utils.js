import packageJson from '../../package.json';

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
  // Bitcoin addresses are alphanumeric and start with either '1', '3', or 'bc1'
  const addressRegex = /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/;

  return addressRegex.test(address);
};

export const isTaprootAddress = (address) => {
  // Pattern for Bitcoin Taproot address
  const taprootPattern = /^bc1p[0-9a-zA-Z]{38}$/;

  return taprootPattern.test(address);
};

export const isCompatibleBitcoinAddress = (address) => {
  if (address.startsWith('bc1q')) {
    // P2WPKH
    if (address.length === 42) {
      return false;
      // P2WSH
    } else if (address.length === 62) {
      return false;
    }
    // P2TR
  } else if (address.startsWith('bc1p') && address.length === 62) {
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
