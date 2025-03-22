"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import {PrivyProvider} from "@privy-io/react-auth";

interface Web3ContextType {
  isConnected: boolean
  address: string | null
  balance: string
  connect: () => Promise<void>
  disconnect: () => void
}

const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  address: null,
  balance: "0",
  connect: async () => {},
  disconnect: () => {},
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState("0")

  // Mock connection to wallet
  const connect = async () => {
    // In a real app, you would use ethers.js, web3.js, or wagmi to connect to a wallet
    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsConnected(true)
      setAddress("0x1234...5678")
      setBalance("1.25")
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setBalance("0")
  }

  // Auto-connect on page load (simulated)
  useEffect(() => {
    const autoConnect = async () => {
      // In a real app, you would check if the user has previously connected
      // and try to reconnect automatically
      await connect()
    }

    autoConnect()
  }, [])

  return (
      <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APPID as string}
          clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENTID}
          config={{
            // Customize Privy's appearance in your app
            appearance: {
              theme: 'light',
              accentColor: '#676FFF',
              logo: 'https://hackathon20250322.s3-ap-southeast-1.amazonaws.com/img/t4tx8oytz.png'
            },
            embeddedWallets: {
              createOnLogin: 'users-without-wallets'
            }
          }}
      >
        <Web3Context.Provider value={{ isConnected, address, balance, connect, disconnect }}>
          {children}
        </Web3Context.Provider>
      </PrivyProvider>
  )
}

export const useWeb3 = () => useContext(Web3Context)

