export const displayHashrate = (
  hashRate,
  unit = 'h',
  withUnit = true,
  precision = 2
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
      ? parseFloat(hashRate / 1000000000000).toFixed(precision) + ' Th/s'
      : parseFloat(parseFloat(hashRate / 1000000000000).toFixed(precision));
  } else if (hashRate > 900000000) {
    return withUnit
      ? parseFloat(hashRate / 1000000000).toFixed(precision) + ' Gh/s'
      : parseFloat(parseFloat(hashRate / 1000000000).toFixed(precision));
  } else if (hashRate > 900000) {
    return withUnit
      ? parseFloat(hashRate / 1000000).toFixed(precision) + ' Mh/s'
      : parseFloat(parseFloat(hashRate / 1000000).toFixed(precision));
  } else if (hashRate > 900) {
    return withUnit
      ? parseFloat(hashRate / 1000).toFixed(precision) + ' Kh/s'
      : parseFloat(parseFloat(hashRate / 1000).toFixed(precision));
  } else {
    return withUnit
      ? hashRate.toFixed(precision) + ' H/s'
      : hashRate.toFixed(precision);
  }
};

export const bytesToSize = (bytes) => {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

export const percentColor = (percent, inverse = false) => {
  if (inverse) {
    if (percent && percent < 25) return 'danger';
    else if (percent >= 25 && percent < 50) return 'warning';
    else if (percent >= 50 && percent < 75) return 'primary';
    else if (percent >= 75) return 'success';
  }

  if (percent && percent < 25) return 'primary';
  else if (percent >= 25 && percent < 50) return 'success';
  else if (percent >= 50 && percent < 75) return 'warning';
  else if (percent >= 75) return 'danger';
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
