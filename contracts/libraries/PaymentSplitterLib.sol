// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**************************************************************\
 * PaymentSplitterLib authored by Sibling Labs
 * Version 0.2.0
 * 
 * This library is designed to work in conjunction with
 * PaymentSplitterFacet - it facilitates diamond storage and shared
 * functionality associated with PaymentSplitterFacet.
/**************************************************************/

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

library PaymentSplitterLib {
    event PayeeAdded(address account, uint256 shares);
    event PaymentReleased(address to, uint256 amount);
    event ERC20PaymentReleased(IERC20Upgradeable indexed token, address to, uint256 amount);

    bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("paymentsplitter.storage");

    struct state {
        uint256 _totalShares;
        uint256 _totalReleased;

        mapping(address => uint256) _shares;
        mapping(address => uint256) _released;
        address[] _payees;

        mapping(IERC20Upgradeable => uint256) _erc20TotalReleased;
        mapping(IERC20Upgradeable => mapping(address => uint256)) _erc20Released;
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
     * @dev Add a new payee to the contract.
     * @param account The address of the payee to add.
     * @param shares_ The number of shares owned by the payee.
     */
    function _addPayee(address account, uint256 shares_) internal {
        PaymentSplitterLib.state storage s = PaymentSplitterLib.getState();

        require(account != address(0), "PaymentSplitter: account is the zero address");
        require(shares_ > 0, "PaymentSplitter: shares are 0");
        require(s._shares[account] == 0, "PaymentSplitter: account already has shares");

        s._payees.push(account);
        s._shares[account] = shares_;
        s._totalShares = s._totalShares + shares_;
        emit PayeeAdded(account, shares_);
    }
}