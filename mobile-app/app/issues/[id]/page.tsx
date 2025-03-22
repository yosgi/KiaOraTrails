"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Input
} from "@/components/ui/input"
import * as math from 'mathjs';
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  AlertTriangle,
  Landmark,
  MapPin,
  MoreVertical,
  Loader2,
  Info,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { MiniMap } from "@/components/mini-map"
import { CommentList } from "@/components/comment-list"
import { usePrivy } from '@privy-io/react-auth';
import { cn } from "@/lib/utils"
import { AuthAPI } from "../../utils/api"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { DialogTitle } from "@radix-ui/react-dialog"
import { format } from "date-fns"
import { useTrailMaintenance } from "../../../providers/TrailMaintenanceContext"
import { ethers } from "ethers"

// 格式化数字为两位小数
const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(parseFloat(num))) return "0.00";
  return parseFloat(num).toFixed(2);
};

// ETH到本地货币的换算率（模拟：1 ETH = 3000 NZD）
const ETH_TO_NZD_RATE = 3000;

// 定义任务状态枚举
enum TaskStatus {
  Created = "0", // 0
  Assigned = "1", // 1
  Completed = "2", // 2
  Cancelled  = "3"// 3
}

export default function IssuePage() {
  const { ready, login, authenticated, user: privyUser, logout } = usePrivy();
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("details")
  const [comment, setComment] = useState("")
  const [isVoting, setIsVoting] = useState(false)
  const [isDonating, setIsDonating] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [donateAmount, setDonateAmount] = useState(10) // 默认捐款金额10 NZD
  const [customAmount, setCustomAmount] = useState("")
  const [showCustomAmount, setShowCustomAmount] = useState(false)
  const [blockchainTask, setBlockchainTask] = useState(null)
  const [blockchainTaskExists, setBlockchainTaskExists] = useState(false)
  const [loadingBlockchainData, setLoadingBlockchainData] = useState(true)
  const [donors, setDonors] = useState([])
  const [donations, setDonations] = useState([])

  // 使用TrailMaintenance钩子获取合约交互函数
  const {
    donate,
    createTask,
    taskExists,
    getTaskDetails,
    assignTask,
    requestCompletion,
    approveCompletion,
    getDonations,
    getDonors,
    error: contractError
  } = useTrailMaintenance()

  // 加载基本问题数据
  useEffect(() => {
    const fetchIssue = async () => {
      setLoading(true)
      try {
        if (!privyUser) return
        const data = await AuthAPI.get(`/posts/${params.id}`)
        console.log('Issue data:', data)
        setIssue({
          ...data,
          author: privyUser
        })
      } catch (error) {
        console.error("Error fetching issue:", error)
        toast({
          title: "Error",
          description: "Failed to fetch issue data.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchIssue()
  }, [params.id, privyUser])

  // 加载区块链任务数据
  useEffect(() => {
    const fetchBlockchainData = async () => {
      if (!issue) return;

      setLoadingBlockchainData(true)
      try {
        // 检查任务是否存在于区块链
        const exists = await taskExists(Number(issue.id))
        setBlockchainTaskExists(exists)

        if (exists) {
          // 获取任务详情
          const taskDetails = await getTaskDetails(Number(issue.id))
          setBlockchainTask(taskDetails)

          // 获取捐款信息
          const donorsAddresses = await getDonors(Number(issue.id))
          setDonors(donorsAddresses)

          // 获取具体捐款记录
          const donationsData = await getDonations(Number(issue.id))
          setDonations(donationsData)

          console.log("Task details:", taskDetails)
          console.log("Donors:", donorsAddresses)
          console.log("Donations:", donationsData)
        }
      } catch (error) {
        console.error("Error fetching blockchain data:", error)
        toast({
          title: "Blockchain Error",
          description: "Failed to fetch blockchain data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoadingBlockchainData(false)
      }
    }

    if (issue) {
      fetchBlockchainData()
    }
  }, [issue, taskExists, getTaskDetails, getDonors, getDonations])

  // 如果正在加载或没有数据，显示加载状态
  if (loading || !issue) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Loading issue data...</p>
      </div>
    )
  }

  // 计算实际募资金额和目标金额（从区块链数据或后端API）
  const fundTarget = issue.fund || 0;


  // 安全计算当前募资金额
  const calculateCurrentFund = () => {
    if (!blockchainTask) return 0;

    try {
      // 检查currentAmount是否存在且为有效值
      if (blockchainTask.currentAmount === undefined ||
        blockchainTask.currentAmount === null) {
        console.warn("Invalid currentAmount in blockchainTask:", blockchainTask.currentAmount);
        return 0;
      }

      console.log("Raw currentAmount:", blockchainTask.currentAmount);
      console.log("Type of currentAmount:", typeof blockchainTask.currentAmount);

      let ethAmount;

      // 判断currentAmount的类型，选择适当的处理方式
      if (typeof blockchainTask.currentAmount === 'string') {
        // 如果是字符串，检查是否已经是ETH格式还是Wei格式
        if (blockchainTask.currentAmount.includes('.')) {
          // 已经是ETH格式，直接使用
          ethAmount = blockchainTask.currentAmount;
        } else {
          // 应该是Wei格式字符串，需要转换
          ethAmount = ethers.formatEther(blockchainTask.currentAmount);
        }
      } else if (typeof blockchainTask.currentAmount === 'object' &&
        blockchainTask.currentAmount._isBigNumber) {
        // 如果是BigNumber对象，使用formatEther转换
        ethAmount = ethers.formatEther(blockchainTask.currentAmount);
      } else if (typeof blockchainTask.currentAmount === 'number') {
        // 如果是数字（可能已经是ETH格式）
        ethAmount = blockchainTask.currentAmount.toString();
      } else {
        // 其他情况，尝试转换（兜底）
        try {
          ethAmount = ethers.formatEther(blockchainTask.currentAmount);
        } catch (innerError) {
          console.warn("Cannot format with ethers:", innerError);
          // 如果失败，直接将其视为原始值
          ethAmount = String(blockchainTask.currentAmount);
        }
      }

      console.log("Processed ETH amount:", ethAmount);

      // 计算对应的NZD金额
      const nzdAmount = parseFloat(ethAmount) * ETH_TO_NZD_RATE;
      console.log("Current amount in NZD:", nzdAmount);

      return nzdAmount;
    } catch (error) {
      console.error("Error calculating current fund:", error);
      // 失败时返回后端提供的值
      return 0;
    }
  };


  const currentFund = calculateCurrentFund();

  // 计算进度百分比
  let fundingProgress = fundTarget > 0 ? (currentFund / fundTarget) * 100 : 0;
  if (fundingProgress > 100) {
    fundingProgress = 100;
  }
  // 获取当前任务状态
  const taskStatus = blockchainTask ? blockchainTask.status.toString() : null;
  // 根据状态决定要显示的按钮
  const getActionButton = () => {
    // 如果区块链数据正在加载中
    if (loadingBlockchainData) {
      return (
        <Button className="w-full mt-2" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
        </Button>
      );
    }

    // 如果任务不存在于区块链，显示捐款按钮
    if (!blockchainTaskExists) {
      return (
        <Button
          className="w-full mt-2"
          onClick={handleDonate}
          disabled={isDonating || donateAmount <= 0}
        >
          {isDonating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            "Donate"
          )}
        </Button>
      );
    }
    console.log("donateAmount", donateAmount, fundTarget);
    // 根据任务状态显示不同按钮 - 放宽逻辑
    switch (taskStatus) {
     
      case TaskStatus.Created:
        // 筹款中状态 - 任何人都可以捐款和领取任务
        return (
          <>
          {
            currentFund.toFixed(2) < fundTarget ? (
              <Button
              className="w-full mt-2"
              onClick={handleDonate}
              disabled={isDonating || donateAmount <= 0}
            >
              {isDonating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                "Donate Now"
              )}
            </Button>
            ):
            
            ( <Button
              className="w-full mt-2"
              onClick={handleAssign}
              disabled={isAssigning}
            >
              {isAssigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Assigning...
                </>
              ) : (
                "Assign Task to Me"
              )}
            </Button>)
          }
            
           
          </>
        );

      case TaskStatus.Assigned:
        // 进行中状态 - 任何人都可以请求完成
        // 移除了isAssignee检查
        if (blockchainTask?.completionTime > 0) {
          // 如果已请求完成，显示批准按钮
          return (
            <>
              <Button
                className="w-full mt-2"
                onClick={handleApprove}
                disabled={isApproving}
              >
                {isApproving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  "Approve Completion"
                )}
              </Button>
            </>
          );
        } else {
          // 否则显示请求完成按钮
          return (
            <Button
              className="w-full mt-2"
              onClick={handleRequest}
              disabled={isRequesting}
            >
              {isRequesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                "Request Completion"
              )}
            </Button>
          );
        }

      case TaskStatus.Completed:
        return (
          <Button
            className="w-full mt-2"
            disabled={true}
            variant="outline"
          >
            Task Completed
          </Button>
        );

      case TaskStatus.Cancelled:
        return (
          <Button
            className="w-full mt-2"
            disabled={true}
            variant="outline"
          >
            Task Cancelled
          </Button>
        );

      default:
        return (
          <Button
            className="w-full mt-2"
            onClick={handleDonate}
            disabled={isDonating || donateAmount <= 0}
          >
            {isDonating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              "Donate Now"
            )}
          </Button>
        );
    }
  };

  // 处理点赞/踩
  const handleVote = async (isUpVote: boolean) => {
    setIsVoting(true)

    try {
      // API调用
      const result = await AuthAPI.post(`/posts/${issue?.id}/vote`, {
        payload: {
          isUpVote,
        }
      })

      setIssue({
        ...result,
        author: privyUser
      })

      toast({
        title: `Vote recorded!`,
        description: `You've ${isUpVote ? "upvoted" : "downvoted"} this issue and earned 1 TRL token.`,
      })
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to record your vote.",
        variant: "destructive"
      })
    } finally {
      setIsVoting(false)
    }
  }

  // 处理评论
  const handleComment = async () => {
    if (!comment.trim()) return

    setIsCommenting(true)

    try {
      const result = await AuthAPI.post(`/posts/${issue?.id}/review`, {
        payload: {
          comments: comment,
          score: 2,
          user_id: privyUser?.id,
          user_name: privyUser?.google?.name
        },
      })

      setIssue({
        ...result,
        author: privyUser
      })

      toast({
        title: "Comment posted!",
        description: "Your comment has been added and you've earned 2 TRL tokens.",
      })

      setComment("")
    } catch (error) {
      console.error("Error posting comment:", error)
      toast({
        title: "Error",
        description: "Failed to post your comment.",
        variant: "destructive"
      })
    } finally {
      setIsCommenting(false)
    }
  }

  // 修改处理请求完成的函数 - 移除权限检查
  const handleRequest = async () => {
    setIsRequesting(true);

    try {
      // 不检查用户是否是受让人
      await requestCompletion(Number(issue.id));

      // 更新任务数据
      const updatedTask = await getTaskDetails(Number(issue.id));
      setBlockchainTask(updatedTask);

      toast({
        title: "Completion Requested",
        description: "Completion request has been submitted."
      });
    } catch (error) {
      console.error("Error requesting completion:", error);
      toast({
        title: "Request Failed",
        description: "Failed to request completion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRequesting(false);
    }
  };

  // 修改任务分配函数 - 移除权限检查
  const handleAssign = async () => {
    setIsAssigning(true);

    try {
      // 允许任何人分配任务给自己
      await assignTask(Number(issue.id));

      // 更新任务数据
      const updatedTask = await getTaskDetails(Number(issue.id));
      setBlockchainTask(updatedTask);

      toast({
        title: "Task Assigned",
        description: "Task has been assigned successfully."
      });
    } catch (error) {
      console.error("Error assigning task:", error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // 修改批准完成的函数 - 移除权限检查
  const handleApprove = async () => {
    setIsApproving(true);

    try {
      // 允许任何人批准完成
      await approveCompletion(Number(issue.id));

      // 更新任务数据
      const updatedTask = await getTaskDetails(Number(issue.id));
      setBlockchainTask(updatedTask);

      toast({
        title: "Completion Approved",
        description: "Task completion has been approved."
      });
    } catch (error) {
      console.error("Error approving completion:", error);
      toast({
        title: "Approval Failed",
        description: "Failed to approve completion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsApproving(false);
    }
  };

  // 修改捐款函数，简化逻辑，不要求必须先创建任务
  const handleDonate = async () => {
    // 获取最终的捐款金额（NZD）
    const finalAmount = showCustomAmount ? parseFloat(customAmount) : donateAmount;
    if (finalAmount <= 0 || isNaN(finalAmount)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive"
      });
      return;
    }

    setIsDonating(true);

    try {
      // 将NZD金额转换为ETH
      const ethAmountDecimal = finalAmount / ETH_TO_NZD_RATE;
      const ethAmountFormatted = math.format(ethAmountDecimal, { precision: 6 });

      console.log("Formatted ETH amount:", ethAmountFormatted);

      // 检查任务是否已存在于区块链
      const exists = await taskExists(Number(issue.id));

      // 如果不存在，先创建任务
      if (!exists) {
        // 计算目标金额（ETH）
        const targetAmountDecimal = fundTarget / ETH_TO_NZD_RATE;
        const targetAmountFormatted = math.format(targetAmountDecimal, { precision: 6 });

        toast({
          title: "Creating Task",
          description: "Creating blockchain task...",
        });

        // 创建区块链任务
        await createTask(
          Number(issue.id),
          issue.title,
          targetAmountFormatted
        );

        toast({
          title: "Task Created",
          description: "Blockchain task created successfully!",
        });
      }

      // 显示捐款处理提示
      toast({
        title: "Processing Donation",
        description: `Contributing ${formatNumber(finalAmount)} NZD (${ethAmountFormatted} ETH)...`,
      });

      // 执行捐款
      await donate(Number(issue.id), ethAmountFormatted);

      // 更新UI
      const updatedTask = await getTaskDetails(Number(issue.id));
      setBlockchainTask(updatedTask);
      setBlockchainTaskExists(true);

      // 更新捐款者和捐款记录
      const donorsAddresses = await getDonors(Number(issue.id));
      setDonors(donorsAddresses);

      const donationsData = await getDonations(Number(issue.id));
      setDonations(donationsData);

      // 更新API中的数据
      await AuthAPI.post(`/posts/${issue.id}/fund`, {
        payload: {
          amount: finalAmount
        }
      });

      // 重新获取issue数据
      const updatedIssue = await AuthAPI.get(`/posts/${issue.id}`);
      setIssue({
        ...updatedIssue,
        author: privyUser
      });

      toast({
        title: "Donation successful!",
        description: `Thank you for contributing ${formatNumber(finalAmount)} NZD to this trail improvement project!`,
      });

      // 重置捐款金额输入
      setShowCustomAmount(false);
      setCustomAmount("");
    } catch (error) {
      console.error("Error donating:", error);
      toast({
        title: "Donation failed",
        description: "There was an error processing your donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDonating(false);
    }
  };





  // 聚焦评论输入框
  const focusCommentInput = () => {
    setActiveTab("comments")
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus()
      }
    }, 300)
  }

  // 处理捐款金额选择
  const handleAmountSelect = (amount) => {
    if (amount === 'custom') {
      setShowCustomAmount(true);
    } else {
      setDonateAmount(amount);
      setShowCustomAmount(false);
    }
  };

  const location = issue.location ? JSON.parse(issue.location) : {};
  const photos = issue.photos || [];

  // 获取格式化的任务状态文本
  const getTaskStatusText = () => {
    if (!blockchainTaskExists) return "Not On Chain";

    switch (taskStatus) {
      case TaskStatus.Created: return "Fundraising";
      case TaskStatus.Assigned:
        return blockchainTask.completionTime > 0
          ? "Completion Requested"
          : "In Progress";
      case TaskStatus.Completed: return "Completed";
      case TaskStatus.Cancelled: return "Cancelled";
      default: return "Unknown";
    }
  };

  // 获取任务状态徽章颜色
  const getTaskStatusBadgeVariant = () => {
    if (!blockchainTaskExists) return "outline";

    switch (taskStatus) {
      case TaskStatus.Created: return "default";
      case TaskStatus.Assigned: return blockchainTask.completionTime > 0 ? "warning" : "secondary";
      case TaskStatus.Completed: return "success";
      case TaskStatus.Cancelled: return "destructive";
      default: return "outline";
    }
  };

  const getFundPercent  = () => {
    const per = currentFund / fundTarget
    return per > 1 ? 1 : per
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold truncate max-w-[200px]">{issue.title}</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-xl">
            <VisuallyHidden>
              <DialogTitle>Options</DialogTitle>
            </VisuallyHidden>
            <div className="py-4 space-y-4">
              <h3 className="text-lg font-semibold">Options</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="justify-start" onClick={focusCommentInput}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Add Comment
                </Button>
                <Button variant="outline" className="justify-start">
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
                {issue.type === "condition" && (
                  <Button variant="outline" className="justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4" /> Report Problem
                  </Button>
                )}
                {issue.type === "fundraising" && (
                  <Button variant="outline" className="justify-start" onClick={() => setActiveTab("fundraising")}>
                    <Landmark className="mr-2 h-4 w-4" /> View Fundraising
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="aspect-video bg-muted relative">
          {
            photos.length > 0 ? (
              photos.map((photo: string, index: number) => (
                <img
                  key={index}
                  src={photo}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Info className="h-12 w-12 text-muted-foreground opacity-50" />
              </div>
            )
          }
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge
              variant={issue.type === "scenic" ? "secondary" : issue.type === "condition" ? "destructive" : "default"}
            >
              {issue.type === "scenic" ? "Scenic Spot" : issue.type === "condition" ? "Trail Condition" : "Fundraising"}
            </Badge>

            {/* {blockchainTaskExists && (
              <Badge variant={getTaskStatusBadgeVariant()}>
                {getTaskStatusText()}
              </Badge>
            )} */}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={issue?.author?.avatar ?? 'https://i.pravatar.cc/80'} />
                <AvatarFallback>{issue?.author?.google?.name?.substring(0, 2) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{issue.author?.google?.name || issue.author?.email || "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">Posted at {format(new Date(issue.created_at), "MMM d, yyyy")}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVote(true)}
                disabled={isVoting}
                className={cn("h-9 px-3", isVoting && "opacity-50")}
              >
                <ThumbsUp className="h-4 w-4 mr-1" /> {issue.up_votes}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVote(false)}
                disabled={isVoting}
                className={cn("h-9 px-3", isVoting && "opacity-50")}
              >
                <ThumbsDown className="h-4 w-4 mr-1" /> {issue.down_votes}
              </Button>
            </div>
          </div>

          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 mr-1" /> {`latitude: ${location?.lat || '?'}, longitude: ${location?.lng || '?'}`}
          </div>

          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments ({issue?.reviews?.length || 0})</TabsTrigger>
              {issue.type === "fundraising" && <TabsTrigger value="fundraising">Fundraising</TabsTrigger>}
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              <p className="text-sm">{issue.description}</p>

              <div className="h-48 w-full rounded-md overflow-hidden border">
                <MiniMap location={location} />
              </div>

              {blockchainTaskExists && (
                <Card className="p-3 bg-muted/30">
                  <h3 className="text-sm font-medium mb-2">Blockchain Status</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <Badge variant={getTaskStatusBadgeVariant()}>
                        {getTaskStatusText()}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Current Amount:</span>
                      <span>{formatNumber(currentFund)} NZD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Donors:</span>
                      <span>{donors?.length || 0}</span>
                    </div>
                    {blockchainTask?.assignee && blockchainTask.assignee !== ethers.ZeroAddress && (
                      <div className="flex justify-between text-sm">
                        <span>Assignee:</span>
                        <span className="font-mono text-xs">
                          {blockchainTask.assignee.substring(0, 6)}...{blockchainTask.assignee.substring(blockchainTask.assignee.length - 4)}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="comments" className="space-y-4 pt-4">
              <div className="space-y-4">
                <CommentList comments={issue.reviews || []} />

                <div className="pt-4 border-t">
                  <Textarea
                    ref={commentInputRef}
                    placeholder="Add your comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mb-2"
                  />
                  <Button onClick={handleComment} disabled={isCommenting || !comment.trim()}>
                    {isCommenting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                      </>
                    ) : (
                      "Post Comment"
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {issue.type === "fundraising" && (
              <TabsContent value="fundraising" className="space-y-6 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Fundraising Progress</span>
                    <span className="text-sm font-medium">
                      {formatNumber(currentFund)} / {formatNumber(fundTarget)} NZD
                    </span>
                  </div>
                  <Progress value={fundingProgress} />

                  {loadingBlockchainData ? (
                    <div className="flex justify-center items-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-xs text-muted-foreground">Loading blockchain data...</span>
                    </div>
                  ) : contractError ? (
                    <div className="text-xs text-destructive py-1">
                      Error: {contractError}
                    </div>
                  ) : null}
                </div>

                <Card className="p-4 bg-muted/50">
                  <h3 className="font-medium flex items-center">
                    <Landmark className="h-4 w-4 mr-2" /> Treasury Information
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Funds are held in a community-managed treasury. Once the goal is reached, DAO members will vote on
                    fund allocation to ensure the project is completed properly.
                  </p>

                  {blockchainTaskExists && blockchainTask?.multiSigWallet && blockchainTask.multiSigWallet !== ethers.ZeroAddress && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-medium">MultiSig Wallet:</p>
                      <p className="text-xs font-mono break-all">{blockchainTask.multiSigWallet}</p>
                    </div>
                  )}
                </Card>

                <div className="space-y-2">
                  <h3 className="font-medium">Contribute to this project</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant={donateAmount === 10 && !showCustomAmount ? "default" : "outline"}
                      onClick={() => handleAmountSelect(10)}
                      disabled={isDonating || taskStatus === TaskStatus.Completed || taskStatus === TaskStatus.Cancelled}
                    >
                      10 NZD
                    </Button>
                    <Button
                      variant={donateAmount === 50 && !showCustomAmount ? "default" : "outline"}
                      onClick={() => handleAmountSelect(50)}
                      disabled={isDonating || taskStatus === TaskStatus.Completed || taskStatus === TaskStatus.Cancelled}
                    >
                      50 NZD
                    </Button>
                    <Button
                      variant={donateAmount === 100 && !showCustomAmount ? "default" : "outline"}
                      onClick={() => handleAmountSelect(100)}
                      disabled={isDonating || taskStatus === TaskStatus.Completed || taskStatus === TaskStatus.Cancelled}
                    >
                      100 NZD
                    </Button>
                    <Button
                      variant={showCustomAmount ? "default" : "outline"}
                      onClick={() => handleAmountSelect('custom')}
                      disabled={isDonating || taskStatus === TaskStatus.Completed || taskStatus === TaskStatus.Cancelled}
                    >
                      Custom
                    </Button>
                  </div>

                  {showCustomAmount && (
                    <div className="mt-2">
                      <Input
                        type="number"
                        placeholder="Enter amount in NZD"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="mb-2"
                        disabled={isDonating}
                      />
                      <p className="text-xs text-muted-foreground mb-2">
                        Approximately {formatNumber(parseFloat(customAmount || "0") / ETH_TO_NZD_RATE)} ETH
                      </p>
                    </div>
                  )}

                  {/* 动态渲染按钮，基于区块链状态 */}
                  {getActionButton()}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Recent Contributors</h3>
                  {loadingBlockchainData ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Loading contributors...</span>
                    </div>
                  ) : donors && donors.length > 0 ? (
                    <div className="flex -space-x-2 flex-wrap">
                      {donors.slice(0, 7).map((donor, i) => (
                        <Avatar key={i} className="border-2 border-background">
                          <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${donor.substring(2, 4)}`} />
                          <AvatarFallback>{donor.substring(2, 4)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {donors.length > 7 && (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium">
                          +{donors.length - 7}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">No contributors yet. Be the first to donate!</p>
                  )}

                  {/* 如果有捐款记录，显示最近几笔 */}
                  {donations && donations.donors && donations.donors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <h4 className="text-sm font-medium">Recent Donations</h4>
                      {donations.donors.slice(0, 3).map((donor, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="font-mono">
                            {donor.substring(0, 6)}...{donor.substring(donor.length - 4)}
                          </span>
                          <span>
                            {formatNumber(parseFloat(ethers.formatEther(donations.amounts[index])) * ETH_TO_NZD_RATE)} NZD
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}