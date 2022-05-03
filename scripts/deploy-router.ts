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

    let factory = "0xfA2ca737Ea990F7077B83CABfe9A3D4B67b72Cee";
    let weth = "0xad9a61f06DcfecE664BC9A1bb8Cc7c17719e0Ae0";

    const PancakeRouterContract = await ethers.getContractFactory("PancakeRouter");
    const router = await PancakeRouterContract.deploy(factory, weth);

    await router.deployed();
    console.log("pancakeswap router deployed to %s", router.address);

  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
