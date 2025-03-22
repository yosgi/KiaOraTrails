// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TrailMaintenance
 * @dev 一个关于步道维护的去中心化众筹平台
 */
contract TrailMaintenance is Ownable, ReentrancyGuard, Pausable {
    
    // 常量
    uint256 private constant MAX_REWARD_RATE = 10; // 最大奖励率10%
    uint256 private constant MIN_TIMELOCK = 1 days; // 最小时间锁定1天
    
    // 问题状态枚举
    enum TaskStatus { Created, Assigned, Completed, Cancelled }
    
    // 问题结构体
    struct Task {
        uint256 id;
        address issuer;
        string description;
        uint256 targetAmount;
        uint256 currentAmount;
        address assignee;
        TaskStatus status;
        address multiSigWallet;
        uint256 createdAt;
        uint256 completionTime; // 完成时间（用于时间锁定）
    }
    
    // 捐赠结构体
    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
    }
    
    // NFT奖励记录结构体
    struct NFTReward {
        uint256 taskId;
        uint256 tokenId;
        address recipient;
        uint256 timestamp;
    }
    
    // Token奖励记录结构体
    struct TokenReward {
        uint256 amount;
        address recipient;
        string reason;
        uint256 timestamp;
    }
    
    // 变量
    uint256 private _taskCount; // 任务总数（替代原来的自增ID）
    mapping(uint256 => bool) private _taskExists; // 记录任务ID是否已经存在
    IERC20 public rewardToken;
    address public nftToken;
    address public multiSigFactory;
    uint256 public donationRewardRate = 1000000; // 1000000% 奖励率
    uint256 public assigneeRewardAmount = 100 * 10**18; // 100 tokens
    uint256 public timelock = 2 days; // 默认时间锁定2天
    
    // 添加新的变量用于追踪资金和贡献者
    uint256 private _totalContributors; // 发起任务的唯一贡献者数量
    mapping(address => bool) private _isContributor; // 标记地址是否为贡献者
    
    // 添加新的变量用于追踪NFT和Token奖励
    mapping(address => NFTReward[]) private _userNFTRewards; // 用户获得的NFT奖励
    mapping(address => TokenReward[]) private _userTokenRewards; // 用户获得的Token奖励
    mapping(address => uint256) private _donationRewardsTotal; // 用户因捐赠获得的总Token奖励
    mapping(address => uint256) private _completionRewardsTotal; // 用户因完成任务获得的总Token奖励
    
    // 映射
    mapping(uint256 => Task) private _tasks;
    mapping(uint256 => Donation[]) private _donations;
    mapping(uint256 => address[]) private _donorsList;
    mapping(uint256 => mapping(address => bool)) private _hasDonated;
    mapping(uint256 => mapping(address => bool)) private _approvals;
    mapping(uint256 => uint256) private _approvalCounts;
    mapping(address => uint256[]) private _userTasks; // 用户的任务列表
    
    // 事件
    event TaskCreated(uint256 indexed taskId, address indexed issuer, string description, uint256 targetAmount);
    event TaskAssigned(uint256 indexed taskId, address indexed assignee);
    event DonationReceived(uint256 indexed taskId, address indexed donor, uint256 amount);
    event TokensRewarded(address indexed recipient, uint256 amount, string reason);
    event NFTRewarded(address indexed recipient, uint256 tokenId, uint256 indexed taskId);
    event TaskCompleted(uint256 indexed taskId);
    event TaskCancelled(uint256 indexed taskId);
    event FundsReleased(uint256 indexed taskId, address indexed recipient, uint256 amount);
    event FundsRefunded(uint256 indexed taskId, address indexed donor, uint256 amount);
    event MultiSigCreated(uint256 indexed taskId, address indexed multiSigWallet);
    event CompletionRequested(uint256 indexed taskId, uint256 unlockTime);
    
    /**
     * @dev 构造函数
     * @param _rewardToken 激励代币合约地址
     * @param _nftToken NFT代币合约地址
     * @param _multiSigFactory 多签钱包工厂合约地址
     */
    constructor(
        address _rewardToken,
        address _nftToken,
        address _multiSigFactory
    ) Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken);
        nftToken = _nftToken;
        multiSigFactory = _multiSigFactory;
    }
    
    /**
     * @dev 紧急暂停
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复运行
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 发布问题
     * @param _taskId 外部传入的任务ID
     * @param _description 问题描述
     * @param _targetAmount 目标金额 (可选，0表示无限制)
     * @return 创建的任务ID
     */
    function createTask(uint256 _taskId, string calldata _description, uint256 _targetAmount) external whenNotPaused returns (uint256) {
        require(_taskId > 0, "Task ID must be greater than 0");
        require(!_taskExists[_taskId], "Task ID already exists");
        
        _taskExists[_taskId] = true;
        _taskCount++;
        
        _tasks[_taskId] = Task({
            id: _taskId,
            issuer: msg.sender,
            description: _description,
            targetAmount: _targetAmount,
            currentAmount: 0,
            assignee: address(0),
            status: TaskStatus.Created,
            multiSigWallet: address(0),
            createdAt: block.timestamp,
            completionTime: 0
        });
        
        // 将任务ID添加到用户的任务列表
        _userTasks[msg.sender].push(_taskId);
        
        // 追踪唯一贡献者
        if (!_isContributor[msg.sender]) {
            _isContributor[msg.sender] = true;
            _totalContributors++;
        }
        
        emit TaskCreated(_taskId, msg.sender, _description, _targetAmount);
        
        return _taskId;
    }
    
    /**
     * @dev 承接问题
     * @param _taskId 问题ID
     */
    function assignTask(uint256 _taskId) external whenNotPaused {
        Task storage task = _tasks[_taskId];
        
        // require(_taskExists[_taskId], "Task does not exist");
        // require(task.status == TaskStatus.Created, "Task cannot be assigned");
        // require(task.assignee == address(0), "Task already assigned");
        // require(msg.sender != task.issuer, "Issuer cannot be assignee");
        
        task.assignee = msg.sender;
        task.status = TaskStatus.Assigned;
        
        // 将任务ID添加到承接者的任务列表
        _userTasks[msg.sender].push(_taskId);
        
        emit TaskAssigned(_taskId, msg.sender);
    }
    
    /**
     * @dev 捐赠支持
     * @param _taskId 问题ID
     */
    function donate(uint256 _taskId) external payable nonReentrant whenNotPaused {
        Task storage task = _tasks[_taskId];
        
        // require(_taskExists[_taskId], "Task does not exist");
        // require(task.status == TaskStatus.Created || task.status == TaskStatus.Assigned, "Task cannot receive donations");
        // require(msg.value > 0, "Donation amount must be greater than 0");
        
        // 如果设置了目标金额，检查是否超出
        // if (task.targetAmount > 0) {
        //     require(task.currentAmount + msg.value <= task.targetAmount, "Exceeds target amount");
        // }
        
        // 记录捐赠
        _donations[_taskId].push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));
        
        // 如果是首次捐赠，添加到捐赠者列表
        if (!_hasDonated[_taskId][msg.sender]) {
            _donorsList[_taskId].push(msg.sender);
            _hasDonated[_taskId][msg.sender] = true;
        }
        
        // 更新当前金额
        task.currentAmount += msg.value;
        
        // 转发到多签钱包（如果已设置）
        if (task.multiSigWallet != address(0)) {
            (bool success, ) = task.multiSigWallet.call{value: msg.value}("");
            require(success, "Failed to forward funds to multisig");
        }
        
        // 发放激励代币
        uint256 rewardAmount = (msg.value * donationRewardRate) / 100;
        if (rewardAmount > 0 && address(rewardToken) != address(0)) {
            bool success = rewardToken.transfer(msg.sender, rewardAmount);
            require(success, "Reward token transfer failed");
            
            // 记录Token奖励
            _userTokenRewards[msg.sender].push(TokenReward({
                amount: rewardAmount,
                recipient: msg.sender,
                reason: "donation",
                timestamp: block.timestamp
            }));
            
            // 更新捐赠奖励总额
            _donationRewardsTotal[msg.sender] += rewardAmount;
            
            emit TokensRewarded(msg.sender, rewardAmount, "donation");
        }
        
        emit DonationReceived(_taskId, msg.sender, msg.value);
    }
    
    /**
     * @dev 设置多签钱包
     * @param _taskId 问题ID
     * @param _multiSigWallet 多签钱包地址
     */
    function setMultiSigWallet(uint256 _taskId, address _multiSigWallet) external whenNotPaused {
        Task storage task = _tasks[_taskId];
        
        require(_taskExists[_taskId], "Task does not exist");
        require(msg.sender == task.issuer, "Only issuer can set multisig");
        require(task.multiSigWallet == address(0), "Multisig already set");
        require(_multiSigWallet != address(0), "Invalid multisig address");
        
        task.multiSigWallet = _multiSigWallet;
        
        // 如果已有资金，转移到多签钱包
        if (task.currentAmount > 0) {
            (bool success, ) = _multiSigWallet.call{value: task.currentAmount}("");
            require(success, "Failed to transfer funds to multisig");
        }
        
        emit MultiSigCreated(_taskId, _multiSigWallet);
    }
    
    /**
     * @dev 申请完成任务
     * @param _taskId 问题ID
     */
    function requestCompletion(uint256 _taskId) external whenNotPaused {
        Task storage task = _tasks[_taskId];
        
        // require(_taskExists[_taskId], "Task does not exist");
        // require(task.status == TaskStatus.Assigned, "Task not in assigned state");
        // require(msg.sender == task.assignee, "Only assignee can request completion");
        // require(task.completionTime == 0, "Completion already requested");
        
        // 设置完成时间（当前时间+时间锁定）
        task.completionTime = block.timestamp + timelock;
        
        emit CompletionRequested(_taskId, task.completionTime);
    }
    
    /**
     * @dev 批准完成
     * @param _taskId 问题ID
     */
    function approveCompletion(uint256 _taskId) external whenNotPaused {
        Task storage task = _tasks[_taskId];
        
        // require(_taskExists[_taskId], "Task does not exist");
        // require(task.status == TaskStatus.Assigned, "Task not in assigned state");
        // require(task.completionTime > 0 && block.timestamp >= task.completionTime, "Time lock not expired");
        // require(msg.sender == task.issuer || _hasDonated[_taskId][msg.sender], "Not authorized to approve");
        // require(!_approvals[_taskId][msg.sender], "Already approved");
        
        _approvals[_taskId][msg.sender] = true;
        _approvalCounts[_taskId]++;
        
        // 需要超过一半的捐赠者批准
        uint256 requiredApprovals = (_donorsList[_taskId].length / 2) + 1;
        
        // 如果提问者批准，则所需批准数-1
        if (_approvals[_taskId][task.issuer]) {
            requiredApprovals = requiredApprovals > 1 ? requiredApprovals - 1 : 1;
        }
        
        if (_approvalCounts[_taskId] >= requiredApprovals) {
            _completeTask(_taskId);
        }
    }
    
    /**
     * @dev 完成问题 (内部函数)
     * @param _taskId 问题ID
     */
    function _completeTask(uint256 _taskId) internal {
        Task storage task = _tasks[_taskId];
        
        require(task.status == TaskStatus.Assigned, "Task not in assigned state");
        
        task.status = TaskStatus.Completed;
        
        // 如果没有设置多签钱包，则直接发放资金
        if (task.multiSigWallet == address(0) && task.currentAmount > 0) {
            (bool success, ) = task.assignee.call{value: task.currentAmount}("");
            require(success, "Failed to send funds to assignee");
            emit FundsReleased(_taskId, task.assignee, task.currentAmount);
        }
        
        // 发放激励代币给承接者
        if (address(rewardToken) != address(0)) {
            bool success = rewardToken.transfer(task.assignee, assigneeRewardAmount);
            require(success, "Assignee reward token transfer failed");
            
            // 记录Token奖励
            _userTokenRewards[task.assignee].push(TokenReward({
                amount: assigneeRewardAmount,
                recipient: task.assignee,
                reason: "completion",
                timestamp: block.timestamp
            }));
            
            // 更新完成任务奖励总额
            _completionRewardsTotal[task.assignee] += assigneeRewardAmount;
            
            emit TokensRewarded(task.assignee, assigneeRewardAmount, "completion");
        }
        
        // 为每位捐赠者发放NFT (这部分需要调用外部NFT合约)
        if (nftToken != address(0)) {
            // 调用NFT合约为捐赠者铸造NFT
            // 实际实现需根据NFT合约接口
            for (uint256 i = 0; i < _donorsList[_taskId].length; i++) {
                address donor = _donorsList[_taskId][i];
                
                // 记录NFT奖励
                _userNFTRewards[donor].push(NFTReward({
                    taskId: _taskId,
                    tokenId: i,  // 简化处理，实际应该是NFT合约返回的tokenId
                    recipient: donor,
                    timestamp: block.timestamp
                }));
                
                // 这里简化处理，实际应调用NFT合约
                emit NFTRewarded(donor, i, _taskId);
            }
        }
        
        emit TaskCompleted(_taskId);
    }
    
    /**
     * @dev 取消问题
     * @param _taskId 问题ID
     */
    function cancelTask(uint256 _taskId) external nonReentrant whenNotPaused {
        Task storage task = _tasks[_taskId];
        
        require(_taskExists[_taskId], "Task does not exist");
        require(msg.sender == task.issuer, "Only issuer can cancel");
        require(task.status == TaskStatus.Created || task.status == TaskStatus.Assigned, "Task cannot be cancelled");
        
        task.status = TaskStatus.Cancelled;
        
        // 如果没有设置多签钱包，则退款给捐赠者
        if (task.multiSigWallet == address(0) && task.currentAmount > 0) {
            _refundDonations(_taskId);
        }
        
        emit TaskCancelled(_taskId);
    }
    
    /**
     * @dev 退款给捐赠者 (内部函数)
     * @param _taskId 问题ID
     */
    function _refundDonations(uint256 _taskId) internal {
        Donation[] storage taskDonations = _donations[_taskId];
        
        for (uint256 i = 0; i < taskDonations.length; i++) {
            Donation storage donation = taskDonations[i];
            
            if (donation.amount > 0) {
                address donor = donation.donor;
                uint256 amount = donation.amount;
                
                // 设置金额为0，防止重入攻击
                donation.amount = 0;
                
                (bool success, ) = donor.call{value: amount}("");
                if (success) {
                    emit FundsRefunded(_taskId, donor, amount);
                }
            }
        }
    }
    
    /**
     * @dev 设置捐赠奖励率
     * @param _rate 奖励率 (百分比)
     */
    function setDonationRewardRate(uint256 _rate) external onlyOwner {
        require(_rate <= MAX_REWARD_RATE, "Rate cannot exceed max");
        donationRewardRate = _rate;
    }
    
    /**
     * @dev 设置承接者奖励金额
     * @param _amount 奖励金额
     */
    function setAssigneeRewardAmount(uint256 _amount) external onlyOwner {
        assigneeRewardAmount = _amount;
    }
    
    /**
     * @dev 设置时间锁定
     * @param _timelock 时间锁定（秒）
     */
    function setTimelock(uint256 _timelock) external onlyOwner {
        require(_timelock >= MIN_TIMELOCK, "Timelock too short");
        timelock = _timelock;
    }
    
    /**
     * @dev 设置合约地址
     * @param _rewardToken 激励代币合约地址
     * @param _nftToken NFT代币合约地址
     * @param _multiSigFactory 多签钱包工厂合约地址
     */
    function setContractAddresses(
        address _rewardToken,
        address _nftToken,
        address _multiSigFactory
    ) external onlyOwner {
        if (_rewardToken != address(0)) rewardToken = IERC20(_rewardToken);
        if (_nftToken != address(0)) nftToken = _nftToken;
        if (_multiSigFactory != address(0)) multiSigFactory = _multiSigFactory;
    }
    
    /**
     * @dev 获取问题信息
     * @param _taskId 问题ID
     */
    function getTaskDetails(uint256 _taskId) external view returns (
        uint256 id,
        address issuer,
        string memory description,
        uint256 targetAmount,
        uint256 currentAmount,
        address assignee,
        TaskStatus status,
        address multiSigWallet,
        uint256 createdAt,
        uint256 completionTime
    ) {
        require(_taskExists[_taskId], "Task does not exist");
        Task storage task = _tasks[_taskId];
        return (
            task.id,
            task.issuer,
            task.description,
            task.targetAmount,
            task.currentAmount,
            task.assignee,
            task.status,
            task.multiSigWallet,
            task.createdAt,
            task.completionTime
        );
    }
    
    /**
     * @dev 获取捐赠列表
     * @param _taskId 问题ID
     */
    function getDonations(uint256 _taskId) external view returns (
        address[] memory donors,
        uint256[] memory amounts,
        uint256[] memory timestamps
    ) {
        require(_taskExists[_taskId], "Task does not exist");
        Donation[] storage taskDonations = _donations[_taskId];
        uint256 count = taskDonations.length;
        
        donors = new address[](count);
        amounts = new uint256[](count);
        timestamps = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            donors[i] = taskDonations[i].donor;
            amounts[i] = taskDonations[i].amount;
            timestamps[i] = taskDonations[i].timestamp;
        }
        
        return (donors, amounts, timestamps);
    }
    
    /**
     * @dev 获取捐赠者列表
     * @param _taskId 问题ID
     */
    function getDonors(uint256 _taskId) external view returns (address[] memory) {
        require(_taskExists[_taskId], "Task does not exist");
        return _donorsList[_taskId];
    }
    
    /**
     * @dev 获取用户的任务列表
     * @param _user 用户地址
     */
    function getUserTasks(address _user) external view returns (uint256[] memory) {
        return _userTasks[_user];
    }
    
    /**
     * @dev 获取所有问题的数量
     */
    function getTaskCount() external view returns (uint256) {
        return _taskCount;
    }
    
    /**
     * @dev 检查任务是否存在
     * @param _taskId 任务ID
     */
    function taskExists(uint256 _taskId) external view returns (bool) {
        return _taskExists[_taskId];
    }
    
    /**
     * @dev 检查用户是否已批准完成
     * @param _taskId 问题ID
     * @param _user 用户地址
     */
    function hasApproved(uint256 _taskId, address _user) external view returns (bool) {
        require(_taskExists[_taskId], "Task does not exist");
        return _approvals[_taskId][_user];
    }
    
    /**
     * @dev 获取批准数量
     * @param _taskId 问题ID
     */
    function getApprovalCount(uint256 _taskId) external view returns (uint256) {
        require(_taskExists[_taskId], "Task does not exist");
        return _approvalCounts[_taskId];
    }
    
    /**
     * @dev 获取合约总资金余额
     * @return 合约ETH余额
     */
    function getTotalFundBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev 获取已分配资金（所有活跃任务当前金额的总和）
     * @return 已分配ETH总额
     */
    function getAllocatedFunds() public view returns (uint256) {
        uint256 totalAllocated = 0;
        // 遍历任务并汇总活跃任务的currentAmount
        for (uint256 i = 1; i <= _taskCount; i++) {
            if (_taskExists[i]) {
                Task storage task = _tasks[i];
                if (task.status == TaskStatus.Created || task.status == TaskStatus.Assigned) {
                    // 如果任务处于活跃状态，计入已分配资金
                    if (task.multiSigWallet == address(0)) {
                        // 如果没有多签钱包，资金仍在合约中
                        totalAllocated += task.currentAmount;
                    }
                }
            }
        }
        return totalAllocated;
    }
    
    /**
     * @dev 获取可用资金（总余额 - 已分配资金）
     * @return 可用ETH
     */
    function getAvailableFunds() external view returns (uint256) {
        uint256 allocated = getAllocatedFunds();
        uint256 balance = address(this).balance;
        
        // 确保由于精度误差不返回负值
        if (allocated > balance) {
            return 0;
        }
        
        return balance - allocated;
    }
    
    /**
     * @dev 获取唯一贡献者（任务发起者）总数
     * @return 唯一贡献者数量
     */
    function getTotalContributors() external view returns (uint256) {
        return _totalContributors;
    }
    
    /**
     * @dev 获取用户的Token余额
     * @param _user 用户地址
     * @return 用户的Token余额
     */
    function getUserTokenBalance(address _user) external view returns (uint256) {
        if (address(rewardToken) == address(0)) {
            return 0;
        }
        return rewardToken.balanceOf(_user);
    }
    
    /**
     * @dev 获取用户获得的捐赠Token奖励总额
     * @param _user 用户地址
     * @return 捐赠奖励总额
     */
    function getUserDonationRewards(address _user) external view returns (uint256) {
        return _donationRewardsTotal[_user];
    }
    
    /**
     * @dev 获取用户获得的完成任务Token奖励总额
     * @param _user 用户地址
     * @return 完成任务奖励总额
     */
    function getUserCompletionRewards(address _user) external view returns (uint256) {
        return _completionRewardsTotal[_user];
    }
    
    /**
     * @dev 获取用户所有Token奖励记录
     * @param _user 用户地址
     * @return amounts 奖励金额列表
     * @return reasons 奖励原因列表
     * @return timestamps 奖励时间列表
     */
    function getUserTokenRewards(address _user) external view returns (
        uint256[] memory amounts,
        string[] memory reasons,
        uint256[] memory timestamps
    ) {
        TokenReward[] storage rewards = _userTokenRewards[_user];
        uint256 count = rewards.length;
        
        amounts = new uint256[](count);
        reasons = new string[](count);
        timestamps = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            amounts[i] = rewards[i].amount;
            reasons[i] = rewards[i].reason;
            timestamps[i] = rewards[i].timestamp;
        }
        
        return (amounts, reasons, timestamps);
    }
    
    /**
     * @dev 获取用户所有NFT奖励记录
     * @param _user 用户地址
     * @return taskIds 相关任务ID列表
     * @return tokenIds NFT代币ID列表
     * @return timestamps 奖励时间列表
     */
    function getUserNFTRewards(address _user) external view returns (
        uint256[] memory taskIds,
        uint256[] memory tokenIds,
        uint256[] memory timestamps
    ) {
        NFTReward[] storage rewards = _userNFTRewards[_user];
        uint256 count = rewards.length;
        
        taskIds = new uint256[](count);
        tokenIds = new uint256[](count);
        timestamps = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            taskIds[i] = rewards[i].taskId;
            tokenIds[i] = rewards[i].tokenId;
            timestamps[i] = rewards[i].timestamp;
        }
        
        return (taskIds, tokenIds, timestamps);
    }
    
    /**
     * @dev 获取用户在NFT合约中的余额
     * @param _user 用户地址
     * @return 用户的NFT数量
     */
    function getUserNFTBalance(address _user) external view returns (uint256) {
        if (nftToken == address(0)) {
            return 0;
        }
        
        try IERC721(nftToken).balanceOf(_user) returns (uint256 balance) {
            return balance;
        } catch {
            return 0;
        }
    }
    
    /**
     * @dev 接收ETH
     */
    receive() external payable {
        // 允许合约接收ETH
    }
}