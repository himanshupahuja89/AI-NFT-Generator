const hre = require("hardhat");
// const { deployments, ethers, getNamedAccounts } = require("hardhat")


async function main() {
  const NAME = "AI Generated NFT"
  const SYMBOL = "AI-NFT"
  const COST = ethers.parseUnits("1", "ether") // 1 ETH

  const NFT = await hre.ethers.getContractFactory("NFT")
  const nft = await NFT.deploy(NAME, SYMBOL, COST)
  await nft.waitForDeployment()

  console.log(`Deployed NFT Contract at: ${nft.target}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});