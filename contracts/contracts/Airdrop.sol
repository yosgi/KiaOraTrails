// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title Airdrop Contract
/// @notice This contract allows users to claim an airdrop of tokens. Each address can claim only once.
/// @dev The contract must be pre-funded with enough tokens for the airdrop.
contract Airdrop {
    IERC20 public token;             // The ERC20 token contract used for the airdrop
    uint256 public airdropAmount;    // The amount of tokens each user receives (in the token's smallest unit)
    mapping(address => bool) public claimed;  // Mapping to track which addresses have claimed the airdrop

    address public owner;            // The owner of the contract

    event AirdropClaimed(address indexed claimant, uint256 amount);

    /// @notice Modifier to restrict functions to only the owner.
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// @notice Constructor sets the token address and airdrop amount.
    /// @param tokenAddress The address of the ERC20 token contract.
    /// @param _airdropAmount The amount of tokens each user can claim (in the token's smallest unit).
    constructor(address tokenAddress, uint256 _airdropAmount) {
        require(tokenAddress != address(0), "Invalid token address");
        token = IERC20(tokenAddress);
        airdropAmount = _airdropAmount;
        owner = msg.sender;
    }

    /// @notice Allows a user to claim the airdrop. Each address can only claim once.
    function claimAirdrop() external {
        require(!claimed[msg.sender], "Airdrop already claimed");
        require(token.balanceOf(address(this)) >= airdropAmount, "Not enough tokens in contract");

        claimed[msg.sender] = true;
        require(token.transfer(msg.sender, airdropAmount), "Token transfer failed");
        emit AirdropClaimed(msg.sender, airdropAmount);
    }

    /// @notice Allows the owner to withdraw tokens from the contract.
    /// @param amount The amount of tokens to withdraw (in the token's smallest unit).
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(token.balanceOf(address(this)) >= amount, "Not enough tokens");
        require(token.transfer(owner, amount), "Token transfer failed");
    }
}
