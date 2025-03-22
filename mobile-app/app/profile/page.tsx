"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, Wallet, MapPin, Calendar, Activity, Settings, LogIn, Compass, LogOut } from "lucide-react"
import { mockUserData, mockUserActivity } from "@/lib/mock-data"
import { usePrivy } from '@privy-io/react-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ProfilePage() {
  const [activities] = useState(mockUserActivity)
  const { ready, login, authenticated, user: privyUser, logout } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
                <LogIn className="h-12 w-12 text-primary" />
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
                  <LogIn className="mr-2 h-5 w-5" /> 
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
    tokenBalance: mockUserData.tokenBalance,
    level: mockUserData.level,
    reputation: mockUserData.reputation,
    badges: mockUserData.badges,
    address: privyUser?.wallet?.address,
  };

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
              <AvatarImage src={userData.avatar} />
              <AvatarFallback>{userData.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{userData.name}</h2>
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
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  <Award className="h-3 w-3 mr-1" /> Trail Guardian
                </Badge>
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  <Award className="h-3 w-3 mr-1" /> Top Contributor
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-muted/50 rounded-md">
              <div className="text-lg font-bold">{userData.trailsReported}</div>
              <div className="text-xs text-muted-foreground">Reports</div>
            </div>
            <div className="p-2 bg-muted/50 rounded-md">
              <div className="text-lg font-bold">{userData.proposalsVoted}</div>
              <div className="text-xs text-muted-foreground">Votes</div>
            </div>
            <div className="p-2 bg-muted/50 rounded-md">
              <div className="text-lg font-bold">{userData.tokenBalance}</div>
              <div className="text-xs text-muted-foreground">TRL</div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Reputation Level {userData.level}</span>
              <span className="text-sm font-medium">{userData.reputation}/1000 XP</span>
            </div>
            <Progress value={userData.reputation / 10} />
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
                {userData.badges.map((badge, index) => (
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
                ))}
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
                            +{activity.reward} TRL
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
                  <div className="text-2xl font-bold">{userData.tokenBalance} TRL</div>
                </div>
              </Card>

              <h3 className="font-medium mb-2 text-sm">Recent Transactions</h3>
              <div className="space-y-2">
                {[
                  { type: "Earned", amount: 5, reason: "Reported trail condition", date: "2 days ago" },
                  { type: "Earned", amount: 2, reason: "Voted on proposal", date: "3 days ago" },
                  { type: "Spent", amount: 10, reason: "Voted on fund allocation", date: "1 week ago" },
                  { type: "Earned", amount: 15, reason: "Trail cleanup participation", date: "2 weeks ago" },
                  { type: "Earned", amount: 3, reason: "Commented on issue", date: "2 weeks ago" },
                ].map((tx, index) => (
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

              <Button className="w-full mt-4">
                <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

