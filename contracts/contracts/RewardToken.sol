// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RewardToken
 * @dev 激励代币，用于奖励捐赠者和承接者
 */
contract RewardToken is ERC20, ERC20Burnable, Ownable {
    address public trailMaintenanceContract;
    
    /**
     * @dev 构造函数
     * @param initialSupply 初始供应量
     */
    constructor(uint256 initialSupply) ERC20("TrailToken", "TRAIL") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }
    
    /**
     * @dev 设置步道维护合约地址
     * @param _trailContract 步道维护合约地址
     */
    function setTrailMaintenanceContract(address _trailContract) external onlyOwner {
        require(_trailContract != address(0), "Invalid address");
        trailMaintenanceContract = _trailContract;
    }
    
    /**
     * @dev 铸造代币
     * @param to 接收者地址
     * @param amount 代币数量
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == owner() || msg.sender == trailMaintenanceContract, "Not authorized");
        _mint(to, amount);
    }
    
    /**
     * @dev 覆盖transfer函数，添加额外的检查
     * @param to 接收者地址
     * @param value 转账金额
     */
    function transfer(address to, uint256 value) public virtual override returns (bool) {
        require(to != address(0), "ERC20: transfer to the zero address");
        return super.transfer(to, value);
    }
    
    /**
     * @dev 覆盖transferFrom函数，添加额外的检查
     * @param from 发送者地址
     * @param to 接收者地址
     * @param value 转账金额
     */
    function transferFrom(address from, address to, uint256 value) public virtual override returns (bool) {
        require(to != address(0), "ERC20: transfer to the zero address");
        return super.transferFrom(from, to, value);
    }
}