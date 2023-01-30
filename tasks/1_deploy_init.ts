import { task } from "hardhat/config";
import { createAddressFile, selectAddressFile } from "./address_file";
import { DAO_ADDRESS, PRINCIPLE_ADDRESS, ZERO_ADDRESS, MOCK_DAI_MINT } from "../config";
import { updateHreSigner } from "./signers";

task("deploy_init", "Deploy Init Token and Treasury", async function (_args, hre) {
    await updateHreSigner(hre);
    const { ethers } = hre;
    await hre.run("compile");
    const [deployer] = await ethers.getSigners();
    const addressFile = createAddressFile(hre, "init");

    // Deploy orion
    const ORION = await ethers.getContractFactory('Token');
    const orion = await ORION.deploy();
    await orion.deployed()
    console.log("ORION: " + orion.address);
    addressFile.set("ORION", orion.address);

    // Deploy treasury
    const Treasury = await ethers.getContractFactory('Treasury');
    const treasury = await Treasury.deploy(
        orion.address,
        ZERO_ADDRESS, // usdc address init is zero now
        ZERO_ADDRESS, // orionusdc address init is zero now
        0, { gasLimit: 5e6 } // Gas estimation may fail
    );
    await treasury.deployed()
    console.log("Treasury: " + treasury.address);
    addressFile.set("Treasury", treasury.address);

    // 2 4 
    // enum MANAGING { RESERVEDEPOSITOR, RESERVESPENDER, RESERVETOKEN, RESERVEMANAGER, LIQUIDITYDEPOSITOR, LIQUIDITYTOKEN, LIQUIDITYMANAGER, DEBTOR, REWARDMANAGER, SGIZA }

    // queue and toggle usdc RESERVE TOKEN
    await treasury.queue('2', PRINCIPLE_ADDRESS, { gasLimit: 5e6 });
    console.log("treasury queue 2 success")
    // queue and toggle DAO as LIQUIDITY DEPOSITOR
    await treasury.queue('4', DAO_ADDRESS, { gasLimit: 5e6 });
    console.log("treasury queue 4 success")

    await treasury.toggle('2', PRINCIPLE_ADDRESS, ZERO_ADDRESS, { gasLimit: 5e6 });
    console.log("treasury toggle 2 success")
    await treasury.toggle('4', DAO_ADDRESS, ZERO_ADDRESS, { gasLimit: 5e6 });
    console.log("treasury toggle 4 success")

    // Set treasury for orion token
    await orion.setVault(treasury.address, { gasLimit: 5e6 });
    console.log("orion setVault success")

    console.log("deploy init success")
});