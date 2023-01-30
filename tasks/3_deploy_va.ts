import { task } from "hardhat/config";
import { createAddressFile, selectAddressFile } from "./address_file";
import { DAO_ADDRESS, PRINCIPLE_ADDRESS, ZERO_ADDRESS, MOCK_USDC_MINT } from "../config";
import { updateHreSigner } from "./signers";

task("deploy_va", "Deploy Virtual Asset")
    .addOptionalParam("init", "Path to the init address file", "")
    .addFlag("silent", "Run non-interactively and only deploy contracts specified by --deploy-*")
    .setAction(async function (args, hre) {
    await updateHreSigner(hre);
    const { ethers } = hre;
    await hre.run("compile");
    const [deployer] = await ethers.getSigners();
    const addressFile = createAddressFile(hre, "va");

    const initAddresses = await selectAddressFile(hre, "init", args.init);

    const treasury = await ethers.getContractAt("Treasury", initAddresses.Treasury, deployer);
    const AMOUNT = "100000000000000000000000000";

    const VirtualAsset = await ethers.getContractFactory('VirtualAsset');
    const virtualAsset = await VirtualAsset.deploy(0);
    await virtualAsset.deployed()
    console.log("VirtualAsset: " + virtualAsset.address);
    addressFile.set("VirtualAsset", virtualAsset.address);

    await virtualAsset.mint(treasury.address, AMOUNT, { gasLimit: 5e6 })

    console.log("deploy redis success")
});