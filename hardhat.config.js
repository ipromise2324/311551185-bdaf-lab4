/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-waffle");
require('solidity-coverage');
require("hardhat-gas-reporter");
require("@openzeppelin/test-helpers");
require("@nomiclabs/hardhat-web3");
module.exports = {
  solidity: "0.8.18",
};
