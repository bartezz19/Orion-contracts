import * as dotenv from "dotenv";
dotenv.config();

export const ETH_RPC = process.env.ETH_RPC;
export const ETH_CHAIN_ID = parseInt(process.env.ETH_CHAIN_ID ?? "");
export const DEPLOYER_PK = process.env.DEPLOYER_PK;
export const DEPLOYER_HD_PATH = process.env.DEPLOYER_HD_PATH;

export const TEAM_ADDRESS = process.env.TEAM_ADDRESS;
export const RELEASE_TIME = process.env.RELEASE_TIME;

export const DAO_ADDRESS = process.env.DAO_ADDRESS;
export const PRINCIPLE_ADDRESS = process.env.PRINCIPLE_ADDRESS;

export const ZERO_ADDRESS='0x0000000000000000000000000000000000000000';
export const MOCK_USDC_MINT='3524237370000000000000000';
export const MOCK_USDC_DEPOSIT='2122950240000000000000000';
export const MOCK_USDC_PROFIT='2041947340000000'; // 81002.9

export const STAKING_CONFIG = {
    FIRST_EPOCH_BLOCK: process.env.FIRST_EPOCH_BLOCK ?? "",
    FIRST_EPOCH_NUMBER: process.env.FIRST_EPOCH_NUMBER ?? "",
    EPOCH_LENGTH: process.env.EPOCH_LENGTH ?? "",
    INITIAL_INDEX: process.env.INITIAL_INDEX ?? "",
    INITIAL_REWARD_RATE: process.env.INITIAL_REWARD_RATE ?? "",
};

export const HYPER_STAKING_CONFIG = {
    MIN_LOKC_TIME: process.env.MIN_LOKC_TIME ?? "",
    PENALTY_PERCENT: process.env.PENALTY_PERCENT ?? "",
    REWARD_PERIOD: process.env.REWARD_PERIOD ?? "",
    REWARD_PERCENT: process.env.REWARD_PERCENT ?? "",
    END_TIME: process.env.END_TIME ?? "",
};

export const USDC_BOND_CONFIG = {
    NAME: "USDC Bond",
    PRICE_FEED_ADDRESS: "",
    ADDRESS: process.env.USDC_ADDRESS ?? "",
    BOND_BCV: process.env.USDC_BOND_BCV ?? "",
    BOND_VESTING_LENGTH: process.env.USDC_BOND_VESTING_LENGTH ?? "",
    BOND_LOCKING_LENGTH: "",
    MIN_BOND_PRICE: process.env.USDC_MIN_BOND_PRICE ?? "",
    MAX_BOND_PAYOUT: process.env.USDC_MAX_BOND_PAYOUT ?? "",
    BOND_FEE: process.env.USDC_BOND_FEE ?? "",
    MAX_BOND_DEBT: process.env.USDC_MAX_BOND_DEBT ?? "",
    INITIAL_BOND_DEBT: process.env.USDC_INITIAL_BOND_DEBT ?? "",
};

export const ORION_USDC_BOND_CONFIG = {
    NAME: "ORION-USDC Bond",
    PRICE_FEED_ADDRESS: "",
    ADDRESS: process.env.ORION_USDC_ADDRESS ?? "",
    BOND_BCV: process.env.ORION_USDC_BOND_BCV ?? "",
    BOND_VESTING_LENGTH: process.env.ORION_USDC_BOND_VESTING_LENGTH ?? "",
    BOND_LOCKING_LENGTH: "",
    MIN_BOND_PRICE: process.env.ORION_USDC_MIN_BOND_PRICE ?? "",
    MAX_BOND_PAYOUT: process.env.ORION_USDC_MAX_BOND_PAYOUT ?? "",
    BOND_FEE: process.env.ORION_USDC_BOND_FEE ?? "",
    MAX_BOND_DEBT: process.env.ORION_USDC_MAX_BOND_DEBT ?? "",
    INITIAL_BOND_DEBT: process.env.ORION_USDC_INITIAL_BOND_DEBT ?? "",
};

export const ORION_WETH_HYPER_BOND_CONFIG = {
    NAME: "ORION-WETH Hyper Bond V1",
    PRICE_FEED_ADDRESS: "",
    ADDRESS: process.env.ORION_WETH_HYPER_ADDRESS ?? "",
    BOND_BCV: process.env.ORION_WETH_HYPER_BOND_BCV ?? "",
    BOND_VESTING_LENGTH: "",
    BOND_LOCKING_LENGTH: process.env.ORION_WETH_HYPER_BOND_LOCKING_LENGTH ?? "",
    MIN_BOND_PRICE: process.env.ORION_WETH_HYPER_MIN_BOND_PRICE ?? "",
    MAX_BOND_PAYOUT: process.env.ORION_WETH_HYPER_MAX_BOND_PAYOUT ?? "",
    BOND_FEE: process.env.ORION_WETH_HYPER_BOND_FEE ?? "",
    MAX_BOND_DEBT: process.env.ORION_WETH_HYPER_MAX_BOND_DEBT ?? "",
    INITIAL_BOND_DEBT: process.env.ORION_WETH_HYPER_INITIAL_BOND_DEBT ?? "",
};


export function getBondConfig(bond: string): {
    NAME: string,
    PRICE_FEED_ADDRESS: string,
    ADDRESS: string,
    BOND_BCV: string,
    BOND_VESTING_LENGTH: string,
    BOND_LOCKING_LENGTH: string,
    MIN_BOND_PRICE: string,
    MAX_BOND_PAYOUT: string,
    BOND_FEE: string,
    MAX_BOND_DEBT: string,
    INITIAL_BOND_DEBT: string,
} {
    let res = {
        NAME: '',
        PRICE_FEED_ADDRESS: '',
        ADDRESS: '',
        BOND_BCV: '',
        BOND_VESTING_LENGTH: '',
        BOND_LOCKING_LENGTH: '',
        MIN_BOND_PRICE: '',
        MAX_BOND_PAYOUT: '',
        BOND_FEE: '',
        MAX_BOND_DEBT: '',
        INITIAL_BOND_DEBT: '',
    }
    switch(bond) {
        case 'USDC':
            res = USDC_BOND_CONFIG;
            break;
        case 'ORIONUSDC':
            res = ORION_USDC_BOND_CONFIG;
            break;
        case 'ORIONWETH_HYPER':
            res = ORION_WETH_HYPER_BOND_CONFIG;
            break;
    }
    return res;
}