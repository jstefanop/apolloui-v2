import packageJson from '../../package.json';
import { MdOutlineUsb } from 'react-icons/md';
import { CgServer } from 'react-icons/cg';
import { Icon, useColorModeValue } from '@chakra-ui/react';
import _ from 'lodash';

export const displayHashrate = (
  hashrate,
  unit = 'h',
  withUnit = true,
  precision = 2,
  returnObject = false
) => {
  const hashrateUnits = [
    'H/s',
    'KH/s',
    'MH/s',
    'GH/s',
    'TH/s',
    'PH/s',
    'EH/s',
    'ZH/s',
  ];
  precision = typeof precision === 'number' ? precision : 2;
  let i = hashrateUnits.indexOf(unit);
  while (i > 0) {
    hashrate *= 1000;
    i--;
  }
  i = 0;
  while (hashrate >= 1000 && i < hashrateUnits.length - 1) {
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
  } else if (hashrateString.toUpperCase().includes('E')) {
    multiplier = 1e18;
  } else if (hashrateString.toUpperCase().includes('Z')) {
    multiplier = 1e21;
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
    case 'EH/S':
      return (hashValue * multiplier) / 1e18;
    case 'ZH/S':
      return (hashValue * multiplier) / 1e21;
    default:
      return (hashValue * multiplier) / 1e9;
  }
};

export const numberToText = (num, intl) => {
  if (num < 1e6)
    return `${Math.ceil(num)}`; // Less than 1 million

  const units = [
    { value: 1e12, name: intl.formatMessage({ id: 'utils.units.trillions' }) },
    { value: 1e9, name: intl.formatMessage({ id: 'utils.units.billions' }) },
    { value: 1e6, name: intl.formatMessage({ id: 'utils.units.millions' }) },
  ];

  for (const unit of units) {
    if (num >= unit.value) {
      const value = (num / unit.value).toFixed(1);
      return `${intl.formatMessage({ id: 'utils.about' })} ${value} ${
        unit.name
      }`;
    }
  }

  return `${Math.ceil(num)}`; // Fallback for very small numbers
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
  const addressRegex =
    /^(1|3)[a-zA-HJ-NP-Z0-9]{25,34}$|^(bc1)[a-zA-HJ-NP-Z0-9]{39,60}$/;

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

export const getNodeErrorMessage = (error, intl) => {
  let parsedError;
  let sentence = null;
  let type = 'warning';
  if (!error?.length) return { sentence, type };

  // Default message if intl is not provided
  const getMessage = (id, values = {}) => {
    if (!intl) return id;
    return intl.formatMessage({ id }, values);
  };

  // Extract error from first error object
  const firstError = error[0];
  
  // Check for RPC error structure: data.error.message
  let errorMessage = firstError.message;
  let errorCode = firstError.code;
  
  if (firstError.data?.error?.message) {
    errorMessage = firstError.data.error.message;
    errorCode = firstError.data.error.code || errorCode;
  }

  parsedError = errorMessage || errorCode || getMessage('node.error.unknown');
  sentence = getMessage('node.error.stats', { error: parsedError });

  if (errorCode === 'ECONNREFUSED' || firstError.code === 'ECONNREFUSED') {
    sentence = getMessage('node.error.connection_refused');
  }

  if (errorCode === 'ERR_BAD_RESPONSE' || firstError.code === 'ERR_BAD_RESPONSE') {
    sentence = getMessage('node.error.bad_response');
  }

  if (firstError.type === 'authentication') {
    sentence = getMessage('node.error.waiting_response');
    type = 'info';
  }

  // Check for code -28 (can be string or number)
  if (errorCode === '-28' || errorCode === -28 || firstError.code === '-28' || firstError.code === -28) {
    sentence = errorMessage || getMessage('node.error.starting_up');
    type = 'info';
  }

  // If we have a message from data.error.message, use it directly
  if (firstError.data?.error?.message) {
    sentence = errorMessage;
    // Set type based on error code if available
    if (errorCode === '-28' || errorCode === -28) {
      type = 'info';
    }
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

  return _.filter(dataArray, (item) => item.lastshare >= cutoffTimeInSeconds);
};

export const workerIsActive = (lastshare, intervalInSeconds) => {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  const cutoffTimeInSeconds = currentTimeInSeconds - intervalInSeconds;

  return lastshare >= cutoffTimeInSeconds;
};

export const capitalizeFirstLetter = (val) => {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
};

export const formatTemperature = (tempCelsius, unit = 'c', precision = 1) => {
  if (tempCelsius === null || tempCelsius === undefined) return 'n.a.';

  if (unit === 'f') {
    // Convert to Fahrenheit: (°C × 9/5) + 32 = °F
    const tempFahrenheit = (tempCelsius * 9) / 5 + 32;
    return `${tempFahrenheit.toFixed(precision)}°F`;
  }

  // Default or 'C' unit
  return `${tempCelsius.toFixed(precision)}°C`;
};

export const calculateWattsPerTh = (powerWatts, hashrateTh) => {
  if (!powerWatts || !hashrateTh || hashrateTh === 0) return 0;
  
  const wattsPerTh = powerWatts / hashrateTh;
  return Math.round(wattsPerTh * 100) / 100; // Round to 2 decimal places
};

export const calculatePerBlockChance = (
  hashrateInGhs,
  networkHashrateInHashes
) => {
  if (!hashrateInGhs || !networkHashrateInHashes) return null;
  // Convert hashrate to hashes per second
  const hashrateInHashes = hashrateInGhs * 1e9;
  // Calculate probability (1 in X format)
  return (networkHashrateInHashes / hashrateInHashes);
};

export const calculateDailyChance = (
  hashrateInGhs,
  networkHashrateInHashes
) => {
  if (!hashrateInGhs || !networkHashrateInHashes) return null;
  const perBlockChance = calculatePerBlockChance(hashrateInGhs, networkHashrateInHashes);
  return perBlockChance / 144; // 144 blocks per day
};

export const calculateMonthlyChance = (
  hashrateInGhs,
  networkHashrateInHashes
) => {
  if (!hashrateInGhs || !networkHashrateInHashes) return null;
  const perBlockChance = calculatePerBlockChance(hashrateInGhs, networkHashrateInHashes);
  return perBlockChance / (144 * 30); // 144 blocks per day * 30 days
};

export const calculateYearlyChance = (
  hashrateInGhs,
  networkHashrateInHashes
) => {
  if (!hashrateInGhs || !networkHashrateInHashes) return null;
  const perBlockChance = calculatePerBlockChance(hashrateInGhs, networkHashrateInHashes);
  return perBlockChance / (144 * 365); // 144 blocks per day * 365 days
};

export const flattenMessages = (nestedMessages, prefix = '') => {
  return Object.keys(nestedMessages).reduce((messages, key) => {
    const value = nestedMessages[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      messages[prefixedKey] = value;
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey));
    }

    return messages;
  }, {});
};

export const dailyChanceRanges = [
  { max: 1000, color: 'green.700', bars: 5 },
  { max: 5000, color: 'green.400', bars: 5 },
  { max: 10000, color: 'green.200', bars: 5 },
  { max: 100000, color: 'blue.600', bars: 4 },
  { max: 300000, color: 'blue.400', bars: 4 },
  { max: 500000, color: 'blue.200', bars: 4 },
  { max: 1000000, color: 'orange.200', bars: 3 },
  { max: 10000000, color: 'orange.400', bars: 2 },
  { max: Infinity, color: 'red.600', bars: 1 },
];

export const useDailyChanceVisualization = (chance) => {
  const textColor = useColorModeValue('brand.900', 'white');
  
  if (!chance)
    return { text: 'N/A', color: 'gray.500', bars: Array(5).fill('gray.500') };

  const formattedValue = `1 in ${chance.toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })}`;

  const range = dailyChanceRanges.find(r => chance <= r.max) || dailyChanceRanges[dailyChanceRanges.length - 1];
  const activeBars = range.bars;
  const activeColor = range.color;

  const bars = Array(5)
    .fill('gray.500')
    .map((_, index) => (index < activeBars ? activeColor : 'gray.500'));

  return {
    text: formattedValue,
    color: textColor,
    bars,
  };
};

export const useDailyChanceVisualizations = (data, networkhashps) => {
  // Calculate all daily chances first
  const dailyChances = data.map(element => {
    if (!element?.hashrate5m || !networkhashps) return null;
    const hashrateValue = convertHashrateStringToValue(element.hashrate5m, 'GH/s');
    return calculateDailyChance(hashrateValue, networkhashps);
  });

  // Create individual hooks for each daily chance
  const visualization0 = useDailyChanceVisualization(dailyChances[0] || 0);
  const visualization1 = useDailyChanceVisualization(dailyChances[1] || 0);
  const visualization2 = useDailyChanceVisualization(dailyChances[2] || 0);
  const visualization3 = useDailyChanceVisualization(dailyChances[3] || 0);
  const visualization4 = useDailyChanceVisualization(dailyChances[4] || 0);
  const visualization5 = useDailyChanceVisualization(dailyChances[5] || 0);
  const visualization6 = useDailyChanceVisualization(dailyChances[6] || 0);
  const visualization7 = useDailyChanceVisualization(dailyChances[7] || 0);
  const visualization8 = useDailyChanceVisualization(dailyChances[8] || 0);
  const visualization9 = useDailyChanceVisualization(dailyChances[9] || 0);

  // Combine all visualizations, replacing null values with the default visualization
  const visualizations = [
    dailyChances[0] ? visualization0 : null,
    dailyChances[1] ? visualization1 : null,
    dailyChances[2] ? visualization2 : null,
    dailyChances[3] ? visualization3 : null,
    dailyChances[4] ? visualization4 : null,
    dailyChances[5] ? visualization5 : null,
    dailyChances[6] ? visualization6 : null,
    dailyChances[7] ? visualization7 : null,
    dailyChances[8] ? visualization8 : null,
    dailyChances[9] ? visualization9 : null,
  ];

  return visualizations;
};
