// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**************************************************************\
 * RoyaltiesConfigFacet authored by Sibling Labs
 * Version 0.1.0
/**************************************************************/

import { GlobalState } from "../libraries/GlobalState.sol";
import { RoyaltiesConfigLib } from "../libraries/RoyaltiesConfigLib.sol";

contract RoyaltiesConfigFacet {
    /**
     * @dev Returns royalty payee and amount for tokens in this
     *      collection. Adheres to EIP-2981.
     */
    function royaltyInfo(uint256, uint256 value) external virtual view returns (address, uint256) {
        return RoyaltiesConfigLib.royaltyInfo(0, value);
    }

    /**
     * @dev Set royalty recipient and basis points.
     */
    function setRoyalties(address payable recipient, uint256 bps) external {
        GlobalState.requireCallerIsAdmin();

        RoyaltiesConfigLib.state storage s = RoyaltiesConfigLib.getState();
        s.royaltyRecipient = recipient;
        s.royaltyBps = bps;
    }
}