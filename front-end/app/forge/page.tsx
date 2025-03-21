"use client";
import React, { useContext } from "react";
import Button from "../components/Button";
import { useAirdrop } from "../hooks/useAirdrop";
import { WalletContext } from "../contexts/WalletContext";
import useMessage from "../hooks/useMessage";
import Message from "../components/Message";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations();
  const { connectWallet, currentAccount } = useContext(WalletContext);
  const { claimAirdrop, isClaiming, isClaimed } = useAirdrop(currentAccount);
  const { messageState, showMessage, closeMessage } = useMessage();

  // Handle claiming FORGE tokens
  const handleClaimForge = async () => {
    if (!currentAccount) {
      console.error("❌ " + t("walletNotConnected", { defaultMessage: "Wallet not connected!" }));
      return;
    }

    try {
      await claimAirdrop();
      showMessage(t("claimSuccess", { defaultMessage: "🎉 FORGE tokens successfully claimed!" }), "success");
    } catch (error) {
      console.error("❌ " + t("claimFailed", { defaultMessage: "Claiming failed:" }), error);
    }
  };

  return (
    <div className="mt-16 space-y-8 p-4 max-w-3xl mx-auto">
      {/* Section 1: Sepolia Introduction */}
      <section className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          {t("whatIsInteropDevnet", { defaultMessage: "What is Sepolia?" })}
        </h2>
        <p className="text-gray-700 mb-4">
          {t("interopDevnetDescription1", {
            defaultMessage:
              "Sepolia is an Ethereum testnet designed for developers to experiment with dApps and smart contracts in a safe and controlled environment."
          })}
        </p>
        <p className="text-gray-700 mb-4">
          {t("interopDevnetDescription2", {
            defaultMessage:
              "To get started, you'll need some Sepolia tokens. These tokens are free and can be used to deploy and test your projects."
          })}
        </p>
        <Button
          size="large"
          onClick={() => window.open("https://console.optimism.io/faucet", "_blank")}
        >
          {t("getInteropDevnetTokens", { defaultMessage: "Get Sepolia Tokens" })}
        </Button>
      </section>

      {/* Section 2: FORGE Token AirDrop */}
      <section className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          {t("forgeAirdrop", { defaultMessage: "FORGE Token AirDrop" })}
        </h2>
        <p className="text-gray-700 mb-4">
          {t("forgeDescription", {
            defaultMessage:
              "FORGE is our platform's utility token, designed to empower users and facilitate interactions within the ecosystem. Claim your FORGE tokens and start play!"
          })}
        </p>
        {!currentAccount ? (
          <Button size="large" onClick={connectWallet} className="text-white">
            {t("connectWallet", { defaultMessage: "Connect Wallet" })}
          </Button>
        ) : (
          <Button
            size="large"
            onClick={handleClaimForge}
            disabled={isClaiming || isClaimed}
            className={`px-6 py-2 rounded ${
              isClaiming ? "text-gray-500 cursor-not-allowed" : "text-white"
            }`}
          >
            {isClaiming
              ? t("claiming", { defaultMessage: "Claiming..." })
              : isClaimed
              ? t("alreadyClaimed", { defaultMessage: "Already Claimed" })
              : t("claimForgeTokens", { defaultMessage: "Claim FORGE Tokens" })}
          </Button>
        )}
      </section>
      {messageState.isOpen && (
        <Message
          message={messageState.message}
          type={messageState.type}
          onClose={closeMessage}
        />
      )}
    </div>
  );
}
