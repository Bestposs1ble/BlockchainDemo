require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    ganache: {
      url: "http://localhost:9545",
      accounts: [process.env.PRIVATE_KEY] // 从 Ganache 获取私钥
    }
  }
};
