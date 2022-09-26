// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**************************************************************\
 * SaleHandlerFacet authored by Sibling Labs
 * Version 0.2.0
/**************************************************************/

import { GlobalState } from "../libraries/GlobalState.sol";
import { SaleHandlerLib } from "../libraries/SaleHandlerLib.sol";

contract SaleHandlerFacet {
    /**
    * @dev Get length of private sale in seconds.
    */
    function privSaleLength() external view returns (uint256) {
        return SaleHandlerLib.getState().privSaleLength;
    }

    /**
    * @dev Get length of public sale in seconds.
    */
    function publicSaleLength() external view returns (uint256) {
        return SaleHandlerLib.getState().publicSaleLength;
    }

    /**
    * @dev Get timestamp when sale begins.
    */
    function saleTimestamp() external view returns (uint256) {
        return SaleHandlerLib.getState().saleTimestamp;
    }

    /**
     * @dev Begin the private sale. The private sale will
     *      automatically begin, and the public sale will
     *      automatically begin after the private sale
     *      has concluded.
     */
    function beginPrivSale() external {
        GlobalState.requireCallerIsAdmin();
        SaleHandlerLib.getState().saleTimestamp = block.timestamp;
    }

    /**
     * @dev Set the exact time when the private sale will begin.
     */
    function setSaleTimestamp(uint256 timestamp) external {
        GlobalState.requireCallerIsAdmin();
        SaleHandlerLib.getState().saleTimestamp = timestamp;
    }

    /**
    * @dev Updates private sale length. Length argument must be
    *      a whole number of hours.
    */
    function setPrivSaleLengthInHours(uint256 length) external {
        GlobalState.requireCallerIsAdmin();
        SaleHandlerLib.getState().privSaleLength = length * 3600;
    }

    /**
    * @dev Updates public sale length. Length argument must be
    *      a whole number of hours.
    */
    function setPublicSaleLengthInHours(uint256 length) external {
        GlobalState.requireCallerIsAdmin();
        SaleHandlerLib.getState().publicSaleLength = length * 3600;
    }

    /**
    * @dev Returns a boolean indicating whether the private sale
    *      phase is currently active.
    */
    function isPrivSaleActive() external view returns (bool) {
        return SaleHandlerLib.isPrivSaleActive();
    }

    /**
    * @dev Returns whether the public sale is currently
    *      active.
    */
    function isPublicSaleActive() external view returns (bool) {
        return SaleHandlerLib.isPublicSaleActive();
    }
}