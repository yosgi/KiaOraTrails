import { useState, useEffect,useContext } from "react";
import { ethers } from "ethers";
import airdropContract from "../../public/abi/Airdrop.json";
import { ContractsContext } from "../contexts/ContractContext";
// Get contract addresses from environment variables

const airdropABI = airdropContract.abi;
// Minimal ABI for the Airdrop contract

export const useAirdrop = (currentAccount: string | null) => {
    const [isClaiming, setIsClaiming] = useState<boolean>(false);
    const [isClaimed, setIsClaimed] = useState<boolean>(false);
    const { contracts } = useContext(ContractsContext);
    const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;
    const airdropAddress = contracts?.AIRDROP_CONTRACT_ADDRESS
    console.log("🚀 ~ file: useAirdrop.ts ~ line 41 ~ useAirdrop ~ airdropAddress", airdropAddress)
    // Check if the user has already claimed the airdrop by reading the claimed mapping from the airdrop contract
    const checkIfClaimed = async () => {
        if (!currentAccount || !window.ethereum || !airdropAddress) return;
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const airdropContract = new ethers.Contract(airdropAddress, airdropABI, provider);
            const hasClaimed = await airdropContract.claimed(currentAccount);
            if (hasClaimed) {
                setIsClaimed(true);
            }
        } catch (error) {
            console.error("❌ Error checking airdrop claim:", error);
        }
    };

    // Claim the airdrop by calling the claimAirdrop function in the airdrop contract
    const claimAirdrop = async () => {
        if (!currentAccount || !window.ethereum || !airdropAddress) {
            console.error("❌ Wallet not connected or airdrop contract address missing!");
            return;
        }
        try {
            setIsClaiming(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            console.log("Airdrop Contract Address:", airdropAddress, "ABI:", airdropABI, "Signer:", signer);
            const airdropContract = new ethers.Contract(airdropAddress, airdropABI, signer);
            const tx = await airdropContract.claimAirdrop();
            await tx.wait();

            console.log("🎉 Airdrop successfully claimed!");
            setIsClaimed(true);
        } catch (error) {
            console.error("❌ Airdrop claim failed:", error);
        } finally {
            setIsClaiming(false);
        }
    };

    useEffect(() => {
        if (currentAccount) {
            checkIfClaimed();
        }
    }, [currentAccount]);

    return { claimAirdrop, isClaiming, isClaimed };
};
