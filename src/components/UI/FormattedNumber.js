import React from 'react';

const formatNumber = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const FormattedNumber = ({ value }) => {
  const formattedNumber = formatNumber(value);
  return (
    <React.Fragment>{formattedNumber}</React.Fragment>
  );
};

export default FormattedNumber;