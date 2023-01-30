import { task } from "hardhat/config";
import { createAddressFile, selectAddressFile } from "./address_file";
import { STAKING_CONFIG, TEAM_ADDRESS, RELEASE_TIME } from "../config";

import { updateHreSigner } from "./signers";

task("deploy_staking", "Deploy Staking")
    .addOptionalParam("init", "Path to the init address file", "")
    .addFlag("silent", "Run non-interactively and only deploy contracts specified by --deploy-*")
    .setAction(async function (args, hre) {
    await updateHreSigner(hre);
    const { ethers } = hre;
    await hre.run("compile");
    const [deployer] = await ethers.getSigners();
    const addressFile = createAddressFile(hre, "staking");

    const initAddresses = await selectAddressFile(hre, "init", args.init);

    // Deploy circulating supply
    const CirculatingSupply = await ethers.getContractFactory('CirculatingSupply');
    const circulatingSupply = await CirculatingSupply.deploy(
        deployer.address, // owner
    );
    await circulatingSupply.deployed()
    console.log("CirculatingSupply: " + circulatingSupply.address)
    addressFile.set("CirculatingSupply", circulatingSupply.address);

    // Deploy bonding calc
    const BondingCalculator = await ethers.getContractFactory('BondingCalculator');
    const bondingCalculator = await BondingCalculator.deploy(
        initAddresses.ORION, { gasLimit: 5e6 } // Gas estimation may fail
    );
    await bondingCalculator.deployed()
    console.log("Bonding Calculator: " + bondingCalculator.address);
    addressFile.set("BondingCalculator", bondingCalculator.address);

    // deploy redeem helper
    const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
    const redeemHelper = await RedeemHelper.deploy()
    await redeemHelper.deployed()
    console.log("Redeem Helper: " + redeemHelper.address);
    addressFile.set("RedeemHelper", redeemHelper.address);

    // deploy redeem helper
    const AdjustHelper = await ethers.getContractFactory('AdjustHelper');
    const adjustHelper = await AdjustHelper.deploy()
    await adjustHelper.deployed()
    console.log("Adjust Helper: " + adjustHelper.address);
    addressFile.set("AdjustHelper", adjustHelper.address);

    // Deploy sgiza
    const SORION = await ethers.getContractFactory('StakedToken');
    const sorion = await SORION.deploy();
    await sorion.deployed()
    console.log("SORION: " + sorion.address);
    addressFile.set("SORION", sorion.address);

    // // deploy redeem helper
    // const Timelock = await ethers.getContractFactory('TokenTimelock');
    // const timelock = await Timelock.deploy(
    //     sorion.address,
    //     TEAM_ADDRESS,
    //     RELEASE_TIME,
    //     { gasLimit: 5e6 } 
    // )
    // await timelock.deployed()
    // console.log("Timelock: " + timelock.address);
    // addressFile.set("Timelock", timelock.address);

    // Deploy staking distributor
    const Distributor = await ethers.getContractFactory('Distributor');
    const distributor = await Distributor.deploy(
        initAddresses.Treasury,
        initAddresses.ORION,
        STAKING_CONFIG.EPOCH_LENGTH,
        STAKING_CONFIG.FIRST_EPOCH_BLOCK, { gasLimit: 5e6 } // Gas estimation may fail
    );
    await distributor.deployed()
    console.log("Distributor " + distributor.address);
    addressFile.set("Distributor", distributor.address);

    // Deploy Staking
    const Staking = await ethers.getContractFactory('Staking');
    const staking = await Staking.deploy(
        initAddresses.ORION,
        sorion.address,
        STAKING_CONFIG.EPOCH_LENGTH,
        STAKING_CONFIG.FIRST_EPOCH_NUMBER,
        STAKING_CONFIG.FIRST_EPOCH_BLOCK, { gasLimit: 5e6 } // Gas estimation may fail
    );
    await staking.deployed()
    console.log("Staking: " + staking.address);
    addressFile.set("Staking", staking.address);

    // Deploy staking warmpup
    const StakingWarmpup = await ethers.getContractFactory('StakingWarmup');
    const stakingWarmup = await StakingWarmpup.deploy(
        staking.address,
        sorion.address, { gasLimit: 5e6 } // Gas estimation may fail
    );
    await stakingWarmup.deployed()
    console.log("Staking Wawrmup " + stakingWarmup.address);
    addressFile.set("StakingWarmpup", stakingWarmup.address);

    // Deploy staking helper
    const StakingHelper = await ethers.getContractFactory('StakingHelper');
    const stakingHelper = await StakingHelper.deploy(
        staking.address,
        initAddresses.ORION, { gasLimit: 5e6 } // Gas estimation may fail
    );
    await stakingHelper.deployed()
    console.log("Staking Helper " + stakingHelper.address);
    addressFile.set("StakingHelper", stakingHelper.address);

    // deploy finished

    console.log("deploy success")

});