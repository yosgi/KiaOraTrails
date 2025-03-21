"use client";
import { useContext } from "react";
import { WalletContext } from "../contexts/WalletContext";
import { networkConfig } from "../contexts/WalletContext";
import Button from './Button';

export const ChainIndicator = () => {
  const { currentChain, switchNetwork } = useContext(WalletContext);
  const expectedChainId = parseInt(networkConfig.chainId, 16); // 0x1a4 → 420
  const currentChainId = parseInt(currentChain, 16);
  const isCorrectChain = currentChainId === expectedChainId;
  const variant = isCorrectChain ? "primary" : "danger";

  return (
    <Button 
        variant={variant}
        size="small"
      onClick={() => switchNetwork(networkConfig)}
    >
      {isCorrectChain ? networkConfig.chainName : `switch to ${networkConfig.chainName}`}
    </Button>
  );
};