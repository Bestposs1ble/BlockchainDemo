const { ethers } = require("hardhat");
const { parseUnits } = require("ethers");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  const decimals = 8;
  const initialPrice = parseUnits("2000", decimals);

  const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
  const mockV3Aggregator = await MockV3Aggregator.deploy(decimals, initialPrice);

  console.log("MockV3Aggregator deployed to:", mockV3Aggregator.target);

  const FundMe = await ethers.getContractFactory("FundMe");
  const fundMe = await FundMe.deploy(mockV3Aggregator.target);

  console.log("FundMe deployed to:", fundMe.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
