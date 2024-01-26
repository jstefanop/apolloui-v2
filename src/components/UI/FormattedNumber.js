import React from 'react';

const formatNumber = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const FormattedNumber = ({ number }) => {
  const formattedNumber = formatNumber(number);
  return (
    <div>{formattedNumber}</div>
  );
};

export default FormattedNumber;