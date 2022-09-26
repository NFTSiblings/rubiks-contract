// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**************************************************************\
 * AllowlistFacet authored by Sibling Labs
 * Version 0.1.0
/**************************************************************/

import { GlobalState } from "../libraries/GlobalState.sol";
import { AllowlistLib } from "../libraries/AllowlistLib.sol";

contract AllowlistFacet {
    /**
    * @dev Get stored Merkle root.
    */
    function merkleRoot() external view returns (bytes32) {
        return AllowlistLib.getState().merkleRoot;
    }
    
    /**
    * @dev Set stored Merkle root.
    */
    function setMerkleRoot(bytes32 root) external {
        GlobalState.requireCallerIsAdmin();
        AllowlistLib.getState().merkleRoot = root;
    }
}