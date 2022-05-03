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

    let tokenA = "0x34f2d26203b9b188686F3450f8D6E4f4630bA44d";
    let tokenB = "0xDB85E6De9B1032193a24D2Ba54bd07250C2bC88c";
    let factory = "0xfA2ca737Ea990F7077B83CABfe9A3D4B67b72Cee";
    let router = "0x06755491E3195d0fbEe9c31E3C6F9807CeA69878";
    let pair = "0xe9097d7067de1423ef097dc9560ef040b9ddac51";

    const PairUtilsContract = await ethers.getContractFactory("PancakePairUtils");
    const utils = await PairUtilsContract.deploy(tokenA, tokenB, factory, router, pair);

    await utils.deployed();
    console.log("pancake pair utils deployed to %s", utils.address);
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
