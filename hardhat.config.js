require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-ganache");
require("@nomiclabs/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.7",
  networks: {
    rinkeby: {
      url: process.env.url,
      accounts: [process.env.accounts]
    }
  },
  etherscan: {
    apiKey: process.env.apiKey
  }
};
