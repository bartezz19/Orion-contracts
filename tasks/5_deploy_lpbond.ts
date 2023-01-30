import { task } from "hardhat/config";
import { createAddressFile, selectAddressFile } from "./address_file";
import { getBondConfig, ZERO_ADDRESS, DAO_ADDRESS } from "../config";
import { updateHreSigner } from "./signers";

task("deploy_lpbond", "Deploy LPBond")
    .addOptionalParam("name", "name of bond config", "")
    .addOptionalParam("init", "Path to the init address file", "")
    .addOptionalParam("staking", "Path to the staking address file", "")
    .addFlag("silent", "Run non-interactively and only deploy contracts specified by --deploy-*")
    .setAction(async function (args, hre) {
    await updateHreSigner(hre);
    const { ethers } = hre;
    await hre.run("compile");
    const [deployer] = await ethers.getSigners();

    const bondName = args.name;
    const addressFile = createAddressFile(hre, "bond_"+bondName);
    const bondConfig = getBondConfig(bondName);

    const initAddresses = await selectAddressFile(hre, "init", args.init);
    const stakingAddresses = await selectAddressFile(hre, "staking", args.staking);

    // Get Contract by Address: treasury, redeemHelper

    const treasury = await ethers.getContractAt("Treasury", initAddresses.Treasury, deployer);
    const redeemHelper = await ethers.getContractAt("RedeemHelper", stakingAddresses.RedeemHelper, deployer);
    const adjustHelper = await ethers.getContractAt("AdjustHelper", stakingAddresses.AdjustHelper, deployer);
    
    // queue and toggle LIQUIDITY TOKEN
    await treasury.queue('5', bondConfig.ADDRESS, { gasLimit: 5e6 });
    console.log("treasury queue 5 success")
    await treasury.toggle('5', bondConfig.ADDRESS, stakingAddresses.BondingCalculator, { gasLimit: 5e6 });
    console.log("treasury toggle 5 success")

    // Deploy bond
    const BondDepository = await ethers.getContractFactory('BondDepository');
    const bondDepository = await BondDepository.deploy(
        bondConfig.NAME,
        initAddresses.ORION,
        bondConfig.ADDRESS,
        treasury.address,
        DAO_ADDRESS,
        stakingAddresses.BondingCalculator, { gasLimit: 5e6 } // Gas estimation may fail
    );
    await bondDepository.deployed();
    console.log(bondName+"Bond: " + bondDepository.address);
    addressFile.set(bondName+"Bond", bondDepository.address);

    // queue and toggle bond as LIQUIDITY DEPOSITOR
    await treasury.queue('4', bondDepository.address, { gasLimit: 5e6 });
    console.log("treasury queue 4 success")
    await treasury.toggle('4', bondDepository.address, ZERO_ADDRESS, { gasLimit: 5e6 });
    console.log("treasury toggle 4 success")

    // Set bond terms
    await bondDepository.initializeBondTerms(
        bondConfig.BOND_BCV,
        bondConfig.BOND_VESTING_LENGTH,
        bondConfig.MIN_BOND_PRICE,
        bondConfig.MAX_BOND_PAYOUT,
        bondConfig.BOND_FEE,
        bondConfig.MAX_BOND_DEBT,
        bondConfig.INITIAL_BOND_DEBT, { gasLimit: 5e6 }
    );

    // Set staking for bond   
    await bondDepository.setStaking(stakingAddresses.StakingHelper, 1, { gasLimit: 5e6 });
    console.log("bondDepository setStaking success")

    // add bond address for redeem helper
    await redeemHelper.addBondContract(bondDepository.address)
    console.log("redeemHelper addBondContract success")

    // add bond address for adjust helper
    await adjustHelper.addBondContract(bondDepository.address)
    console.log("adjustHelper addBondContract success")

    console.log("deploy success")

});