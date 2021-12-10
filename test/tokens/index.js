const fs = require("fs");
const path = require("path");
const { ChainId, Token, WETH: _WETH } = require("@pancakeswap/sdk");

const load = file => JSON.parse(String(fs.readFileSync(path.resolve(__dirname, file))));

const crss = load("./CRSS.json");
const busd = load("./BUSD.json");

module.exports = {
    WETH: {
        ..._WETH,
        31337: new Token(
            31337,
            "0x128236dc0cF966F37E4843D7Ed8E09b41B4053F8",
            18,
            "WETH",
            "Wrapped Ether"
        ),
    },
    CRSS: [56, 97, 31337].reduce(
        (prev, current) => ({
            ...prev,
            [current]: new Token(current, crss[current], 18, "CRSS", "CRSS token"),
        }),
        {}
    ),
    BUSD: [56, 97, 31337].reduce(
        (prev, current) => ({
            ...prev,
            [current]: new Token(current, busd[current], 18, "BUSD", "BUSD token"),
        }),
        {}
    ),
};
