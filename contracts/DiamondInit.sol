// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**************************************************************\
 * Initialiser contract authored by Sibling Labs
 * Version 0.4.0
 * 
 * This initialiser contract has been written specifically for
 * ERC721A-DIAMOND-TEMPLATE by Sibling Labs
/**************************************************************/

import { GlobalState } from "./libraries/GlobalState.sol";
import { AllowlistLib } from "./libraries/AllowlistLib.sol";
import { CenterFacetLib } from "./libraries/CenterFacetLib.sol";
import { ERC165Lib } from "./libraries/ERC165Lib.sol";
import "erc721a-upgradeable/contracts/ERC721AStorage.sol";
import { PaymentSplitterLib } from "./libraries/PaymentSplitterLib.sol";
import { SaleHandlerLib } from "./libraries/SaleHandlerLib.sol";
import { RoyaltiesConfigLib } from "./libraries/RoyaltiesConfigLib.sol";

contract DiamondInit {

    function initAll() public {
        initAdminPrivilegesFacet();
        initAllowlistFacet();
        initCenterFacet();
        initERC165Facet();
        initERC721AFacet();
        initPaymentSplitterFacet();
        initSaleHandlerFacet();
        initRoyaltiesConfigFacet();
    }

    // AdminPrivilegesFacet //

    function initAdminPrivilegesFacet() public {
        // List of admins must be placed inside this function,
        // as arrays cannot be constant and
        // therefore will not be accessible by the
        // delegatecall from the diamond contract.
        address[] memory admins = new address[](1);
        admins[0] = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

        for (uint256 i; i < admins.length; i++) {
            GlobalState.getState().admins[admins[i]] = true;
        }
    }

    // AllowlistFacet //

    // merkleRoot based on ethers.getSigners first 3 accounts
    bytes32 private constant merkleRoot = 0x55e8063f883b9381398d8fef6fbae371817e8e4808a33a4145b8e3cdd65e3926;

    function initAllowlistFacet() public {
        AllowlistLib.getState().merkleRoot = merkleRoot;
    }

    // CenterFacet //

    address private constant ERC721AFacet = 0x67b85b3564d4a1FD29d82dDd99f96761c25A4949; // rinkeby

    function initCenterFacet() public {
        CenterFacetLib.state storage s = CenterFacetLib.getState();

        s.ERC721AFacet = ERC721AFacet;
        s.maxSupply = 22;
        s.walletCap = 4;
        s.price = [0.001 ether, 0.0015 ether];
        s.baseURI = "https://gateway.pinata.cloud/ipfs/.../?";
        s.reservedRemaining = 7;
    }

    // ERC165Facet //

    bytes4 private constant ID_IERC165 = 0x01ffc9a7;
    bytes4 private constant ID_IERC173 = 0x7f5828d0;
    bytes4 private constant ID_IERC2981 = 0x2a55205a;
    bytes4 private constant ID_IERC721 = 0x80ac58cd;
    bytes4 private constant ID_IERC721METADATA = 0x5b5e139f;
    bytes4 private constant ID_IDIAMONDLOUPE = 0x48e2b093;
    bytes4 private constant ID_IDIAMONDCUT = 0x1f931c1c;

    function initERC165Facet() public {
        ERC165Lib.state storage s = ERC165Lib.getState();

        s.supportedInterfaces[ID_IERC165] = true;
        s.supportedInterfaces[ID_IERC173] = true;
        s.supportedInterfaces[ID_IERC2981] = true;
        s.supportedInterfaces[ID_IERC721] = true;
        s.supportedInterfaces[ID_IERC721METADATA] = true;

        s.supportedInterfaces[ID_IDIAMONDLOUPE] = true;
        s.supportedInterfaces[ID_IDIAMONDCUT] = true;
    }

    // ERC721AFacet //

    string private constant name = "MyToken";
    string private constant symbol = "MTK";
    uint256 private constant startTokenId = 0;

    function initERC721AFacet() public {
        ERC721AStorage.layout()._name = name;
        ERC721AStorage.layout()._symbol = symbol;
        ERC721AStorage.layout()._currentIndex = startTokenId;
    }

    // PaymentSplitterFacet //

    function initPaymentSplitterFacet() public {
        // Lists of payees and shares must be placed inside this
        // function, as arrays cannot be constant and therefore
        // will not be accessible by the delegatecall from the
        // diamond contract.
        address[] memory payees = new address[](1);
        payees[0] = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

        uint256[] memory shares = new uint256[](1);
        shares[0] = 1;

        require(payees.length == shares.length, "PaymentSplitter: payees and shares length mismatch");
        require(payees.length > 0, "PaymentSplitter: no payees");

        for (uint256 i = 0; i < payees.length; i++) {
            PaymentSplitterLib._addPayee(payees[i], shares[i]);
        }
    }

    // SaleHandlerFacet //

    uint256 private constant privSaleTimestamp = 2663532308;  //1663286400
    uint256 private constant privSaleLength = 86400;
    uint256 private constant publicSaleLength = 86400;

    function initSaleHandlerFacet() public {
        SaleHandlerLib.state storage s = SaleHandlerLib.getState();

        s.saleTimestamp = privSaleTimestamp;
        s.privSaleLength = privSaleLength;
        s.publicSaleLength = publicSaleLength;
    }

    // RoyaltiesConfigFacet //

    address payable private constant royaltyRecipient = payable(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
    uint256 private constant royaltyBps = 10000;

    function initRoyaltiesConfigFacet() public {
        RoyaltiesConfigLib.state storage s = RoyaltiesConfigLib.getState();

        s.royaltyRecipient = royaltyRecipient;
        s.royaltyBps = royaltyBps;
    }

}