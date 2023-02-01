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

export const numberToText = (number) => {
  let text = '';
  const units = ['quadrillions', 'trillions', 'billions', 'millions', 'thousands'];
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
