const { ChainId, ETHER, Token, TokenAmount, Pair } = require("@pancakeswap/sdk");
const { ethers } = require("ethers");
const { getCreate2Address, solidityKeccak256, solidityPack } = ethers.utils;
const artifacts = {
    IPancakePair: require("@pancakeswap-libs/pancake-swap-core/build/IPancakePair.json"),
};

const { WETH, CRSS, BUSD } = require("../tokens");

const INIT_CODE_HASH = {
    [ChainId.MAINNET]: "0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5",
    [ChainId.TESTNET]: "0xecba335299a6693cb2ebc4782e74669b84290b6378ea3a3873c7231a8d7d1074",
    31337: "0x739b8710de1bce6173064701aa134e7aa68c90d8c52c889fd039ed8a090543ed",
};

const BASES_TO_CHECK_TRADES_AGAINST = {
    [ChainId.MAINNET]: [
        WETH[ChainId.MAINNET],
        CRSS[ChainId.MAINNET],
        BUSD[ChainId.MAINNET],
    ],
    [ChainId.TESTNET]: [
        WETH[ChainId.TESTNET],
        CRSS[ChainId.TESTNET],
        BUSD[ChainId.TESTNET],
    ],
    31337: [WETH[31337], CRSS[31337], BUSD[31337]],
};

const CUSTOM_BASES = {
    [ChainId.MAINNET]: {},
};

function wrappedCurrency(chainId, currency) {
    return currency === ETHER ? WETH[chainId] : currency instanceof Token ? currency : undefined;
}

const findPairs = async (chainId, factory, currencyA, currencyB, provider) => {
    const bases = BASES_TO_CHECK_TRADES_AGAINST[chainId];
    const [tokenA, tokenB] = [
        wrappedCurrency(chainId, currencyA),
        wrappedCurrency(chainId, currencyB),
    ];
    const basePairs = bases
        .flatMap(base => bases.map(otherBase => [base, otherBase]))
        .filter(([t0, t1]) => t0.address !== t1.address);

    const allPairCombinations =
        tokenA && tokenB
            ? [
                  // the direct pair
                  [tokenA, tokenB],
                  // token A against all bases
                  ...bases.map(base => [tokenA, base]),
                  // token B against all bases
                  ...bases.map(base => [tokenB, base]),
                  // each base against all bases
                  ...basePairs,
              ]
                  .filter(tokens => Boolean(tokens[0] && tokens[1]))
                  .filter(([t0, t1]) => t0.address !== t1.address)
                  .filter(([a, b]) => {
                      const customBases = CUSTOM_BASES;
                      if (!customBases) return true;

                      const customBasesA = customBases[a.address];
                      const customBasesB = customBases[b.address];

                      if (!customBasesA && !customBasesB) return true;

                      if (customBasesA && !customBasesA.find(base => tokenB.equals(base)))
                          return false;
                      return !(customBasesB && !customBasesB.find(base => tokenA.equals(base)));
                  })
            : [];

    const pairs = await Promise.all(
        allPairCombinations.map(async pair => {
            try {
                return await fetchPairData(chainId, factory, pair[0], pair[1], provider);
            } catch (e) {
                return null;
            }
        })
    );
    return pairs.filter(pair => pair !== null);
};

let PAIR_ADDRESS_CACHE = {};

const fetchPairData = async (chainId, factory, tokenA, tokenB, provider) => {
    const address = getAddress(chainId, factory, tokenA, tokenB);
    const [reserves0, reserves1] = await new ethers.Contract(
        address,
        artifacts.IPancakePair.abi,
        provider
    ).getReserves();
    const balances = tokenA.sortsBefore(tokenB) ? [reserves0, reserves1] : [reserves1, reserves0];
    return new Pair(new TokenAmount(tokenA, balances[0]), new TokenAmount(tokenB, balances[1]));
};

const getAddress = (chainId, factory, tokenA, tokenB) => {
    const tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]; // does safety checks

    if (
        PAIR_ADDRESS_CACHE[tokens[0].address] === undefined ||
        PAIR_ADDRESS_CACHE[tokens[0].address][tokens[1].address] === undefined
    ) {
        PAIR_ADDRESS_CACHE = {
            ...PAIR_ADDRESS_CACHE,
            [tokens[0].address]: {
                ...PAIR_ADDRESS_CACHE[tokens[0].address],
                [tokens[1].address]: getCreate2Address(
                    factory,
                    solidityKeccak256(
                        ["bytes"],
                        [
                            solidityPack(
                                ["address", "address"],
                                [tokens[0].address, tokens[1].address]
                            ),
                        ]
                    ),
                    INIT_CODE_HASH[chainId]
                ),
            },
        };
    }

    return PAIR_ADDRESS_CACHE[tokens[0].address][tokens[1].address];
};

module.exports = findPairs;
