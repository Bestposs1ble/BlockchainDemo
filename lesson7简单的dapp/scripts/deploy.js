const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);

  const Calculator = await hre.ethers.getContractFactory("Calculator");
  const calculator = await Calculator.deploy();
  
  await calculator.deployed(); // 确认使用正确方法
  console.log("合约地址:", calculator.address);

  // 本地网络不需要验证，可注释掉以下代码
  // await hre.run("verify:verify", {
  //   address: calculator.address,
  //   constructorArguments: [],
  // });
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("部署错误:", error);
    process.exit(1);
  });