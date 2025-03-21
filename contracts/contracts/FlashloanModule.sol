// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IFlashLoanReceiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FlashloanModule {
    event FlashloanExecuted(address receiver, address[] tokens, uint256[] amounts);

    /**
     * @dev Executes a flash loan.
     * @param receiver The address of the flash loan receiver contract.
     * @param tokens An array of token addresses to be borrowed.
     * @param amounts An array of amounts for each token to be borrowed.
     * @param data Arbitrary data passed to the receiver contract.
     */
    function flashloan(
        address receiver,
        address[] calldata tokens,
        uint256[] calldata amounts,
        bytes calldata data
    ) external {
        require(tokens.length == amounts.length, "Array length mismatch");

        uint256[] memory fees = new uint256[](tokens.length);

        // Transfer tokens to the receiver
        for (uint256 i = 0; i < tokens.length; i++) {
            IERC20(tokens[i]).transfer(receiver, amounts[i]);
            fees[i] = calculateFee(amounts[i]); // Replace with your fee logic
        }

        // Call the receiver's `onFlashLoan` function
        bool success = IFlashLoanReceiver(receiver).onFlashLoan(
            msg.sender,
            tokens,
            amounts,
            fees,
            data
        );
        require(success, "Flashloan execution failed");

        // Collect repayment + fees
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 repaymentAmount = amounts[i] + fees[i];
            IERC20(tokens[i]).transferFrom(receiver, address(this), repaymentAmount);
        }

        emit FlashloanExecuted(receiver, tokens, amounts);
    }

    /**
     * @dev Calculates the fee for a given flash loan amount.
     * @param amount The amount of the flash loan.
     * @return The fee for the flash loan.
     */
    function calculateFee(uint256 amount) internal pure returns (uint256) {
        // Example: 0.05% fee
        return (amount * 5) / 10000;
    }
}
