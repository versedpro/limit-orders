const { ethers } = require("hardhat");
const getFactoryAddress = require("./getFactoryAddress");
const sortTokens = require("./sortTokens");

module.exports = async (tokenA, tokenB) => {
    const factory = await ethers.getContractAt(
        "contracts/mock/pancakeswap/interfaces/IPancakeFactory.sol:IPancakeFactory",
        await getFactoryAddress()
    );
    const [token0, token1] = sortTokens(tokenA, tokenB);
    return await factory.getPair(token0.address, token1.address);
};
