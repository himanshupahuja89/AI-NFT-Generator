/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config(); // Load environment variables from .env file


module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {}, // Default Hardhat network
    fuji: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
