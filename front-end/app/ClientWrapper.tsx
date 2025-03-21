"use client";
import React, { ReactNode } from "react";
import { WalletProvider } from "./contexts/WalletContext";
// Removed unused StakingProvider import, add it here if needed.
import { ContractsProvider } from "./contexts/ContractContext";

interface ClientWrapperProps {
  children: ReactNode;
}

function ClientWrapper({ children }: ClientWrapperProps): JSX.Element {
  return (
    <WalletProvider>
      <ContractsProvider>
        {children}
      </ContractsProvider>
    </WalletProvider>
  );
}

export default ClientWrapper;
