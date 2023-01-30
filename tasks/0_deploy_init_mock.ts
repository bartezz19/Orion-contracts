import { task } from "hardhat/config";
import { createAddressFile, selectAddressFile } from "./address_file";
import { DAO_ADDRESS, MOCK_USDC_DEPOSIT, MOCK_USDC_PROFIT, ZERO_ADDRESS, MOCK_USDC_MINT } from "../config";
import { updateHreSigner } from "./signers";

task("deploy_init_mock", "Deploy Init Token and Treasury", async function (_args, hre) {
    await updateHreSigner(hre);
    const { ethers } = hre;
    await hre.run("compile");
    const [deployer] = await ethers.getSigners();
    const addressFile = createAddressFile(hre, "init_mock");

    // just for test
    // Deploy USDC
    const USDC = await ethers.getContractFactory('USDC');
    const usdc = await USDC.deploy(0);
    await usdc.deployed()
    console.log("Mock USDC: " + usdc.address);
    addressFile.set("MockUSDC", usdc.address);

   
    await usdc.mint(deployer.address, MOCK_USDC_MINT);
    console.log("mint usdc success");

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
    // enum MANAGING { RESERVEDEPOSITOR, RESERVESPENDER, RESERVETOKEN, RESERVEMANAGER, LIQUIDITYDEPOSITOR, LIQUIDITYTOKEN, LIQUIDITYMANAGER, DEBTOR, REWARDMANAGER, SORION }

    // queue and toggle USDC RESERVE TOKEN
    await treasury.queue('2', usdc.address, { gasLimit: 5e6 });
    console.log("treasury queue 2 success")
    

    // queue and toggle DAO as LIQUIDITY DEPOSITOR
    await treasury.queue('4', DAO_ADDRESS, { gasLimit: 5e6 });
    console.log("treasury queue 4 success")

    await treasury.toggle('2', usdc.address, ZERO_ADDRESS, { gasLimit: 5e6 });
    console.log("treasury toggle 2 success")
    await treasury.toggle('4', DAO_ADDRESS, ZERO_ADDRESS, { gasLimit: 5e6 });
    console.log("treasury toggle 4 success")

    // Set treasury for orion token
    await orion.setVault(treasury.address, { gasLimit: 5e6 });
    console.log("orion setVault success")

    // jues for test
    await treasury.queue('0', deployer.address, { gasLimit: 5e6 });
    console.log("treasury queue 0 success")
    await treasury.toggle('0', deployer.address, ZERO_ADDRESS, { gasLimit: 5e6 });
    console.log("treasury toggle 0 success")

    await usdc.approve(
        treasury.address,
        MOCK_USDC_MINT,
        { gasLimit: 5e6 }
    )
    await treasury.deposit(MOCK_USDC_DEPOSIT, usdc.address, MOCK_USDC_PROFIT, { gasLimit: 5e6 })
});