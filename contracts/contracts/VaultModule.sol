// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./libraries/VaultAccounting.sol";
import "./interfaces/PoolStructs.sol";

contract VaultModule {
    using VaultAccounting for PoolStructs.Vault;

    // Mapping from token address to its vault data.
    mapping(address => PoolStructs.TokenVault) private vaults;
    // New mapping: token => (user => balance)
    mapping(address => mapping(address => uint256)) private userBalances;

    event Deposit(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event Borrow(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event Repay(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, address indexed token, uint256 amount, uint256 shares);

    /**
     * @notice Deposits a specified amount of tokens into the vault.
     * @param token The address of the token.
     * @param amount The amount to deposit.
     * @param user The depositor's address.
     * @return shares The number of shares allocated for the deposit.
     */
    function deposit(address token, uint256 amount, address user) external returns (uint256 shares) {
        require(amount > 0, "Invalid amount");
        shares = vaults[token].totalAsset.toShares(amount, false);
        vaults[token].totalAsset.amount += uint128(amount);
        vaults[token].totalAsset.shares += uint128(shares);

        IERC20(token).transferFrom(user, address(this), amount);
        // Update user's deposited balance.
        userBalances[token][user] += amount;

        emit Deposit(user, token, amount, shares);
    }

    /**
     * @notice Borrows a specified amount of tokens from the vault.
     * @param token The address of the token.
     * @param amount The amount to borrow.
     * @param user The borrower's address.
     * @return shares The number of shares allocated for the borrow.
     */
    function borrow(address token, uint256 amount, address user) external returns (uint256 shares) {
        shares = vaults[token].totalBorrow.toShares(amount, false);
        vaults[token].totalBorrow.amount += uint128(amount);
        vaults[token].totalBorrow.shares += uint128(shares);

        IERC20(token).transfer(user, amount);
        emit Borrow(user, token, amount, shares);
    }

    /**
     * @notice Repays a specified amount of borrowed tokens.
     * @param token The address of the token.
     * @param amount The amount to repay.
     * @param user The repayer's address.
     * @return shares The number of shares reduced by the repayment.
     */
    function repay(address token, uint256 amount, address user) external returns (uint256 shares) {
        shares = vaults[token].totalBorrow.toShares(amount, true);
        vaults[token].totalBorrow.amount -= uint128(amount);
        vaults[token].totalBorrow.shares -= uint128(shares);

        IERC20(token).transferFrom(user, address(this), amount);
        emit Repay(user, token, amount, shares);
    }

    /**
     * @notice Withdraws tokens from the vault based on the user's shares.
     * @param token The address of the token.
     * @param shares The number of shares to withdraw.
     * @param user The withdrawer's address.
     * @return amount The actual token amount withdrawn.
     */
    function withdraw(address token, uint256 shares, address user) external returns (uint256 amount) {
        amount = vaults[token].totalAsset.toAmount(shares, true);
        vaults[token].totalAsset.amount -= uint128(amount);
        vaults[token].totalAsset.shares -= uint128(shares);

        IERC20(token).transfer(user, amount);
        // Update user's deposited balance.
        userBalances[token][user] -= amount;

        emit Withdraw(user, token, amount, shares);
    }

    /**
     * @notice Returns the deposited balance for a given token and user.
     * @param token The address of the token.
     * @param user The user's address.
     * @return The token balance deposited by the user.
     */
    function getBalance(address token, address user) external view returns (uint256) {
        return userBalances[token][user];
    }
}
