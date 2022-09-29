require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.7",
  networks: {
    goerli: {
      url: "https://goerli.infura.io/v3/" + process.env.infuraApiKey,
      accounts: [process.env.account]
    }
  },
  etherscan: {
    apiKey: process.env.etherscanApiKey
  }
};
