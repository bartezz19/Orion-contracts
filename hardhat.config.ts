import type { HardhatUserConfig, NetworksUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "./tasks/accounts";
import "./tasks/0_deploy_init_mock";
import "./tasks/1_deploy_init";
import "./tasks/2_deploy_staking";
import "./tasks/3_exec_staking";
import "./tasks/4_deploy_bond";
import "./tasks/5_deploy_lpbond";
import "./tasks/6_deploy_aggbond";
import "./tasks/7_deploy_hyper_bond";
import "./tasks/8_deploy_hyper_lpbond";
import "./tasks/9_deploy_hyper_aggbond";
import "./tasks/10_deploy_ws";
import "./tasks/11_deploy_hyper_staking";
import "./tasks/12_deploy_hyper_bond_v2";
import "./tasks/13_deploy_redis";
import "./tasks/14_deploy_va";
import { ETH_RPC, ETH_CHAIN_ID, DEPLOYER_PK, DEPLOYER_HD_PATH } from "./config";
import "hardhat-gas-reporter";

const networks: NetworksUserConfig = {
  hardhat: {},
  localhost: {},
};
if (ETH_RPC && ETH_CHAIN_ID) {
  if (!DEPLOYER_PK && !DEPLOYER_HD_PATH) {
      throw new Error("Please set either DEPLOYER_PK or DEPLOYER_HD_PATH for the remote network");
  }
  if (DEPLOYER_PK && DEPLOYER_HD_PATH) {
      throw new Error("Do not set both DEPLOYER_PK and DEPLOYER_HD_PATH");
  }
  networks.remote = {
      url: ETH_RPC,
      chainId: ETH_CHAIN_ID,
      accounts: DEPLOYER_PK ? [DEPLOYER_PK] : [],
      timeout: 1000000,
  };
}

const config: HardhatUserConfig = {
    networks: networks,
    solidity: {
      compilers: [
        {
          version: '0.7.5',
          settings: {
            optimizer: {
              enabled: true,
              runs: 200,
            },
          },
        },
        {
          version: '0.8.3',
          settings: {
            optimizer: {
              enabled: true,
              runs: 200,
            },
          },
        },
        {
          version: '0.6.12',
          settings: {
            optimizer: {
              enabled: true,
              runs: 200,
            },
          },
        },
        {
          version: '0.5.16',
          settings: {
            optimizer: {
              enabled: true,
              runs: 200,
            },
          },
        },
        {
          version: '0.5.8',
          settings: {
            optimizer: {
              enabled: true,
              runs: 200,
            },
          },
        },
      ],
      overrides: {
        // "contracts/lock/TokenTimelock.sol": {
        //   version: '0.8.3',
        //   settings: {
        //     optimizer: {
        //       enabled: true,
        //       runs: 200,
        //     },
        //   },
        // },
      },
    },
    // @see https://hardhat.org/plugins/hardhat-gas-reporter.html
    gasReporter: {
        enabled: process.env.REPORT_GAS ? true : false,
        excludeContracts: ["test/", "utils/", "misc/"],
    },
};
export default config;