import { task } from "hardhat/config";
import { createAddressFile, selectAddressFile } from "./address_file";
import { getBondConfig, ZERO_ADDRESS, DAO_ADDRESS } from "../config";
import { updateHreSigner } from "./signers";

task("deploy_hyper_bond", "Deploy Hyper Bond")
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

    // queue and toggle RESERVE TOKEN
    await treasury.queue('2', bondConfig.ADDRESS, { gasLimit: 5e6 });
    console.log("treasury queue 2 success")
    await treasury.toggle('2', bondConfig.ADDRESS, ZERO_ADDRESS, { gasLimit: 5e6 });
    console.log("treasury toggle 2 success")

    // Deploy bond
    const BondDepository = await ethers.getContractFactory('HyperBondDepository');
    const bondDepository = await BondDepository.deploy(
        bondConfig.NAME,
        initAddresses.ORION,
        stakingAddresses.SORION,
        bondConfig.ADDRESS,
        treasury.address,
        DAO_ADDRESS,
        ZERO_ADDRESS, { gasLimit: 5e6 } // Gas estimation may fail
    );
    await bondDepository.deployed();
    console.log(bondName+"Bond: " + bondDepository.address);
    addressFile.set(bondName+"Bond", bondDepository.address);

    // queue and toggle bond as RESERVE DEPOSITOR
    await treasury.queue('0', bondDepository.address, { gasLimit: 5e6 });
    console.log("treasury queue 0 success")
    await treasury.toggle('0', bondDepository.address, ZERO_ADDRESS, { gasLimit: 5e6 });
    console.log("treasury toggle 0 success")

    // Set bond terms
    await bondDepository.initializeBondTerms(
        bondConfig.BOND_BCV,
        bondConfig.BOND_LOCKING_LENGTH,
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