"use client";
import React, { useState, useEffect, createContext, useContext } from "react";
import { ethers, Contract } from "ethers";
import TRAIL_MAINTENANCE_ABI from "../public/abi/TrailMaintenance.json"
import contracts from "../public/contracts/development-contracts.json"
import { usePrivy, PrivyProvider } from '@privy-io/react-auth';
// Task status enum to match the contract
enum TaskStatus {
  Created,
  Assigned, 
  Completed,
  Cancelled
}

// Task interface to match the contract struct
interface Task {
  id: number;
  issuer: string;
  description: string;
  targetAmount: string;
  currentAmount: string;
  assignee: string;
  status: TaskStatus;
  multiSigWallet: string;
  createdAt: number;
  completionTime: number;
}

// Donation interface to match the contract struct
interface Donation {
  donor: string;
  amount: string;
  timestamp: number;
}

// Define the types for the TrailMaintenance Context
interface TrailMaintenanceContextType {
  // Task management
  createTask: (description: string, targetAmount: string) => Promise<boolean>;
  assignTask: (taskId: number) => Promise<boolean>;
  requestCompletion: (taskId: number) => Promise<boolean>;
  approveCompletion: (taskId: number) => Promise<boolean>;
  cancelTask: (taskId: number) => Promise<boolean>;
  
  // Donations
  donate: (taskId: number, amount: string) => Promise<boolean>;
  
  // MultiSig
  setMultiSigWallet: (taskId: number, multiSigAddress: string) => Promise<boolean>;
  
  // Data getters
  getTaskDetails: (taskId: number) => Promise<Task | null>;
  getDonations: (taskId: number) => Promise<Donation[]>;
  getUserTasks: () => Promise<number[]>;
  getDonors: (taskId: number) => Promise<string[]>;
  getTaskCount: () => Promise<number>;
  hasApproved: (taskId: number, userAddress: string) => Promise<boolean>;
  getApprovalCount: (taskId: number) => Promise<number>;
  
  // State variables
  donationRewardRate: string;
  assigneeRewardAmount: string;
  timelock: string;
  loading: boolean;
  error: string | null;
  
  // Privy related
  walletAddress: string | undefined;
  isWalletConnected: boolean;
  connectWallet: () => Promise<void>;
}

// Create the TrailMaintenance Context
export const TrailMaintenanceContext = createContext<TrailMaintenanceContextType | undefined>(
  undefined
);

// Props type for the provider
interface TrailMaintenanceProviderProps {
  children: React.ReactNode;
}

// Function to initialize a contract instance
const getEthereumContract = async (
  contractAddress: string,
  contractABI: any,
  privyProvider?: any
): Promise<Contract> => {
  let provider;
  let signer;
  
  if (privyProvider) {
    provider = new ethers.BrowserProvider(privyProvider);
    signer = await provider.getSigner();
  } else if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
  } else {
    throw new Error("Ethereum provider not found");
  }
  
  return new ethers.Contract(contractAddress, contractABI, signer);
};

// The TrailMaintenanceProvider component
export const TrailMaintenanceProvider: React.FC<TrailMaintenanceProviderProps> = ({ children }) => {
  const { ready, login, authenticated, user, logout } = usePrivy();
  
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [donationRewardRate, setDonationRewardRate] = useState<string>("1"); // Default 1%
  const [assigneeRewardAmount, setAssigneeRewardAmount] = useState<string>("100"); // Default 100 tokens
  const [timelock, setTimelock] = useState<string>("172800"); // Default 2 days in seconds
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [privyProvider, setPrivyProvider] = useState<any>(null);

  // Connect wallet using Privy
  const connectWallet = async (): Promise<void> => {
    try {
      if (!authenticated) {
        await login();
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setError("Failed to connect wallet");
    }
  };

  // Update wallet state when Privy authentication changes
  useEffect(() => {
    const updateWalletState = async () => {
      if (authenticated && user) {
        const address = user.wallet?.address;
        setWalletAddress(address);
        setIsWalletConnected(!!address);
        
        // Get Ethereum provider from Privy
        if (user.wallet) {
          try {
            // Privy wallet embedsWalletProvider within user.wallet object
            const provider = user.wallet.provider;
            setPrivyProvider(provider);
          } catch (err) {
            console.error("Failed to get Ethereum provider:", err);
          }
        }
      } else {
        setWalletAddress(undefined);
        setIsWalletConnected(false);
        setPrivyProvider(null);
      }
    };
    
    updateWalletState();
  }, [authenticated, user]);

  // Utility function to fetch TrailMaintenance Contract instance
  const getTrailMaintenanceContract = async (): Promise<Contract> => {
    const contractAddress = contracts.TRAIL_MAINTENANCE_ADDRESS;
    return getEthereumContract(contractAddress, TRAIL_MAINTENANCE_ABI.abi, privyProvider);
  };

  // Fetch contract configuration values
  const fetchContractConfig = async () => {
    if (!isWalletConnected) return;
    
    try {
      const contract = await getTrailMaintenanceContract();
      const rewardRate = await contract.donationRewardRate();
      setDonationRewardRate(rewardRate.toString());
      const rewardAmount = await contract.assigneeRewardAmount();
      setAssigneeRewardAmount(ethers.formatUnits(rewardAmount, 18));
      
      const lockTime = await contract.timelock();
      setTimelock(lockTime.toString());
    } catch (error) {
      console.error("Failed to fetch contract configuration:", error);
      setError("Failed to fetch contract configuration");
    }
  };

  /**
   * Create a new task
   * @param description Task description
   * @param targetAmount Target fundraising amount (in ETH)
   */
  const createTask = async (description: string, targetAmount: string): Promise<boolean> => {
    if (!isWalletConnected) {
      setError("Wallet not connected");
      return false;
    }
    
    setError(null);
    try {
      setLoading(true);
      const contract = await getTrailMaintenanceContract();
      
      // Convert ETH amount to wei
      const valueInWei = targetAmount ? ethers.parseUnits(targetAmount, "ether") : "0";
      
      const tx = await contract.createTask(description, valueInWei);
      await tx.wait();
      console.log("Task created successfully");
      return true;
    } catch (error) {
      console.error("Failed to create task:", error);
      setError("Failed to create task");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Assign a task to yourself
   * @param taskId Task ID to assign
   */
  const assignTask = async (taskId: number): Promise<boolean> => {
    if (!isWalletConnected) {
      setError("Wallet not connected");
      return false;
    }
    
    setError(null);
    try {
      setLoading(true);
      const contract = await getTrailMaintenanceContract();
      
      const tx = await contract.assignTask(taskId);
      await tx.wait();
      console.log("Task assigned successfully");
      return true;
    } catch (error) {
      console.error("Failed to assign task:", error);
      setError("Failed to assign task");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Donate to a task
   * @param taskId Task ID to donate to
   * @param amount Amount to donate (in ETH)
   */
  const donate = async (taskId: number, amount: string): Promise<boolean> => {
    if (!isWalletConnected) {
      setError("Wallet not connected");
      return false;
    }
    
    setError(null);
    try {
      setLoading(true);
      const contract = await getTrailMaintenanceContract();
      
      // Convert ETH amount to wei
      const valueInWei = ethers.parseUnits(amount, "ether");
      
      const tx = await contract.donate(taskId, { value: valueInWei });
      await tx.wait();
      console.log("Donation successful");
      return true;
    } catch (error) {
      console.error("Failed to donate:", error);
      setError("Failed to donate");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set multisig wallet for a task
   * @param taskId Task ID
   * @param multiSigAddress Multisig wallet address
   */
  const setMultiSigWallet = async (taskId: number, multiSigAddress: string): Promise<boolean> => {
    if (!isWalletConnected) {
      setError("Wallet not connected");
      return false;
    }
    
    setError(null);
    try {
      setLoading(true);
      const contract = await getTrailMaintenanceContract();
      
      const tx = await contract.setMultiSigWallet(taskId, multiSigAddress);
      await tx.wait();
      console.log("Multisig wallet set successfully");
      return true;
    } catch (error) {
      console.error("Failed to set multisig wallet:", error);
      setError("Failed to set multisig wallet");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request completion of a task (by assignee)
   * @param taskId Task ID to request completion for
   */
  const requestCompletion = async (taskId: number): Promise<boolean> => {
    if (!isWalletConnected) {
      setError("Wallet not connected");
      return false;
    }
    
    setError(null);
    try {
      setLoading(true);
      const contract = await getTrailMaintenanceContract();
      
      const tx = await contract.requestCompletion(taskId);
      await tx.wait();
      console.log("Completion requested successfully");
      return true;
    } catch (error) {
      console.error("Failed to request completion:", error);
      setError("Failed to request completion");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Approve task completion (by issuer or donors)
   * @param taskId Task ID to approve
   */
  const approveCompletion = async (taskId: number): Promise<boolean> => {
    if (!isWalletConnected) {
      setError("Wallet not connected");
      return false;
    }
    
    setError(null);
    try {
      setLoading(true);
      const contract = await getTrailMaintenanceContract();
      
      const tx = await contract.approveCompletion(taskId);
      await tx.wait();
      console.log("Task completion approved");
      return true;
    } catch (error) {
      console.error("Failed to approve completion:", error);
      setError("Failed to approve completion");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel a task (by issuer only)
   * @param taskId Task ID to cancel
   */
  const cancelTask = async (taskId: number): Promise<boolean> => {
    if (!isWalletConnected) {
      setError("Wallet not connected");
      return false;
    }
    
    setError(null);
    try {
      setLoading(true);
      const contract = await getTrailMaintenanceContract();
      
      const tx = await contract.cancelTask(taskId);
      await tx.wait();
      console.log("Task cancelled successfully");
      return true;
    } catch (error) {
      console.error("Failed to cancel task:", error);
      setError("Failed to cancel task");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get task details
   * @param taskId Task ID to fetch
   */
  const getTaskDetails = async (taskId: number): Promise<Task | null> => {
    if (!isWalletConnected) {
      setError("Wallet not connected");
      return null;
    }
    
    setError(null);
    try {
      const contract = await getTrailMaintenanceContract();
      
      const taskData = await contract.getTaskDetails(taskId);
      
      // Map the returned values to our Task interface
      const task: Task = {
        id: Number(taskData[0]),
        issuer: taskData[1],
        description: taskData[2],
        targetAmount: ethers.formatUnits(taskData[3], 18),
        currentAmount: ethers.formatUnits(taskData[4], 18),
        assignee: taskData[5],
        status: taskData[6],
        multiSigWallet: taskData[7],
        createdAt: Number(taskData[8]),
        completionTime: Number(taskData[9])
      };
      
      return task;
    } catch (error) {
      console.error("Failed to fetch task details:", error);
      setError("Failed to fetch task details");
      return null;
    }
  };

  /**
   * Get donations for a task
   * @param taskId Task ID to get donations for
   */
  const getDonations = async (taskId: number): Promise<Donation[]> => {
    if (!isWalletConnected) {
      setError("Wallet not connected");
      return [];
    }
    
    setError(null);
    try {
      const contract = await getTrailMaintenanceContract();
      
      const [donors, amounts, timestamps] = await contract.getDonations(taskId);
      
      // Combine the arrays into an array of Donation objects
      const donations: Donation[] = donors.map((donor: string, index: number) => ({
        donor,
        amount: ethers.formatUnits(amounts[index], 18),
        timestamp: Number(timestamps[index])
      }));
      
      return donations;
    } catch (error) {
      console.error("Failed to fetch donations:", error);
      setError("Failed to fetch donations");
      return [];
    }
  };

  /**
   * Get list of donors for a task
   * @param taskId Task ID to get donors for
   */
  const getDonors = async (taskId: number): Promise<string[]> => {
    if (!isWalletConnected) {
      setError("Wallet not connected");
      return [];
    }
    
    setError(null);
    try {
      const contract = await getTrailMaintenanceContract();
      
      const donors = await contract.getDonors(taskId);
      return donors;
    } catch (error) {
      console.error("Failed to fetch donors:", error);
      setError("Failed to fetch donors");
      return [];
    }
  };

  /**
   * Get tasks for current user
   */
  const getUserTasks = async (): Promise<number[]> => {
    if (!isWalletConnected || !walletAddress) {
      setError("Wallet not connected");
      return [];
    }
    
    setError(null);
    try {
      const contract = await getTrailMaintenanceContract();
      
      const tasks = await contract.getUserTasks(walletAddress);
      return tasks.map((id: ethers.BigNumberish) => Number(id));
    } catch (error) {
      console.error("Failed to fetch user tasks:", error);
      setError("Failed to fetch user tasks");
      return [];
    }
  };

  /**
   * Get total number of tasks
   */
  const getTaskCount = async (): Promise<number> => {
    if (!isWalletConnected) {
      setError("Wallet not connected");
      return 0;
    }
    
    setError(null);
    try {
      const contract = await getTrailMaintenanceContract();
      
      const count = await contract.getTaskCount();
      return Number(count);
    } catch (error) {
      console.error("Failed to fetch task count:", error);
      setError("Failed to fetch task count");
      return 0;
    }
  };

  /**
   * Check if a user has approved task completion
   * @param taskId Task ID to check
   * @param userAddress User address to check approval for
   */
  const hasApproved = async (taskId: number, userAddress: string): Promise<boolean> => {
    if (!isWalletConnected) {
      setError("Wallet not connected");
      return false;
    }
    
    setError(null);
    try {
      const contract = await getTrailMaintenanceContract();
      
      const approved = await contract.hasApproved(taskId, userAddress);
      return approved;
    } catch (error) {
      console.error("Failed to check approval status:", error);
      setError("Failed to check approval status");
      return false;
    }
  };

  /**
   * Get number of approvals for a task
   * @param taskId Task ID to check
   */
  const getApprovalCount = async (taskId: number): Promise<number> => {
    if (!isWalletConnected) {
      setError("Wallet not connected");
      return 0;
    }
    
    setError(null);
    try {
      const contract = await getTrailMaintenanceContract();
      
      const count = await contract.getApprovalCount(taskId);
      return Number(count);
    } catch (error) {
      console.error("Failed to fetch approval count:", error);
      setError("Failed to fetch approval count");
      return 0;
    }
  };

  // Fetch configuration when wallet connection changes
  useEffect(() => {
    if (isWalletConnected) {
      fetchContractConfig();
    }
  }, [isWalletConnected]);

  return (
    <TrailMaintenanceContext.Provider
      value={{
        // Task management functions
        createTask,
        assignTask,
        requestCompletion,
        approveCompletion,
        cancelTask,
        
        // Donation function
        donate,
        
        // MultiSig function
        setMultiSigWallet,
        
        // Data getter functions
        getTaskDetails,
        getDonations,
        getUserTasks,
        getDonors,
        getTaskCount,
        hasApproved,
        getApprovalCount,
        
        // State variables
        donationRewardRate,
        assigneeRewardAmount,
        timelock,
        loading,
        error,
        
        // Privy related
        walletAddress,
        isWalletConnected,
        connectWallet
      }}
    >
      {children}
    </TrailMaintenanceContext.Provider>
  );
};

// Custom hook for using the TrailMaintenance Context
export const useTrailMaintenance = () => {
  const context = useContext(TrailMaintenanceContext);
  if (!context) {
    throw new Error("useTrailMaintenance must be used within TrailMaintenanceProvider");
  }
  return context;
};