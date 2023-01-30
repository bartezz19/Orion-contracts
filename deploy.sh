npx hardhat preinstall
npx hardhat clean
npx hardhat compile
# npx hardhat deploy_init_mock --network remote
npx hardhat deploy_init --network remote
npx hardhat deploy_staking --network remote --silent
npx hardhat exec_staking --network remote --silent
npx hardhat deploy_bond --name USDC --network remote --silent
npx hardhat deploy_lpbond --name ORIONUSDC  --network remote --silent
npx hardhat deploy_hyper_lpbond --name ORIONWETH_HYPER --network remote --silent
# npx hardhat deploy_hyper_aggbond --name ARBITRUM_HYPER --network remote --silent
npx hardhat deploy_ws --network remote --silent
npx hardhat deploy_hyper_staking --network remote --silent
npx hardhat deploy_redis --network remote --silent
npx hardhat deploy_va --network remote --silent