/**
 * /* hardhat.config.js
 *
 * @format
 */
require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

const { API_KEY, PRIVATE_KEY } = process.env;

module.exports = {
  defaultNetwork: "Velas",
  networks: {
    velas: {
      url: "https://explorer.testnet.velas.com/rpc",
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.6.3",
      },
      {
        version: "0.8.17",
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: API_KEY,
  },
};
