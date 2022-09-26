// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ICenterFacet {

    event merge(uint256 tokenId, uint256 level, address sender);

    function maxSupply() external view returns (uint256 _maxSuppy);

    function reservedRemaining() external view returns (uint256 _reservedRemaining);

    function walletCap() external view returns (uint256 _walletCap);

    function priceAL() external view returns (uint256 _priceAL);

    function price() external view returns (uint256 _price);

    function burnStatus() external view returns (bool _burnStatus);

    function ERC721AFacet() external view returns (address _ERC721AFacet);

    function level(uint256 tokenId) external view returns (uint256 level);

    function setPrices(uint256 _price, uint256 _priceAL) external;

    function setWalletCap(uint256 _walletCap) external;

    function toggleBurnStatus() external;

    function setERC721Facet(address _ERC721AFacet) external;

    function reserve(uint256 amount) external;

    function mint(uint256 amount, bytes32[] memory _merkleProof) external payable;

    function burn(uint256 tokenId) external;

    function transferFrom(address from, address to, uint256 tokenId) external payable;

    function safeTransferFrom(address from, address to, uint256 tokenId) external payable;

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) external payable;
    
}