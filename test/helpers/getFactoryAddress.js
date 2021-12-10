const { deployments, network } = require("hardhat");

module.exports = async () => {
    if (network.name === "hardhat") {
        const { get } = deployments;
        return (await get("PancakeFactory")).address;
    } else if (network.name === "mainnet") {
        return "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";
    } else {
        // Use Pancakeswap's factory for testnets
        return "0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc";
    }
};
