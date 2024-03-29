// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**************************************************************\
 * CenterFacet authored by Sibling Labs
 * Version 0.4.0
 * 
 * This facet contract has been written specifically for
 * ERC721A-DIAMOND-TEMPLATE by Sibling Labs
/**************************************************************/

import { GlobalState } from "../libraries/GlobalState.sol";
import { CenterFacetLib } from "../libraries/CenterFacetLib.sol";
import { SaleHandlerLib } from "../libraries/SaleHandlerLib.sol";
import { AllowlistLib } from "../libraries/AllowlistLib.sol";

import "../interfaces/ICenterFacet.sol";

contract CenterFacet is ICenterFacet {
    // VARIABLE GETTERS //

    function maxSupply() external view override returns (uint256) {
        return CenterFacetLib.getState().maxSupply;
    }

    function reservedRemaining() external view override returns (uint256) {
        return CenterFacetLib.getState().reservedRemaining;
    }

    function walletCap() external view override returns (uint256) {
        return CenterFacetLib.getState().walletCap;
    }

    function priceAL() external view override returns (uint256) {
        return CenterFacetLib.getState().price[0];
    }

    function price() external view override returns (uint256) {
        return CenterFacetLib.getState().price[1];
    }

    function burnStatus() external view override returns (bool) {
        return CenterFacetLib.getState().burnStatus;
    }

    function ERC721AFacet() external view override returns (address) {
        return CenterFacetLib.getState().ERC721AFacet;
    }

    function level(uint256 tokenId) external view override returns (uint256) {
        require(CenterFacetLib._exists(tokenId), "Given tokenId doesn't exist");
        return CenterFacetLib.getState().levels[tokenId];
    }

    // SETUP & ADMIN FUNCTIONS //

    function setPrices(uint256 _priceAL, uint256 _price) external override {
        GlobalState.requireCallerIsAdmin();
        CenterFacetLib.getState().price[0] = _priceAL;
        CenterFacetLib.getState().price[1] = _price;
    }

    function setWalletCap(uint256 _walletCap) external override {
        GlobalState.requireCallerIsAdmin();
        CenterFacetLib.getState().walletCap = _walletCap;
    }

    function toggleBurnStatus() external override {
        GlobalState.requireCallerIsAdmin();
        CenterFacetLib.getState().burnStatus = !CenterFacetLib.getState().burnStatus;
    }

    function setBaseURI(string memory URI) external {
        GlobalState.requireCallerIsAdmin();
        CenterFacetLib.getState().baseURI = URI;
    }

    function setERC721AFacet(address _ERC721AFacet) external override {
        GlobalState.requireCallerIsAdmin();
        CenterFacetLib.getState().ERC721AFacet = _ERC721AFacet;
    }

    function reserve(uint256 amount) external override {
        GlobalState.requireCallerIsAdmin();
        int256 check = int256(CenterFacetLib.getState().reservedRemaining) - int256(amount);
        require(check >= 0, "Not enough reserved mint remaining");
        CenterFacetLib.getState().reservedRemaining -= amount;
        CenterFacetLib.safeMint(amount);
    }

    // PUBLIC FUNCTIONS //

    function mint(uint256 amount, bytes32[] calldata _merkleProof) external override payable {
        GlobalState.requireContractIsNotPaused();
        uint256 phase;
        if(SaleHandlerLib.isPrivSaleActive()) {
            phase = 1;
        }
        else if(SaleHandlerLib.isPublicSaleActive()) {
            phase = 2;
        }
        require(phase == 1 || phase == 2, "CenterFacet: Sale is not active");
        if (phase == 1) AllowlistLib.requireValidProof(_merkleProof);

        CenterFacetLib.state storage s = CenterFacetLib.getState();
        uint256 _price = s.price[phase - 1];
        require(msg.value == _price * amount, "CenterFacet: incorrect amount of ether sent");

        uint256 numberMinted = CenterFacetLib._numberMinted(msg.sender);
        require(
            amount + numberMinted <=  s.walletCap,
            string(
                abi.encodePacked(
                    "CenterFacet: maximum tokens per wallet during the sale is ",
                    CenterFacetLib._toString(s.walletCap)
                )
            )
        );
        CenterFacetLib.safeMint(amount);
    }

    function burn(uint256 tokenId) external override {
        GlobalState.requireContractIsNotPaused();
        require(CenterFacetLib.getState().burnStatus, "CenterFacet: token burning is not available now");
        CenterFacetLib._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(CenterFacetLib._exists(tokenId), "CenterFacet: token does not exist");

        string memory baseURI = CenterFacetLib.getState().baseURI;
        return string(abi.encodePacked(baseURI, CenterFacetLib._toString(tokenId)));
    }

    function transferFrom(address from, address to, uint256 tokenId) external override payable {
        CenterFacetLib._beforeTokenTransfer(from, to, tokenId, abi.encodeWithSignature(
            "_transferFrom(address,address,uint256)", from, to, tokenId
        ));
    }
    function safeTransferFrom(address from, address to, uint256 tokenId) external override payable {
        CenterFacetLib._beforeTokenTransfer(from, to, tokenId, abi.encodeWithSignature(
            "_safeTransferFrom(address,address,uint256)", from, to, tokenId
        ));
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) external override payable {
        CenterFacetLib._beforeTokenTransfer(from, to, tokenId, abi.encodeWithSignature(
            "_safeTransferFrom(address,address,uint256,bytes)", from, to, tokenId, _data
        ));
    }

}