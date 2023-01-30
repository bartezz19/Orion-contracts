import { task } from "hardhat/config";
import { createAddressFile, selectAddressFile } from "./address_file";
import { getBondConfig, ZERO_ADDRESS, DAO_ADDRESS } from "../config";
import { updateHreSigner } from "./signers";

task("deploy_hyper_bond_v2", "Deploy Hyper Bond V2")
    .addOptionalParam("name", "name of bond config", "")
    .addOptionalParam("init", "Path to the init address file", "")
    .addOptionalParam("staking", "Path to the staking address file", "")
    .addOptionalParam("wsorion", "Path to the wsorion address file", "")
    .addOptionalParam("hyperStaking", "Path to the hyper staking address file", "")
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
    const wsorionAddresses = await selectAddressFile(hre, "wsorion", args.wsorion);
    const hyperStakingAddresses = await selectAddressFile(hre, "hyper_staking", args.wsorion);

    
    // 1 read dhc address
    // 2 deploy another dhcv1 
    // 3 deploy and init bond
    // 4 dhc.addCampaign(dhcv1.address, 0), dhcv1.setActive(false)
    // 5 dhc.addManager(bond.address), dhcv1.addPrivilege(bond.address)
    // ok

    console.log("deploy success")

});