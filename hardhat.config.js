require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-ganache");
require("@nomiclabs/hardhat-ethers");
//require("@nomicfoundation/hardhat-network-helpers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.7",
  networks: {
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/IH0uzjcpwmy-lj9Oil58cwvJz88FkuM0",
      accounts: ["c603767dc6c9fc2e33ced722a12cf80d0b0f48671b306e6aad638442f1bfddd5"]
    }
  },
  etherscan: {
    apiKey: "AFJXIG67IUBAVAWQAYHQHFIWRHNAZDKJ1S"
  }
};
