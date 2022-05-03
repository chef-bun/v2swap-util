import { artifacts, contract } from "hardhat";
const hre = require("hardhat");
import { ether, time, constants, BN, expectRevert, expectEvent } from "@openzeppelin/test-helpers";
import { assert } from "chai";

const PancakeFactory = artifacts.require("PancakeFactory");
const PancakeRouter = artifacts.require("PancakeRouter");
const MockERC20 = artifacts.require("MockERC20");
const PancakePairUtils = artifacts.require("PancakePairUtils");
const InitCodeHash = artifacts.require("InitCodeHash");

contract("AddLiquidity", ([owner, user1, user2]) => {
  let factory,
      router, 
      pair,
      token0,
      token1,
      weth;

  let feeToSetter = owner;
  
  it("Add liquidity should success", async () => {

    token0 = await MockERC20.new("Token0", "T0", ether("10000"), { from: owner });
    token1 = await MockERC20.new("Token1", "T1", ether("10000"), { from: owner });
    weth = await MockERC20.new("WETH", "WETH", ether("10000"), { from: owner });

    console.log("==============token0 deployed at:%s============", token0.address);
    console.log("==============token1 deployed at:%s============", token1.address);
    console.log("==============weth deployed at:%s============", weth.address);

    factory = await PancakeFactory.new(feeToSetter, { from: owner });

    //  factory createPair
    let createdPairTx = await factory.createPair(token0.address, token1.address, { from: owner });
    // Real created pair contrat address
    pair = createdPairTx.logs[0].args.pair;
    console.log("==============pair deployed at:%s============", pair);

    const PancakePair = await hre.ethers.getContractFactory('PancakePair');
    // LP pair contract instance
    pair = await PancakePair.attach(pair);
    
    assert.equal((await pair.token0()), token0.address);
    assert.equal((await pair.token1()), token1.address);
    
    router = await PancakeRouter.new(factory.address, weth.address, { from: owner });
    console.log("==============router deployed at:%s============", router.address);

    // approve token 0 to router contract from swap participant(owner)
    await token0.approve(router.address, ether("1000"), { from: owner });
    // approve token 1 to router contract from swap participant(owner)
    await token1.approve(router.address, ether("1000"), { from: owner });
    
    //transfer 0.1 ther token0 to pair
    await token0.transfer(pair.address, ether("0.1"),  { from: owner });

    // sync LP pair
    await pair.sync();

    // addLiquidity
    let amountADesired = 10000000000;
    let amountBDesired = 10000000000;
    let addtion = 10000000000;
    let amountAMin = 1;
    let amountBMin = 1;
    let to = owner;
    let deadline = (await time.latest()).toNumber() + time.duration.hours(9).toNumber();

    let CodeHash = await InitCodeHash.new();
    // copy init code hash to pancakeLibrary 'pairFor' function
    let inithash = await CodeHash.getInitHash();
    console.log("init hash is :%s", inithash);

    await expectRevert(router.addLiquidity(token0, token1, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline), { from: owner }, "PancakeLibrary: INSUFFICIENT_AMOUNT");
  
    let utils = await PancakePairUtils.new(token0.address, token1.address, factory.address, router.address, pair.address, { from: owner });

    await utils.approve(token0.address, router.address, ether("100"));
    await utils.approve(token1.address, router.address, ether("100"));

    await token0.transfer(utils.address, ether("10"),  { from: owner });
    await token1.transfer(utils.address, ether("10"),  { from: owner });

    // call utils addRouterLiquidity
    // await utils.addRouterLiquidity(false, getBigNumber(1, 10), amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline, { from: owner });
    await utils.addRouterLiquidity(false, addtion, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline, { from: owner });
  });
});
