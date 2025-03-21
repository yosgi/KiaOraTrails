"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, Wallet, MapPin, Calendar, Activity, Settings } from "lucide-react"
import { mockUserData, mockUserActivity } from "@/lib/mock-data"

export default function ProfilePage() {
  const [user] = useState(mockUserData)
  const [activities] = useState(mockUserActivity)

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h1 className="text-lg font-semibold">Profile</h1>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-0">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center">
                <MapPin className="h-3 w-3 mr-1" /> {user.location}
              </p>
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
              <div className="text-lg font-bold">{user.trailsReported}</div>
              <div className="text-xs text-muted-foreground">Reports</div>
            </div>
            <div className="p-2 bg-muted/50 rounded-md">
              <div className="text-lg font-bold">{user.proposalsVoted}</div>
              <div className="text-xs text-muted-foreground">Votes</div>
            </div>
            <div className="p-2 bg-muted/50 rounded-md">
              <div className="text-lg font-bold">{user.tokenBalance}</div>
              <div className="text-xs text-muted-foreground">TRL</div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Reputation Level {user.level}</span>
              <span className="text-sm font-medium">{user.reputation}/1000 XP</span>
            </div>
            <Progress value={user.reputation / 10} />
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
                {user.badges.map((badge, index) => (
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
                  <div className="text-2xl font-bold">125 TRL</div>
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

