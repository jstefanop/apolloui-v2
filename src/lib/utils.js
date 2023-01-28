export const displayHashrate = (
  hashRate,
  unit = 'h',
  withUnit = true,
  precision = 2,
  returnObject = false
) => {
  var rate = 1000;
  precision = typeof precision === 'number' ? precision : 2;
  switch (unit) {
    case 'h':
      rate = 1;
      break;
    case 'kh':
      rate = 1000;
      break;
    case 'mh':
      rate = 1000000;
      break;
    case 'gh':
      rate = 1000000000;
      break;
    case 'th':
      rate = 1000000000000;
      break;
    default:
      rate = 1;
  }

  hashRate = hashRate * rate || 0;

  if (hashRate > 900000000000) {
    return withUnit
      ? parseFloat(hashRate / 1000000000000).toFixed(precision) + ' TH/s'
      : returnObject
      ? {
          value: parseFloat(hashRate / 1000000000000).toFixed(precision),
          unit: 'TH/s',
        }
      : parseFloat(parseFloat(hashRate / 1000000000000).toFixed(precision));
  } else if (hashRate > 900000000) {
    return withUnit
      ? parseFloat(hashRate / 1000000000).toFixed(precision) + ' GH/s'
      : returnObject
      ? {
          value: parseFloat(hashRate / 1000000000000).toFixed(precision),
          unit: 'GH/s',
        }
      : parseFloat(parseFloat(hashRate / 1000000000).toFixed(precision));
  } else if (hashRate > 900000) {
    return withUnit
      ? parseFloat(hashRate / 1000000).toFixed(precision) + ' MH/s'
      : returnObject
      ? {
          value: parseFloat(hashRate / 1000000000000).toFixed(precision),
          unit: 'MH/s',
        }
      : parseFloat(parseFloat(hashRate / 1000000).toFixed(precision));
  } else if (hashRate > 900) {
    return withUnit
      ? parseFloat(hashRate / 1000).toFixed(precision) + ' KH/s'
      : returnObject
      ? {
          value: parseFloat(hashRate / 1000000000000).toFixed(precision),
          unit: 'KH/s',
        }
      : parseFloat(parseFloat(hashRate / 1000).toFixed(precision));
  } else {
    return withUnit
      ? hashRate.toFixed(precision) + ' H/s'
      : returnObject
      ? {
          value: parseFloat(hashRate / 1000000000000).toFixed(precision),
          unit: 'H/s',
        }
      : hashRate.toFixed(precision);
  }
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

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${(withUnits) ? ' ' + sizes[i] : ''}`;
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
