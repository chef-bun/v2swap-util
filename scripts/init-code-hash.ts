import { ethers, network, run } from "hardhat";
import { parseEther } from "ethers/lib/utils";

const main = async () => {
  
  // Compile contracts.
  await run("compile");
  console.log("Compiled contracts");

  const InitCodeHash = await ethers.getContractFactory("InitCodeHash");
  const codeHash = await InitCodeHash.deploy();

  await codeHash.deployed();

  const inithash = await codeHash.getInitHash();
  console.log("init hash is :%s", inithash);

};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
