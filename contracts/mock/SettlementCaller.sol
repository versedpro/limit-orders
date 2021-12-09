// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "../interfaces/ISettlement.sol";

contract SettlementCaller {
    ISettlement settlement;

    constructor(ISettlement _settlement) {
        settlement = _settlement;
    }

    function fillOrder(ISettlement.FillOrderArgs calldata args) external returns (uint256 amountOut) {
        return settlement.fillOrder(args);
    }
}
