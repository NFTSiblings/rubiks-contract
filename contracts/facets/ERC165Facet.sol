// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**************************************************************\
 * ERC165Facet authored by Sibling Labs
 * Version 0.1.0
/**************************************************************/

import { GlobalState } from "../libraries/GlobalState.sol";
import { ERC165Lib } from "../libraries/ERC165Lib.sol";

contract ERC165Facet {
    /**
    * @dev Called by marketplaces to query support for smart
    *      contract interfaces. Required by ERC165.
    */
    function supportsInterface(bytes4 _interfaceId) external view returns (bool) {
        return ERC165Lib.getState().supportedInterfaces[_interfaceId];
    }

    /**
    * @dev Toggle support for bytes4 interface selector.
    */
    function toggleInterfaceSupport(bytes4 selector) external {
        GlobalState.requireCallerIsAdmin();

        if (ERC165Lib.getState().supportedInterfaces[selector]) {
            delete ERC165Lib.getState().supportedInterfaces[selector];
        } else {
            ERC165Lib.getState().supportedInterfaces[selector] = true;
        }
    }
}