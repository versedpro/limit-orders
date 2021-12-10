const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    if (network.name === "hardhat") {
        const { deployer } = await getNamedAccounts();
        const { get, deterministic } = deployments;
        const factory = await get("PancakeFactory");
        const weth = await get("WETH");
        const { deploy } = await deterministic("PancakeRouter", {
            from: deployer,
            args: [factory.address, weth.address],
            log: true,
        });
        await deploy();
    }
};
