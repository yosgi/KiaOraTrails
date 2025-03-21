// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ContributorNFT
 * @dev NFT奖励，用于奖励捐赠者，同时可以参与后续的平台治理
 */
contract ContributorNFT is ERC721URIStorage, Ownable {
    using Strings for uint256;
    
    uint256 private _tokenIds; // 替代 Counters.Counter
    address public trailMaintenanceContract;
    string public baseURI;
    
    // 映射: 任务ID => (捐赠者地址 => NFT ID)
    mapping(uint256 => mapping(address => uint256)) private _contributorNFTs;
    
    // 映射: 捐赠者地址 => 拥有的所有NFT IDs
    mapping(address => uint256[]) private _contributorTokens;
    
    // 事件
    event NFTMinted(address indexed recipient, uint256 indexed taskId, uint256 tokenId);
    
    /**
     * @dev 构造函数
     */
    constructor() ERC721("TrailContributor", "TRAILC") Ownable(msg.sender) {}
    
    /**
     * @dev 设置步道维护合约地址
     * @param _trailContract 步道维护合约地址
     */
    function setTrailMaintenanceContract(address _trailContract) external onlyOwner {
        require(_trailContract != address(0), "Invalid address");
        trailMaintenanceContract = _trailContract;
    }
    
    /**
     * @dev 设置基础URI
     * @param _baseURI 基础URI
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }
    
    /**
     * @dev 铸造NFT
     * @param recipient 接收者地址
     * @param taskId 问题ID
     * @return 新铸造的NFT ID
     */
    function mint(address recipient, uint256 taskId) external returns (uint256) {
        require(msg.sender == owner() || msg.sender == trailMaintenanceContract, "Not authorized");
        require(recipient != address(0), "Invalid recipient");
        require(_contributorNFTs[taskId][recipient] == 0, "Already minted for this task");
        
        _tokenIds++; // 替代 _tokenIds.increment()
        uint256 tokenId = _tokenIds; // 替代 _tokenIds.current()
        
        _mint(recipient, tokenId);
        
        // 构建元数据URI，包含taskId
        string memory tokenURI = string(abi.encodePacked(
            baseURI, 
            "/", 
            taskId.toString(), 
            "/", 
            tokenId.toString()
        ));
        
        _setTokenURI(tokenId, tokenURI);
        
        // 记录捐赠者获得的NFT
        _contributorNFTs[taskId][recipient] = tokenId;
        _contributorTokens[recipient].push(tokenId);
        
        emit NFTMinted(recipient, taskId, tokenId);
        
        return tokenId;
    }
    
    /**
     * @dev 获取捐赠者在特定任务的NFT ID
     * @param taskId 任务ID
     * @param contributor 捐赠者地址
     * @return NFT ID，如果没有则返回0
     */
    function getContributorNFT(uint256 taskId, address contributor) external view returns (uint256) {
        return _contributorNFTs[taskId][contributor];
    }
    
    /**
     * @dev 获取捐赠者的所有NFT IDs
     * @param contributor 捐赠者地址
     * @return NFT IDs数组
     */
    function getContributorTokens(address contributor) external view returns (uint256[] memory) {
        return _contributorTokens[contributor];
    }
    
    /**
     * @dev 检查地址是否拥有任何NFT
     * @param owner 地址
     * @return 布尔值
     */
    function hasAnyNFT(address owner) external view returns (bool) {
        return _contributorTokens[owner].length > 0;
    }
    
    /**
     * @dev 覆盖基础URI函数
     */
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
    
    /**
     * @dev 确保只有授权用户能转移NFT
     * 这个函数可以根据平台的具体需求进行修改
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        
        // 允许铸造和平台内部转移
        if (from != address(0) && to != address(0)) {
            // 这里可以添加额外的限制条件
            // 例如，只允许在特定条件下转移NFT
        }
        
        return from;
    }
}