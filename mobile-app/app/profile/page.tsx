"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, Wallet, MapPin, Calendar, Activity, Settings, LogIn, Compass, LogOut, Coins } from "lucide-react"
import { mockUserData, mockUserActivity } from "@/lib/mock-data"
import {useFundWallet, usePrivy} from '@privy-io/react-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTrailMaintenance } from "../../providers/TrailMaintenanceContext"

// 格式化数字为两位小数
const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(parseFloat(num))) return "0.00";
  return parseFloat(num).toFixed(2);
};

// 生成有趣的Trail NFT SVG图案
const generateTrailNFTSvg = (tokenId, taskId) => {
  // 使用tokenId和taskId作为种子生成确定的随机值
  const seed = (parseInt(tokenId) || 0) + (parseInt(taskId) || 0) * 137;
  const rng = (n) => ((seed * 9301 + 49297) % 233280) / 233280 * n;
  
  // 步道和自然相关的颜色
  const colors = [
    "#3E9B41", // 森林绿
    "#AA7939", // 土路棕
    "#4F94CD", // 河流蓝
    "#9B5436", // 红土路
    "#FFD700", // 阳光金
    "#569752", // 树叶绿
    "#8A360F", // 红木色
    "#006400", // 深绿
    "#228B22", // 森林绿
    "#4682B4"  // 钢蓝色
  ];
  
  // 选择颜色
  const bgColor = colors[Math.floor(rng(colors.length))];
  const fgColor = colors[Math.floor(rng(colors.length))];
  
  // 选择图案类型
  const patterns = ["trees", "mountains", "river", "trail", "badge"];
  const pattern = patterns[Math.floor(rng(patterns.length))];
  
  let svgContent = "";
  
  switch(pattern) {
    case "trees":
      // 树林图案
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="${bgColor}" />
          <circle cx="80" cy="20" r="10" fill="#FFD700" />
          <path d="M20,80 L30,50 L40,80 Z" fill="${fgColor}" />
          <path d="M50,80 L60,40 L70,80 Z" fill="${fgColor}" />
          <path d="M80,80 L90,55 L100,80 Z" fill="${fgColor}" />
          <rect x="27" y="80" width="6" height="10" fill="#8B4513" />
          <rect x="57" y="80" width="6" height="15" fill="#8B4513" />
          <rect x="87" y="80" width="6" height="8" fill="#8B4513" />
          <text x="50" y="95" font-family="Arial" font-size="6" fill="white" text-anchor="middle">#${tokenId}</text>
        </svg>
      `;
      break;
      
    case "mountains":
      // 山脉图案
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="${bgColor}" />
          <circle cx="75" cy="20" r="12" fill="#FFD700" />
          <path d="M0,80 L25,30 L50,80 Z" fill="${fgColor}" />
          <path d="M40,80 L70,25 L100,80 Z" fill="${fgColor}" />
          <path d="M0,100 L100,100 L100,80 L0,80 Z" fill="#8A360F" />
          <text x="50" y="95" font-family="Arial" font-size="6" fill="white" text-anchor="middle">#${tokenId}</text>
        </svg>
      `;
      break;
      
    case "river":
      // 河流图案
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="${bgColor}" />
          <path d="M20,0 C30,20 10,40 30,60 C50,80 70,60 80,100" stroke="${fgColor}" stroke-width="15" fill="none" />
          <circle cx="${20 + rng(60)}" cy="${20 + rng(20)}" r="5" fill="#FFFFFF" />
          <circle cx="${30 + rng(40)}" cy="${40 + rng(20)}" r="3" fill="#FFFFFF" />
          <text x="50" y="95" font-family="Arial" font-size="6" fill="white" text-anchor="middle">#${tokenId}</text>
        </svg>
      `;
      break;
      
    case "trail":
      // 步道图案
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="${bgColor}" />
          <path d="M10,50 Q30,${30 + rng(40)},50,50 T90,${40 + rng(20)}" stroke="#8A360F" stroke-width="8" stroke-linecap="round" fill="none" />
          <path d="M20,20 L30,40 L40,20 Z" fill="${fgColor}" />
          <path d="M60,70 L70,90 L80,70 Z" fill="${fgColor}" />
          <circle cx="15" cy="15" r="8" fill="#FFD700" />
          <text x="50" y="95" font-family="Arial" font-size="6" fill="white" text-anchor="middle">#${tokenId}</text>
        </svg>
      `;
      break;
      
    case "badge":
      // 徽章图案
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="${bgColor}" />
          <circle cx="50" cy="50" r="40" fill="${fgColor}" />
          <path d="M50,20 L58,38 L78,40 L64,54 L68,74 L50,64 L32,74 L36,54 L22,40 L42,38 Z" fill="#FFD700" />
          <circle cx="50" cy="50" r="15" fill="${bgColor}" />
          <text x="50" y="53" font-family="Arial" font-size="8" fill="white" text-anchor="middle" font-weight="bold">#${tokenId}</text>
        </svg>
      `;
      break;
      
    default:
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="${bgColor}" />
          <circle cx="50" cy="50" r="30" fill="${fgColor}" />
          <text x="50" y="55" font-family="Arial" font-size="10" fill="white" text-anchor="middle">#${tokenId}</text>
        </svg>
      `;
  }
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
};

export default function ProfilePage() {
  const [activities] = useState(mockUserActivity)
  const { ready, login, authenticated, user: privyUser, logout, linkWallet} = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const {fundWallet} = useFundWallet();
  
  // 使用 TrailMaintenance 钩子获取区块链数据
  const {
    getUserTokenBalance,
    getUserDonationRewards,
    getUserCompletionRewards,
    getUserTokenRewards,
    getUserNFTRewards,
    getUserNFTBalance,
    error: contractError
  } = useTrailMaintenance();
  
  // 添加状态来存储数据
  const [tokenBalance, setTokenBalance] = useState("0");
  const [donationRewards, setDonationRewards] = useState("0");
  const [completionRewards, setCompletionRewards] = useState("0");
  const [tokenRewards, setTokenRewards] = useState([]);
  const [nftRewards, setNftRewards] = useState([]);
  const [nftBalance, setNftBalance] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  
  // 加载用户的代币和NFT数据
  useEffect(() => {
    const fetchData = async () => {
      if (!authenticated) return;
      
      setDataLoading(true);
      try {
        // 获取用户的Token余额
        const balance = await getUserTokenBalance();
        setTokenBalance(balance);
        
        // 获取用户通过捐赠获得的奖励
        const donations = await getUserDonationRewards();
        setDonationRewards(donations);
        
        // 获取用户通过完成任务获得的奖励
        const completions = await getUserCompletionRewards();
        setCompletionRewards(completions);
        
        // 获取用户的所有Token奖励记录
        const rewards = await getUserTokenRewards();
        setTokenRewards(rewards);
        
        // 获取用户的所有NFT奖励记录
        const nfts = await getUserNFTRewards();
        setNftRewards(nfts);
        
        // 获取用户持有的NFT数量
        const nftCount = await getUserNFTBalance();
        setNftBalance(nftCount);
      } catch (error) {
        console.error("Error fetching blockchain data:", error);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, [authenticated, getUserTokenBalance, getUserDonationRewards, getUserCompletionRewards, getUserTokenRewards, getUserNFTRewards, getUserNFTBalance]);
  
  // 如果用户未登录，显示登录页面
  if (!authenticated) {
    return (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h1 className="text-lg font-semibold">Profile</h1>
          </div>

          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-md p-8 bg-gradient-to-br from-background to-muted/50">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 p-6 rounded-full animate-pulse">
                  <LogIn className="h-12 w-12 text-primary"/>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center mb-2">Welcome to Kiaora Trails</h2>
              <p className="text-muted-foreground text-center mb-6">
                Connect your account to access your profile and participate in community funding.
              </p>
              <Button
                  onClick={() => {
                    setIsLoading(true);
                    login();
                  }}
                  className="w-full py-6 text-base font-medium"
                  disabled={isLoading}
              >
                {isLoading ? (
                    <span className="flex items-center">
                  <span className="loader mr-2"></span>
                  Logging in...
                </span>
                ) : (
                    <span className="flex items-center">
                  <LogIn className="mr-2 h-5 w-5"/>
                  Login / Signup
                </span>
                )}
              </Button>
            </Card>
          </div>
        </div>
    );
  }

  // 使用 Privy 用户数据，如果某些字段不存在则使用 mock 数据
  const userData = {
    name: privyUser?.google?.name || privyUser?.email || privyUser?.wallet?.address?.slice(0, 6) + '...' + privyUser?.wallet?.address?.slice(-4) || mockUserData.name,
    avatar: privyUser?.avatar?.url || mockUserData.avatar,
    location: mockUserData.location, // Privy 没有位置信息，使用 mock 数据
    trailsReported: mockUserData.trailsReported,
    proposalsVoted: mockUserData.proposalsVoted,
    tokenBalance: dataLoading ? '...' : formatNumber(tokenBalance), // 格式化为两位小数
    level: mockUserData.level,
    reputation: mockUserData.reputation,
    badges: mockUserData.badges,
    address: privyUser?.wallet?.address,
  };

  // 准备NFT数据来显示为徽章，使用自定义SVG
  const nftBadges = nftRewards.map((nft, index) => ({
    name: `Trail NFT #${nft.tokenId}`,
    image: generateTrailNFTSvg(nft.tokenId, nft.taskId), // 使用自定义SVG
    id: nft.tokenId,
    taskId: nft.taskId,
    timestamp: new Date(nft.timestamp * 1000).toLocaleDateString()
  }));

  // 准备Token奖励数据来显示为交易，金额保留两位小数
  const tokenTransactions = tokenRewards.map((reward) => ({
    type: "Earned",
    amount: formatNumber(reward.amount), // 格式化为两位小数
    reason: reward.reason === "donation" ? "Donation reward" : "Task completion reward",
    date: new Date(reward.timestamp * 1000).toLocaleDateString()
  }));

  const fund = async ()=>{
   await fundWallet(privyUser?.wallet?.address!)
  }
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 计算总奖励
  const totalRewards = parseFloat(donationRewards) + parseFloat(completionRewards);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h1 className="text-lg font-semibold">Profile</h1>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Logout</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="mr-2 h-4 w-4 text-destructive" />
                <span className="text-destructive">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-0">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userData.avatar}/>
              <AvatarFallback>{userData.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{userData?.name}</h2>
              <div className="flex flex-col">
                <h3 className="text-sm text-muted-foreground flex items-center">
                  {userData.address ?
                      <span className="bg-secondary/50 px-2 py-0.5 rounded-md font-mono text-xs break-all">
                      {userData.address}
                    </span> :
                      <span className="text-destructive/70">No wallet connected</span>
                  }
                </h3>
              </div>
              {/* <p className="text-sm text-muted-foreground flex items-center">
                <MapPin className="h-3 w-3 mr-1" /> {userData.location}
              </p> */}
              <div className="flex items-center space-x-2 mt-1">
                {nftBalance > 0 && (
                  <Badge variant="outline" className="px-2 py-1 text-xs">
                    <Award className="h-3 w-3 mr-1"/> Trail NFT Holder ({nftBalance})
                  </Badge>
                )}
                {totalRewards > 0 && (
                  <Badge variant="outline" className="px-2 py-1 text-xs">
                    <Award className="h-3 w-3 mr-1"/> Token Earner
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
                onClick={fund}
                className="w-1/2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-medium py-2 rounded-md transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Coins className="h-5 w-5"/>
              <span>Deposit / Withdraw</span>
            </Button>
            <Button
                onClick={linkWallet}
                className="w-1/2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-medium py-2 rounded-md transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Wallet className="h-5 w-5"/>
              <span>Connect Wallet</span>
            </Button>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Linked Wallets</h3>
            <div className="space-y-2">
              {privyUser?.linkedAccounts?.filter(account => 
                account.type === "wallet" && account.address && account.chainType
              ).map((wallet, index) => (
                <div key={index} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-mono break-all">
                        {wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <span className="capitalize">{wallet.chainType}</span>
                        <span className="mx-1">•</span>
                        <span className="capitalize">{wallet.walletClientType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!privyUser?.linkedAccounts || !privyUser.linkedAccounts.some(account => account.type === "wallet")) && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  No wallets connected
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-muted/50 rounded-md">
              <div className="text-lg font-bold">{userData.trailsReported}</div>
              <div className="text-xs text-muted-foreground">Reports</div>
            </div>
            <div className="p-2 bg-muted/50 rounded-md">
              <div className="text-lg font-bold">{userData.proposalsVoted}</div>
              <div className="text-xs text-muted-foreground">Likes</div>
            </div>
            <div className="p-2 bg-muted/50 rounded-md">
              <div className="text-lg font-bold">{dataLoading ? "..." : userData.tokenBalance}</div>
              <div className="text-xs text-muted-foreground">TRL</div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Reputation Level {userData.level}</span>
              <span className="text-sm font-medium">{userData.reputation}/1000 XP</span>
            </div>
            <Progress value={userData.reputation / 10}/>
          </div>
        </div>

        <div className="p-4">
          <Tabs defaultValue="badges">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
            </TabsList>

            <TabsContent value="badges" className="pt-4">
              <div className="grid grid-cols-3 gap-4">
              {/* 显示NFT和徽章 */}
              {nftBadges.map((badge, index) => (
                  <div key={`nft-${index}`} className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full overflow-hidden flex items-center justify-center mb-1">
                      <img
                        src={badge.image}
                        alt={badge.name}
                        className="h-16 w-16"
                      />
                    </div>
                    <span className="text-xs text-center">{badge.name}</span>
                    <span className="text-xs text-muted-foreground">Task #{badge.taskId}</span>
                  </div>
                ))}
              {/* {userData.badges.map((badge, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                      <img
                        src={badge.image || "/placeholder.svg?height=64&width=64"}
                        alt={badge.name}
                        className="h-12 w-12"
                      />
                    </div>
                    <span className="text-xs text-center">{badge.name}</span>
                  </div>
                ))} */}
                <div className="flex flex-col items-center opacity-40">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-1">
                    <Award className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-center">Locked</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="pt-4 space-y-4">
              {activities.map((activity, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{activity.title}</p>
                        {activity.reward > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            +{formatNumber(activity.reward)} TRL
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {activity.date}
                        {activity.location && (
                          <>
                            <span className="mx-1">•</span>
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {activity.location}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="tokens" className="pt-4">
              <Card className="p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">TRL Token Balance</h3>
                    <p className="text-sm text-muted-foreground">Your community contribution tokens</p>
                  </div>
                  <div className="text-2xl font-bold">{dataLoading ? "..." : formatNumber(tokenBalance)} TRL</div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <Card className="p-3">
                  <h4 className="text-sm font-medium">Donation Rewards</h4>
                  <p className="text-xl font-bold">{dataLoading ? "..." : formatNumber(donationRewards)} TRL</p>
                </Card>
                <Card className="p-3">
                  <h4 className="text-sm font-medium">Completion Rewards</h4>
                  <p className="text-xl font-bold">{dataLoading ? "..." : formatNumber(completionRewards)} TRL</p>
                </Card>
              </div>

              <h3 className="font-medium mb-2 text-sm">Recent Transactions</h3>
              {dataLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading transactions...</div>
              ) : tokenTransactions.length > 0 ? (
                <div className="space-y-2">
                  {tokenTransactions.map((tx, index) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded-md hover:bg-accent">
                      <div>
                        <div className="font-medium text-sm">{tx.reason}</div>
                        <div className="text-xs text-muted-foreground">{tx.date}</div>
                      </div>
                      <Badge variant={tx.type === "Earned" ? "default" : "secondary"}>
                        {tx.type === "Earned" ? "+" : "-"}
                        {tx.amount} TRL
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No transactions yet</div>
              )}

              {/* 如果合约错误，显示错误信息 */}
              {contractError && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  Error: {contractError}
                </div>
              )}

              <Button className="w-full mt-4" onClick={linkWallet}>
                <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}