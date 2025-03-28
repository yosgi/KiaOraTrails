"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Landmark, Vote, CheckCircle2 } from "lucide-react"
import { mockTreasuryData } from "@/lib/mock-data"
import { AuthAPI } from "../utils/api"
import { format, set } from "date-fns"
import { useTrailMaintenance } from "../../providers/TrailMaintenanceContext"
export default function TreasuryPage() {
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { getTotalFundBalance, getAllocatedFunds, getAvailableFunds, getTotalContributors } = useTrailMaintenance()
  const [totalFundBalance, setTotalFundBalance] = useState(0)
  const [allocatedFunds, setAllocatedFunds] = useState(0)
  const [availableFunds, setAvailableFunds] = useState(0)
  const [totalContributors, setTotalContributors] = useState(0)

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await AuthAPI.get("/posts")
        setProposals(response)
      } catch (error) {
        console.error("Failed to fetch proposals:", error)
      } finally {
        setLoading(false)
      }
    }
    const fetchTrailMaintenance = async () => {
      const TotalFundBalance = await getTotalFundBalance()
      setTotalFundBalance(Number(TotalFundBalance) * 3000  )
      const AllocatedFunds = await getAllocatedFunds()
      setAllocatedFunds(Number(AllocatedFunds) * 3000 )
      const  AvailableFunds =await getAvailableFunds()
      setAvailableFunds(Number(AvailableFunds) * 3000 )
      const TotalContributors = await getTotalContributors()
      setTotalContributors(Number(TotalContributors))
    }
    fetchTrailMaintenance()


    fetchProposals()
  }, [])


  const sortedProposals =proposals && proposals?.length > 0 ? [...proposals].sort((a, b) => {
    try {
      return sortDirection === "asc" ? a.up_votes - b.up_votes : b.up_votes - a.up_votes
    } catch (error) {
      return []
    }
  }).filter(item=>item.type === "fundraising") : []

  const toggleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-lg font-semibold">Community Fund & Governance</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Landmark className="mr-2 h-4 w-4" /> Community Fund Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-3xl font-bold">{totalFundBalance.toFixed(2)} NZD</div>
              <p className="text-sm text-muted-foreground">Total Fund Balance</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Available</span>
                <span>{availableFunds.toFixed(2)} NZD</span>
              </div>
              <Progress value={(availableFunds / totalFundBalance) * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Allocated</span>
                <span>{allocatedFunds} NZD</span>
              </div>
              <Progress value={(allocatedFunds / totalFundBalance) * 100} />
            </div>

            <div className="pt-2 border-t grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-muted/50 rounded-md">
                <div className="text-lg font-bold">{totalContributors}</div>
                <div className="text-xs text-muted-foreground">Contributors</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-md">
                <div className="text-lg font-bold">{sortedProposals?.filter(({status}) => status =="created").length}</div>
                <div className="text-xs text-muted-foreground">Active Proposals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium flex items-center">
              <Vote className="mr-2 h-4 w-4" /> Proposals
            </h2>
          </div>

          {loading ? (
            <p>Loading proposals...</p>
          ) : (
            <Tabs defaultValue="created">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="created">Active</TabsTrigger>
                <TabsTrigger value="donated">Funded</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="created" className="pt-4 space-y-4">
                {sortedProposals.filter(({status}) => status =="created").map((proposal) => (
                  <Card key={proposal.id+'voted'} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/issues/${proposal.id}`} className="block hover:bg-accent">
                            <h3 className="font-medium">{proposal.title}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {proposal.fund ?? 0} NZD • Posted at {format(new Date(proposal.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        {proposal.type === "fundraising" && (
                            <Link href={`/issues/${proposal.id}`}>
                              <Button size="sm" variant="outline">
                                Donate
                              </Button>
                            </Link>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Support</span>
                          <span>{Number(proposal.cur_fund)} NZD</span>
                        </div>
                        <Progress value={Number(proposal.cur_fund / proposal.fund )*100} />
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="donated" className="pt-4 space-y-4">
              {sortedProposals.filter(({status}) => status =="donated").map((proposal) => (
                  <Card key={proposal.id+'donated'} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/issues/${proposal.id}`} className="block hover:bg-accent">
                            <h3 className="font-medium">{proposal.title}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {proposal.fund ?? 0} NZD • Posted at {format(new Date(proposal.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Support</span>
                          <span>{Number(proposal.cur_fund)} NZD</span>
                        </div>
                        <Progress value={Number(proposal.cur_fund / proposal.fund )*100} />
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="completed" className="pt-4 space-y-4">
                
              {sortedProposals.filter(({status}) => status =="completed").map((proposal) => (
                  <Card key={proposal.id+'rejected'} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/issues/${proposal.id}`} className="block hover:bg-accent">
                            <h3 className="font-medium">{proposal.title}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {proposal.fund ?? 0} NZD • Posted at {format(new Date(proposal.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Support</span>
                          <span>{Number(proposal.cur_fund)} NZD</span>
                        </div>
                        <Progress value={Number(proposal.cur_fund / proposal.fund )*100} />
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Your DAO Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>TRL Token Balance</span>
              <span className="font-medium">125 TRL</span>
            </div>
            <div className="flex justify-between">
              <span>Voting Power</span>
              <span className="font-medium">12.5%</span>
            </div>
            <div className="flex justify-between">
              <span>Reputation Score</span>
              <span className="font-medium">
                780 <span className="text-green-500 text-xs">+15</span>
              </span>
            </div>
            <Button variant="outline" className="w-full">
              Claim Rewards
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

