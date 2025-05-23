// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  
  // 修复点：使用 provider 获取余额
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(
    "🛠️  使用账户部署合约:",
    deployer.address,
    `(余额: ${ethers.formatEther(balance)} ETH)`
  );

  // 部署抽奖合约
  const Raffle = await ethers.getContractFactory("Raffle");
  
  // 配置合约参数
  const interval = 10;      // 5分钟（单位：秒）
  const entranceFee = ethers.parseEther("10");
  
  const raffle = await Raffle.deploy(interval, entranceFee);
  
  await raffle.waitForDeployment();
  console.log("✅ 合约成功部署至地址:", await raffle.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("🛑 部署失败:", error);
    process.exit(1);
  });
