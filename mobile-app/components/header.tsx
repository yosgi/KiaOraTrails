"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Map, Landmark, User, Bell, LogIn, MapPin, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockUserData } from "@/lib/mock-data"

export default function Header() {
  const pathname = usePathname()
  const [isLoggedIn] = useState(true)
  const [user] = useState(mockUserData)

  const navigation = [
    { name: "Map", href: "/", icon: Map },
    { name: "Treasury", href: "/treasury", icon: Landmark },
    { name: "Profile", href: "/profile", icon: User },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="px-7">
                <Link href="/" className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span className="font-bold">KiaOraTrails</span>
                </Link>
              </div>
              <div className="flex flex-col space-y-3 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-x-2 py-2 px-7 text-sm font-medium",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span className="hidden font-bold sm:inline-block">KiaOraTrails</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4 ml-auto">
          {isLoggedIn ? (
            <>
              <div className="hidden md:flex items-center space-x-1 border rounded-full px-3 py-1">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user.tokenBalance} TRL</span>
              </div>

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary"></span>
                <span className="sr-only">Notifications</span>
              </Button>

              <Link href="/profile">
                <Avatar>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <Button>
              <LogIn className="mr-2 h-4 w-4" /> Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

