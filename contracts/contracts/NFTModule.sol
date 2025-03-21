// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./interfaces/PoolStructs.sol";

contract NFTModule {
    mapping(address => mapping(uint256 => address)) private nftOwners;

    event DepositNFT(address indexed user, address indexed nftAddress, uint256 indexed tokenId);
    event WithdrawNFT(address indexed user, address indexed nftAddress, uint256 indexed tokenId);

    function depositNFT(address nftAddress, uint256 tokenId, address user) external {
        IERC721(nftAddress).transferFrom(user, address(this), tokenId);
        nftOwners[nftAddress][tokenId] = user;
        emit DepositNFT(user, nftAddress, tokenId);
    }

    function withdrawNFT(address nftAddress, uint256 tokenId, address user) external {
        require(nftOwners[nftAddress][tokenId] == user, "Not the owner");
        nftOwners[nftAddress][tokenId] = address(0);
        IERC721(nftAddress).transferFrom(address(this), user, tokenId);
        emit WithdrawNFT(user, nftAddress, tokenId);
    }
}
