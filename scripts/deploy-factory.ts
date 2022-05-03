import { ethers, network, run } from "hardhat";
import { parseEther } from "ethers/lib/utils";

const main = async () => {
  // Get network name: hardhat, testnet or mainnet.
  const { name } = network;
  if (name == "mainnet" || name == "testnet") {
    console.log(`Deploying to ${name} network...`);

    // Compile contracts.
    await run("compile");
    console.log("Compiled contracts");

    let feeToSetter = "0xe5989699914b1F3920a960a08784e3BEfa0BA2A6";

    const PancakeFactoryContract = await ethers.getContractFactory("PancakeFactory");
    const factory = await PancakeFactoryContract.deploy(feeToSetter);

    await factory.deployed();
    console.log("pancakeswap factory deployed to %s", factory.address);

  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
