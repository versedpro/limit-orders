// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers, network, getChainId } = require("hardhat");
const { NomicLabsHardhatPluginError } = require("hardhat/plugins");
const getFactoryAddress = require("../test/helpers/getFactoryAddress");

let totalGas = 0;
const countTotalGas = async (tx) => {
  let res = tx;
  if (tx.deployTransaction) tx = tx.deployTransaction;
  if (tx.wait) res = await tx.wait();
  if (res.gasUsed) totalGas += parseInt(res.gasUsed);
  else console.log("no gas data", { res, tx });
};

async function main() {
  const signers = await ethers.getSigners();
  // Find deployer signer in signers.
  let deployer;
  signers.forEach((a) => {
    if (a.address === process.env.DEPLOYER001) {
      deployer = a;
    }
  });
  if (!deployer) {
    throw new Error(`${process.env.DEPLOYER001} not found in signers!`);
  }

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Network:", network.name);

  if (network.name === "testnet" || network.name === "mainnet") {

    // We get the contract to deploy
    const OrderBook = await ethers.getContractFactory("OrderBook");
    const orderBook = await OrderBook.deploy();
    await orderBook.deployed();

    await countTotalGas(orderBook);
    console.log("Deployed OrderBook Address: ", orderBook.address, { totalGas });

    const Settlement = await ethers.getContractFactory("Settlement");
    const settlement = await Settlement.deploy(
      getChainId(), orderBook.address, await getFactoryAddress()
    );
    await settlement.deployed();
    
    await countTotalGas(settlement);
    console.log("Deployed Settlement Address: ", settlement.address, { totalGas });

    console.log("-------Verifying-----------");
    try {
      // verify
      await run("verify:verify", {
        address: orderBook.address
      });

    } catch (error) {
      if (error instanceof NomicLabsHardhatPluginError) {
        console.log("Contract source code already verified");
      } else {
        console.error(error);
      }
    }

    try {
      // verify
      await run("verify:verify", {
        address: settlement.address,
        constructorArguments: [
          getChainId(), orderBook.address, await getFactoryAddress()
        ]
      });

    } catch (error) {
      if (error instanceof NomicLabsHardhatPluginError) {
        console.log("Contract source code already verified");
      } else {
        console.error(error);
      }
    }

    const deployerLog = { Label: "Deploying Address", Info: deployer.address };
    const orderBookLog = {
      Label: "Deployed OrderBook Address",
      Info: orderBook.address,
    };
    const settlementLog = {
      Label: "Deployed Settlement Address",
      Info: settlement.address,
    };

    console.table([deployerLog, orderBookLog, settlementLog]);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
