const RewardToken = artifacts.require("RewardToken");
const ContributorNFT = artifacts.require("ContributorNFT");
const MultiSigWalletFactory = artifacts.require("MultiSigWalletFactory");
const TrailMaintenance = artifacts.require("TrailMaintenance");

const fs = require("fs");
const path = require("path");

const TokenName = process.env.TOKEN_NAME || "TrailToken";
const TokenSymbol = process.env.TOKEN_SYMBOL || "TRAIL";
const BaseURI = process.env.BASE_URI || "https://api.trailmaintenance.com/metadata";

module.exports = async function (deployer, network, accounts) {
  const deployerAccount = accounts[0]; // 使用accounts[0]作为部署者
  console.log("🚀 部署账户:", deployerAccount);

  // 1. 部署激励代币合约（RewardToken）
  console.log("开始部署激励代币合约...");
  const initialSupply = web3.utils.toWei("100000000", "ether"); // 1亿代币
  await deployer.deploy(RewardToken, initialSupply, { from: deployerAccount });
  const rewardToken = await RewardToken.deployed();
  console.log("✅ RewardToken 部署成功:", rewardToken.address);
  
  // 验证部署者的代币余额
  let deployerBalance = await rewardToken.balanceOf(deployerAccount);
  console.log("💰 部署者代币余额:", web3.utils.fromWei(deployerBalance.toString(), "ether"), TokenSymbol);

  // 2. 部署NFT合约（ContributorNFT）
  console.log("开始部署NFT合约...");
  await deployer.deploy(ContributorNFT, { from: deployerAccount });
  const contributorNFT = await ContributorNFT.deployed();
  console.log("✅ ContributorNFT 部署成功:", contributorNFT.address);
  
  // 设置NFT基础URI
  await contributorNFT.setBaseURI(BaseURI, { from: deployerAccount });
  console.log("✅ NFT基础URI设置成功:", BaseURI);

  // 3. 部署多签钱包工厂合约（MultiSigWalletFactory）
  console.log("开始部署多签钱包工厂合约...");
  await deployer.deploy(MultiSigWalletFactory, { from: deployerAccount });
  const multiSigFactory = await MultiSigWalletFactory.deployed();
  console.log("✅ MultiSigWalletFactory 部署成功:", multiSigFactory.address);

  // 4. 部署主合约（TrailMaintenance）
  console.log("开始部署主合约...");
  await deployer.deploy(
    TrailMaintenance,
    rewardToken.address,
    contributorNFT.address,
    multiSigFactory.address,
    { from: deployerAccount }
  );
  const trailMaintenance = await TrailMaintenance.deployed();
  console.log("✅ TrailMaintenance 部署成功:", trailMaintenance.address);

  // 5. 设置合约间的相互关联
  console.log("设置合约间的相互关联...");
  
  // 设置TrailMaintenance合约地址到RewardToken
  await rewardToken.setTrailMaintenanceContract(trailMaintenance.address, { from: deployerAccount });
  console.log("✅ RewardToken合约已设置TrailMaintenance地址");
  
  // 设置TrailMaintenance合约地址到ContributorNFT
  await contributorNFT.setTrailMaintenanceContract(trailMaintenance.address, { from: deployerAccount });
  console.log("✅ ContributorNFT合约已设置TrailMaintenance地址");
  
  // 设置TrailMaintenance合约地址到MultiSigWalletFactory
  await multiSigFactory.setTrailMaintenanceContract(trailMaintenance.address, { from: deployerAccount });
  console.log("✅ MultiSigWalletFactory合约已设置TrailMaintenance地址");

  // 6. 向TrailMaintenance合约转移代币用于奖励
  console.log("向TrailMaintenance合约转移代币用于奖励...");
  const rewardFund = web3.utils.toWei("5000000", "ether"); // 500万代币
  await rewardToken.transfer(trailMaintenance.address, rewardFund, { from: deployerAccount });
  let maintenanceRewardBalance = await rewardToken.balanceOf(trailMaintenance.address);
  console.log("💰 TrailMaintenance合约奖励余额:", web3.utils.fromWei(maintenanceRewardBalance.toString(), "ether"), TokenSymbol);

  console.log("🚀 部署完成!");

  // 准备合约地址
  const contractAddresses = {
    REWARD_TOKEN_ADDRESS: rewardToken.address,
    CONTRIBUTOR_NFT_ADDRESS: contributorNFT.address,
    MULTISIG_FACTORY_ADDRESS: multiSigFactory.address,
    TRAIL_MAINTENANCE_ADDRESS: trailMaintenance.address
  };

  // 写入合约地址到JSON文件
  console.log("📝 写入合约地址到JSON文件...", network);
  let contractsFilePath;
  
  if (network === "testnet" || network === "opsepolia") {
    contractsFilePath = path.join(__dirname, "../frontend/public/contracts/testnet-contracts.json");
  } else if (network === "development" || network === "ganache") {
    contractsFilePath = path.join(__dirname, "../frontend/public/contracts/development-contracts.json");
  } else if (network === "mainnet") {
    contractsFilePath = path.join(__dirname, "../frontend/public/contracts/mainnet-contracts.json");
  } else {
    contractsFilePath = path.join(__dirname, "../frontend/public/contracts/contracts.json");
  }

  // 确保目标目录存在；如果不存在，递归创建
  const targetDir = path.dirname(contractsFilePath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 以JSON格式写入内容
  fs.writeFileSync(contractsFilePath, JSON.stringify(contractAddresses, null, 2), { encoding: "utf8" });
  console.log(`✅ 合约地址已写入 ${contractsFilePath}`);
};