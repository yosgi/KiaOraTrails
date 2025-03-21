// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VaultModule.sol";
import "./NFTModule.sol";
import "./FlashloanModule.sol";

contract LendingPool {
    VaultModule public vaultModule;
    NFTModule public nftModule;
    FlashloanModule public flashloanModule;

    constructor(
        address vaultModuleAddress,
        address nftModuleAddress,
        address flashloanModuleAddress
    ) {
        vaultModule = VaultModule(vaultModuleAddress);
        nftModule = NFTModule(nftModuleAddress);
        flashloanModule = FlashloanModule(flashloanModuleAddress);
    }

    function deposit(address token, uint256 amount) external {
        vaultModule.deposit(token, amount, msg.sender);
    }

    function borrow(address token, uint256 amount) external {
        vaultModule.borrow(token, amount, msg.sender);
    }

    function depositNFT(address nftAddress, uint256 tokenId) external {
        nftModule.depositNFT(nftAddress, tokenId, msg.sender);
    }

    function flashloan(
        address receiver,
        address[] calldata tokens,
        uint256[] calldata amounts,
        bytes calldata data
    ) external {
        flashloanModule.flashloan(receiver, tokens, amounts, data);
    }
}
