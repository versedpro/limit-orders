const { ethers, network } = require("hardhat");
const { replaceInFile } = require("replace-in-file");
const WETH = require("canonical-weth/build/contracts/WETH9.json");

const replaceTokenAddress = async (name, address) => {
    address = await ethers.utils.getAddress(address);
    const result = await replaceInFile({
        files: "test/tokens/" + name + ".json",
        from: new RegExp('"31337": "0x([0-9a-fA-F]{40})"'),
        to: '"31337": "' + address + '"',
    });
    return result.filter(file => file.hasChanged);
};

const deployBEP20 = async (deterministic, deployer, name, symbol, decimals) => {
    const args = [name, symbol, decimals, deployer, ethers.BigNumber.from(10).pow(decimals + 4)];
    const { deploy } = await deterministic(symbol, {
        from: deployer,
        contract: "MockBEP20",
        args,
        log: true,
    });
    const { address } = await deploy();

    await replaceTokenAddress(symbol, address);
};

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const { deterministic, execute } = deployments;
    if (network.name === "hardhat") {
        const { deploy } = await deterministic("WETH", {
            from: deployer,
            contract: WETH,
            log: true,
        });
        await deploy();
        await execute(
            "WETH",
            {
                from: deployer,
                value: ethers.constants.WeiPerEther.mul(100),
            },
            "deposit"
        );
    }
    if (network.name !== "mainnet") {
        await deployBEP20(deterministic, deployer, "CRSSToken", "CRSS", 18);
        await deployBEP20(deterministic, deployer, "BUSD", "BUSD", 18);
    }
};
