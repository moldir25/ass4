const hre = require("hardhat");

async function main() {
  const AespaToken = await hre.ethers.getContractFactory("AespaToken");
  const aespaToken = await AespaToken.deploy("AespaToken", "AES", "70000000000000000000000000", 50);

  await aespaToken.waitForDeployment();

  console.log("Aespa Token deployed to:", await aespaToken.getAddress()); // Use aespaToken.address to access the deployed contract address
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
