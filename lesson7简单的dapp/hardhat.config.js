require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.24",
  networks: {
    ganache: {
      url: "http://localhost:9545",
      accounts: ["0x34c79fc04edd223f2bb6544aa2104f9e5ee08000a5c567a1dc9136e8690a5ae2"] // 从Ganache界面获取第一个账户私钥
    }
  }
};