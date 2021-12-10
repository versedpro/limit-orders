const { network, getChainId } = require("hardhat");
const getFactoryAddress = require("../test/helpers/getFactoryAddress");

const INIT_CODE_HASH = "00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5";

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const { call, deploy, deterministic } = deployments;

    const artifact = await deployments.getArtifact("Settlement");
    const contract = {
        abi: artifact.abi,
        bytecode: artifact.bytecode,
    };
    if (network.name === "hardhat") {
        const testInitCodeHash = await call("PancakeFactory", "pairCodeHash");
        contract.bytecode = contract.bytecode.replace(
            new RegExp(INIT_CODE_HASH, "g"),
            testInitCodeHash.substring(2)
        );
    }

    const chainId = network.name === "mainnet" ? 56 : await getChainId();
    const { address: orderBook } = await deterministic("OrderBook", {
        from: deployer,
        log: true,
    });
    await deploy("Settlement", {
        contract,
        args: [chainId, orderBook, await getFactoryAddress()],
        from: deployer,
        log: true,
        gasLimit: 5000000,
    });
};
