import { task } from "hardhat/config";
import { createAddressFile, selectAddressFile } from "./address_file";
import { ZERO_ADDRESS, STAKING_CONFIG } from "../config";
import { updateHreSigner } from "./signers";

task("exec_staking", "Execute Staking")
    .addOptionalParam("init", "Path to the init address file", "")
    .addOptionalParam("staking", "Path to the staking address file", "")
    .addFlag("silent", "Run non-interactively and only deploy contracts specified by --deploy-*")
    .setAction(async function (args, hre) {
    await updateHreSigner(hre);
    const { ethers } = hre;
    await hre.run("compile");
    const [deployer] = await ethers.getSigners();

    const initAddresses = await selectAddressFile(hre, "init", args.init);
    const stakingAddresses = await selectAddressFile(hre, "staking", args.staking);

    const treasury = await ethers.getContractAt("Treasury", initAddresses.Treasury, deployer);
    const circulatingSupply = await ethers.getContractAt("CirculatingSupply", stakingAddresses.CirculatingSupply, deployer);
    const sorion = await ethers.getContractAt("StakedToken", stakingAddresses.SORION, deployer);

    const distributor = await ethers.getContractAt("Distributor", stakingAddresses.Distributor, deployer);
    const staking = await ethers.getContractAt("Staking", stakingAddresses.Staking, deployer);

    // Initialize sorion and set the index
    await sorion.initialize(staking.address);
    console.log("sorion initialize success")
    await sorion.setIndex(STAKING_CONFIG.INITIAL_INDEX, { gasLimit: 5e6 });
    console.log("sorion setIndex success")

    // set distributor contract and warmup contract
    await staking.setContract('0', distributor.address, { gasLimit: 5e6 });
    console.log("staking setContract 0 success")
    await staking.setContract('1', stakingAddresses.StakingWarmpup, { gasLimit: 5e6 });
    console.log("staking setContract 1 success")

    // enum MANAGING { RESERVEDEPOSITOR, RESERVESPENDER, RESERVETOKEN, RESERVEMANAGER, LIQUIDITYDEPOSITOR, LIQUIDITYTOKEN, LIQUIDITYMANAGER, DEBTOR, REWARDMANAGER, SORION }
    // 0 2 4 5 8 9 
    // RESERVEDEPOSITOR,RESERVETOKEN,LIQUIDITYDEPOSITOR,LIQUIDITYTOKEN,REWARDMANAGER,SORION
    // 1 3 6 7
    // RESERVESPENDER,RESERVEMANAGER,LIQUIDITYMANAGER,DEBTOR

    // @note that: double queue and toggle will make address as false

    // queue and toggle REWARD MANAGER
    await treasury.queue('8', distributor.address, { gasLimit: 5e6 });
    console.log("treasury queue 8 success")
    // queue and toggle SORION
    await treasury.queue('9', sorion.address, { gasLimit: 5e6 });
    console.log("treasury queue 9 success")


    await treasury.toggle('8', distributor.address, ZERO_ADDRESS, { gasLimit: 5e6 });
    console.log("treasury toggle 8 success")
    await treasury.toggle('9', sorion.address, ZERO_ADDRESS, { gasLimit: 5e6 });
    console.log("treasury toggle 9 success")

    // initialize circulating supply
    await circulatingSupply.initialize(initAddresses.orion, { gasLimit: 5e6 })
    console.log("circulating supply initialize success")

    // Add staking contract as distributor recipient
    await distributor.addRecipient(staking.address, STAKING_CONFIG.INITIAL_REWARD_RATE, { gasLimit: 5e6 });
    console.log("distributor addRecipient success")

    console.log("exec success")
});