"use client";
import { useState, useEffect, useCallback, useContext } from "react";
import { ethers, Contract } from "ethers";
import STAKING_Contract from "../../public/abi/Staking.json";
import TOKEN_Contract from "../../public/abi/ERC20DecimalsMock.json";
import { WalletContext } from "../contexts/WalletContext";
import { ContractsContext } from "../contexts/ContractContext";

// Define a type for each deposit item.
export interface DepositItem {
  amount: string;    // Staked amount (formatted, e.g. in ETH)
  apy: number;       // APY percentage
  duration: number;  // Duration in seconds 
  reward: string;    // Calculated reward (formatted)
  timestamp: number; // Deposit start timestamp (unix time)
}

export const useStaking = () => {
  const { currentAccount } = useContext(WalletContext);
  const [userStakedAmount, setUserStakedAmount] = useState<string>("0");
  const [rewardsAvailable, setRewardsAvailable] = useState<string>("0");
  const [totalStaked, setTotalStaked] = useState<string>("0");
  const [withdrawFee, setWithdrawFee] = useState<string>("0");
  const [depositList, setDepositList] = useState<DepositItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { contracts } = useContext(ContractsContext);

  // Retrieve contract addresses from contracts hook.
  // If contracts is not loaded, these values will be empty strings.
  const stakingAddress = contracts?.STAKING_CONTRACT_ADDRESS || "";
  const tokenAddress = contracts?.TOKEN_CONTRACT_ADDRESS || "";

  /**
   * Utility function to get a contract instance using the given address and ABI.
   * Throws an error if the Ethereum provider is not found.
   */
  const getEthereumContract = useCallback(
    async (contractAddress: string, contractABI: any): Promise<Contract> => {
      if (!window.ethereum) {
        throw new Error("Ethereum provider not found");
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new ethers.Contract(contractAddress, contractABI, signer);
    },
    []
  );

  /**
   * Returns the Staking contract instance.
   * Throws an error if the staking contract address is not loaded.
   */
  const getStakingContract = useCallback(async (): Promise<Contract> => {
    if (!stakingAddress) {
      throw new Error("Staking contract address not loaded");
    }
    return getEthereumContract(stakingAddress, STAKING_Contract.abi);
  }, [getEthereumContract, stakingAddress]);

  /**
   * Returns the Token contract instance.
   * Throws an error if the token contract address is not loaded.
   */
  const getTokenContract = useCallback(async (): Promise<Contract> => {
    if (!tokenAddress) {
      throw new Error("Token contract address not loaded");
    }
    return getEthereumContract(tokenAddress, TOKEN_Contract.abi);
  }, [getEthereumContract, tokenAddress]);

  /**
   * Stake tokens in the staking contract.
   * @param amount - Amount of tokens (as a string, in ether units) to stake.
   * @param option - Staking option (e.g., different APY durations).
   */
  const stakeTokens = useCallback(
    async (amount: string, option: number): Promise<boolean> => {
      try {
        setLoading(true);
        const stakingContract = await getStakingContract();
        // Convert amount to wei (assumes 18 decimals)
        const valueInWei = ethers.parseUnits(amount, "ether");
        // Call the deposit function with ETH value
        const tx = await stakingContract.deposit(option, { value: valueInWei });
        await tx.wait();
        console.log("ETH staked successfully.");
        return true;
      } catch (error) {
        console.error("Failed to stake tokens:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getStakingContract]
  );

  /**
   * Withdraw staked tokens.
   * @param index - Index of the staking entry to withdraw.
   */
  const withdrawTokens = useCallback(
    async (index: number): Promise<boolean> => {
        console.log("index",index)
      try {
        setLoading(true);
        const stakingContract = await getStakingContract();
        const tx = await stakingContract.withdraw(index);
        await tx.wait();
        console.log("Tokens withdrawn successfully.");
        return true;
      } catch (error) {
        console.error("Failed to withdraw tokens:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getStakingContract]
  );

  /**
   * Emergency withdraw reward tokens from the staking contract.
   * Only callable by the contract owner.
   * @param amount - The amount to withdraw (as a string in ether units).
   */
  const emergencyWithdraw = useCallback(
    async (amount: string): Promise<boolean> => {
      try {
        setLoading(true);
        const stakingContract = await getStakingContract();
        const valueInWei = ethers.parseUnits(amount, "ether");
        const tx = await stakingContract.withdrawEmergencyReward(valueInWei);
        await tx.wait();
        console.log("Emergency withdraw successful.");
        return true;
      } catch (error) {
        console.error("Failed to emergency withdraw tokens:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getStakingContract]
  );

  /**
   * Fetch user's staked token information.
   */
  const getUserStakedInfo = useCallback(async (): Promise<void> => {
    if (!currentAccount) return;
    try {
      setLoading(true);
      const stakingContract = await getStakingContract();
      const amount = await stakingContract.getStakedTokens(currentAccount);
      setUserStakedAmount(ethers.formatUnits(amount, 18));
    } catch (error) {
      console.error("Failed to fetch staked information:", error);
    } finally {
      setLoading(false);
    }
  }, [currentAccount, getStakingContract]);

  /**
   * Fetch remaining rewards available in the staking contract.
   */
  const rewardsRemaining = useCallback(async (): Promise<void> => {
    try {
      const stakingContract = await getStakingContract();
      const rewards = await stakingContract.rewardsRemaining();
      setRewardsAvailable(ethers.formatUnits(rewards, 18));
    } catch (error) {
      console.error("Failed to fetch rewards information:", error);
    }
  }, [getStakingContract]);

  /**
   * Fetch global staking statistics: total staked amount and withdraw fee.
   */
  const fetchGlobalStats = useCallback(async (): Promise<void> => {
    try {
      const stakingContract = await getStakingContract();
      const total = await stakingContract.totalStaked();
      setTotalStaked(ethers.formatUnits(total, 18));
      const fee = await stakingContract.withdrawFee();
      setWithdrawFee(fee.toString());
    } catch (error) {
      console.error("Failed to fetch global staking stats:", error);
    }
  }, [getStakingContract]);

  /**
   * Fetch the deposit list for the current user.
   * This retrieves detailed information for each deposit item.
   */
  const fetchDepositList = useCallback(async (): Promise<void> => {
    if (!currentAccount) {
      setDepositList([]);
      return;
    }
    try {
      const stakingContract = await getStakingContract();
      const length = await stakingContract.getStakedItemLength(currentAccount);
      const len = Number(length);
      const list: DepositItem[] = [];
      for (let i = 0; i < len; i++) {
        const amt = await stakingContract.getStakedItemAmount(currentAccount, i);
        const apy = await stakingContract.getStakedItemAPY(currentAccount, i);
        const duration = await stakingContract.getStakedItemDuration(currentAccount, i);
        const reward = await stakingContract.getStakedItemReward(currentAccount, i);
        const timestamp = await stakingContract.getStakedItemTimestamp(currentAccount, i);
        list.push({
          amount: ethers.formatUnits(amt, 18),
          apy: Number(apy),
          duration: Number(duration),
          reward: ethers.formatUnits(reward, 18),
          timestamp: Number(timestamp),
        });
      }
      setDepositList(list);
    } catch (error) {
      console.error("Failed to fetch deposit list:", error);
    }
  }, [currentAccount, getStakingContract]);

 

  // Fetch user-specific info and global stats when currentAccount changes.
  useEffect(() => {
    if (currentAccount) {
      getUserStakedInfo();
      rewardsRemaining();
      fetchDepositList();
    } else {
      setDepositList([]);
    }
    // Global stats may be independent of the current user.
    fetchGlobalStats();
  }, [currentAccount, getUserStakedInfo, rewardsRemaining, fetchGlobalStats, fetchDepositList]);

  return {
    stakeTokens,
    withdrawTokens,
    emergencyWithdraw,
    getUserStakedInfo,
    rewardsRemaining,
    fetchDepositList,
    userStakedAmount,
    rewardsAvailable,
    totalStaked,
    withdrawFee,
    depositList,
    loading,
  };
};
