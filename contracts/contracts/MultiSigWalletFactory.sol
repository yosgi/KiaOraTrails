// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MultiSigWallet
 * @dev 任务专用的多签钱包
 */
contract MultiSigWallet {
    // 交易结构
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }
    
    // 状态变量
    address[] public owners;
    uint256 public requiredConfirmations;
    uint256 public taskId;
    address public taskContract;
    
    // 映射
    mapping(address => bool) public isOwner;
    mapping(uint256 => mapping(address => bool)) public isConfirmed;
    
    // 交易数组
    Transaction[] public transactions;
    
    // 事件
    event Deposit(address indexed sender, uint256 amount);
    event SubmitTransaction(address indexed owner, uint256 indexed txIndex, address indexed to, uint256 value, bytes data);
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);
    
    /**
     * @dev 检查调用者是否为所有者
     */
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }
    
    /**
     * @dev 检查交易是否存在
     */
    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, "Tx does not exist");
        _;
    }
    
    /**
     * @dev 检查交易是否未执行
     */
    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "Tx already executed");
        _;
    }
    
    /**
     * @dev 检查交易是否未被该所有者确认
     */
    modifier notConfirmed(uint256 _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "Tx already confirmed");
        _;
    }
    
    /**
     * @dev 构造函数
     * @param _owners 所有者地址数组
     * @param _requiredConfirmations 所需确认数
     * @param _taskId 关联的任务ID
     * @param _taskContract 任务合约地址
     */
    constructor(
        address[] memory _owners,
        uint256 _requiredConfirmations,
        uint256 _taskId,
        address _taskContract
    ) {
        require(_owners.length > 0, "Owners required");
        require(
            _requiredConfirmations > 0 && _requiredConfirmations <= _owners.length,
            "Invalid confirmations"
        );
        
        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");
            
            isOwner[owner] = true;
            owners.push(owner);
        }
        
        requiredConfirmations = _requiredConfirmations;
        taskId = _taskId;
        taskContract = _taskContract;
    }
    
    /**
     * @dev 接收ETH
     */
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @dev 提交交易
     * @param _to 接收者地址
     * @param _value 金额
     * @param _data 数据
     * @return 交易索引
     */
    function submitTransaction(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner returns (uint256) {
        uint256 txIndex = transactions.length;
        
        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            confirmations: 0
        }));
        
        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
        
        // 自动确认提交者的交易
        confirmTransaction(txIndex);
        
        return txIndex;
    }
    
    /**
     * @dev 确认交易
     * @param _txIndex 交易索引
     */
    function confirmTransaction(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        transaction.confirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;
        
        emit ConfirmTransaction(msg.sender, _txIndex);
        
        // 如果达到所需确认数，自动执行
        if (transaction.confirmations >= requiredConfirmations) {
            executeTransaction(_txIndex);
        }
    }
    
    /**
     * @dev 执行交易
     * @param _txIndex 交易索引
     */
    function executeTransaction(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        
        require(transaction.confirmations >= requiredConfirmations, "Not enough confirmations");
        
        transaction.executed = true;
        
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Transaction failed");
        
        emit ExecuteTransaction(msg.sender, _txIndex);
    }
    
    /**
     * @dev 撤销确认
     * @param _txIndex 交易索引
     */
    function revokeConfirmation(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        require(isConfirmed[_txIndex][msg.sender], "Tx not confirmed");
        
        Transaction storage transaction = transactions[_txIndex];
        transaction.confirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;
        
        emit RevokeConfirmation(msg.sender, _txIndex);
    }
    
    /**
     * @dev 获取所有者数量
     * @return 所有者数量
     */
    function getOwnersCount() public view returns (uint256) {
        return owners.length;
    }
    
    /**
     * @dev 获取所有所有者
     * @return 所有者地址数组
     */
    function getOwners() public view returns (address[] memory) {
        return owners;
    }
    
    /**
     * @dev 获取交易数量
     * @return 交易数量
     */
    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }
    function getTransaction(uint256 _txIndex)
        public
        view
        returns (
            address to,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 confirmations
        )
    {
        Transaction storage transaction = transactions[_txIndex];
        
        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.confirmations
        );
    }
}

/**
 * @title MultiSigWalletFactory
 * @dev 创建与任务关联的多签钱包
 */
contract MultiSigWalletFactory is Ownable {
    address public trailMaintenanceContract;
    
    // 映射: 任务ID => 多签钱包地址
    mapping(uint256 => address) public taskMultiSigs;
    
    // 事件
    event MultiSigCreated(uint256 indexed taskId, address multiSigAddress, address[] owners, uint256 threshold);
    
    /**
     * @dev 构造函数
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev 设置步道维护合约地址
     * @param _trailContract 步道维护合约地址
     */
    function setTrailMaintenanceContract(address _trailContract) external onlyOwner {
        require(_trailContract != address(0), "Invalid address");
        trailMaintenanceContract = _trailContract;
    }
    
    /**
     * @dev 创建多签钱包
     * @param _taskId 任务ID
     * @param _owners 所有者地址数组
     * @param _threshold 阈值（需要多少签名才能执行交易）
     * @return 新创建的多签钱包地址
     */
    function createMultiSig(
        uint256 _taskId,
        address[] memory _owners,
        uint256 _threshold
    ) external returns (address) {
        require(msg.sender == trailMaintenanceContract || msg.sender == owner(), "Not authorized");
        require(_owners.length > 0, "Owners required");
        require(_threshold > 0 && _threshold <= _owners.length, "Invalid threshold");
        require(taskMultiSigs[_taskId] == address(0), "MultiSig already exists for task");
        
        // 创建新的多签钱包
        MultiSigWallet multiSig = new MultiSigWallet(
            _owners,
            _threshold,
            _taskId,
            trailMaintenanceContract
        );
        
        address multiSigAddress = address(multiSig);
        taskMultiSigs[_taskId] = multiSigAddress;
        
        emit MultiSigCreated(_taskId, multiSigAddress, _owners, _threshold);
        
        return multiSigAddress;
    }
    
    /**
     * @dev 获取任务的多签钱包地址
     * @param _taskId 任务ID
     * @return 多签钱包地址
     */
    function getMultiSig(uint256 _taskId) external view returns (address) {
        return taskMultiSigs[_taskId];
    }
    
    /**
     * @dev 检查任务是否已有多签钱包
     * @param _taskId 任务ID
     * @return 布尔值
     */
    function hasMultiSig(uint256 _taskId) external view returns (bool) {
        return taskMultiSigs[_taskId] != address(0);
    }
}