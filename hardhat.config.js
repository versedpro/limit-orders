require("dotenv/config");

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-solhint");
require("hardhat-spdx-license-identifier");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("hardhat-gas-reporter");
require("solidity-coverage");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.4",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.5.16",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.6.12",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    overrides: {
      "contracts/mock/pancakeswap/libraries/PancakeLibrary.sol": {
                version: "0.5.16",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
      }
    }
    },
  networks: {
    testnet: {
      url: "https://data-seed-prebsc-2-s3.binance.org:8545/",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: {
        mnemonic: process.env.MNEMONIC !== undefined ? process.env.MNEMONIC : ''
      },
    },
    mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: {
                mnemonic: process.env.MNEMONIC !== undefined ? process.env.MNEMONIC : ''
            },
    },
    hardhat: {
        gas: 12000000,
        blockGasLimit: 12000000,
        allowUnlimitedContractSize: true,
        accounts: {
            mnemonic: "test test test test test test test test test test test junk",
        },
        live: false,
        saveDeployments: true,
    },
  },
    namedAccounts: {
        deployer: 0,
        relayer: 1,
        user: 2,
    },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  abiExporter: {
    path: "./data/abi",
    clear: true,
    flat: true,
    only: [],
    spacing: 2,
  },
  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY,
  },
};
