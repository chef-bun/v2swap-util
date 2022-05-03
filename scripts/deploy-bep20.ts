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

    let tokenName = "WETH";
    let tokenSymbol = "WETH";
    let totalSupply = parseEther("100000");

    const BEP20Contract = await ethers.getContractFactory("MockBEP20");
    const bep20 = await BEP20Contract.deploy(tokenName, tokenSymbol, totalSupply);

    await bep20.deployed();
    console.log("BEP20 deployed to %s:, token name is %s, symbol is %s", bep20.address, tokenName, tokenSymbol);
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
