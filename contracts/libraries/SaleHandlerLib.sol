// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**************************************************************\
 * SaleHandlerLib authored by Sibling Labs
 * Version 0.2.0
 * 
 * This library is designed to work in conjunction with
 * SaleHandlerFacet - it facilitates diamond storage and shared
 * functionality associated with SaleHandlerFacet.
/**************************************************************/

library SaleHandlerLib {
    bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("salehandlerlibrary.storage");

    struct state {
        uint256 privSaleLength;
        uint256 publicSaleLength;
        uint256 saleTimestamp;
    }

    /**
    * @dev Return stored state struct.
    */
    function getState() internal pure returns (state storage _state) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            _state.slot := position
        }
    }

    /**
    * @dev Returns a boolean indicating whether the private sale
    *      phase is currently active.
    */
    function isPrivSaleActive() internal view returns (bool) {
        state storage s = getState();
        return
            s.saleTimestamp != 0 &&
            block.timestamp >= s.saleTimestamp &&
            block.timestamp < s.saleTimestamp + s.privSaleLength;
    }

    /**
    * @dev Returns whether the public sale is currently
    *      active. If the publicSaleLength variable is
    *      set to 0, the public sale will continue
    *      forever.
    */
    function isPublicSaleActive() internal view returns (bool) {
        state storage s = getState();
        return
            s.saleTimestamp != 0 &&
            block.timestamp >= s.saleTimestamp + s.privSaleLength &&
            (
                block.timestamp < s.saleTimestamp + s.privSaleLength + s.publicSaleLength ||
                s.publicSaleLength == 0
            );
    }

    /**
    * @dev Reverts if the private sale is not active. Use this
    *      function as needed in other facets to ensure that
    *      particular functions may only be called during the
    *      private sale.
    */
    function requirePrivSaleIsActive() internal view {
        require(isPrivSaleActive(), "SaleHandlerFacet: private sale is not active now");
    }

    /**
    * @dev Reverts if the public sale is not active. Use this
    *      function as needed in other facets to ensure that
    *      particular functions may only be called during the
    *      public sale.
    */
    function requirePublicSaleIsActive() internal view {
        require(isPublicSaleActive(), "SaleHandlerFacet: public sale is not active now");
    }
}