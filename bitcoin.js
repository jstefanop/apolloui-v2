const bitcoin = require('litecoin');

(async () => {
  function getNodeStats(bitcoinClient) {
    const getBlockchainInfoPromise = new Promise((resolve, reject) => {
      bitcoinClient.getBlockchainInfo((error, blockchainInfo) => {
        if (error) {
          reject(error);
        } else {
          try {
            // Use bestblockhash to call bestBlock, to retrieve time of last block calculation
            const bestBlockHash = blockchainInfo.bestblockhash;
            bitcoinClient.getBlock(bestBlockHash, (error, block) => {
              if (error) {
                reject(error);
              } else {
                // Add blockTime to blockchainInfo
                blockchainInfo.blockTime = block.time;
                resolve(blockchainInfo);
              }
            });
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }
  const bitcoinClient = new bitcoin.Client({
    host: '192.168.86.38',
    port: 8332,
    user: 'futurebit',
    pass: 'DUYlI1Dqkve0',
    timeout: 3000,
    ssl: false,
  });
  const unrefinedStats = await getNodeStats(bitcoinClient);

  console.log(unrefinedStats);
})();
