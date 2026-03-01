const hre = require("hardhat");

async function main() {
  const EduLocker = await hre.ethers.getContractFactory("EduLocker");
  const eduLocker = await EduLocker.deploy();

  await eduLocker.waitForDeployment();

  console.log("EduLocker deployed to:", await eduLocker.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});