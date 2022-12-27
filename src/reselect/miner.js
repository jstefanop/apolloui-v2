import { createSelector } from 'reselect';

const selectMiner = createSelector((data) => {
  console.log('HELLO', data);
  return data;
});

export default selectMiner;
