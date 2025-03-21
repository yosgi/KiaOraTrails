"use client";

import React, { useState, useEffect, useRef } from "react";
import GamefiApp from "gamefi";

interface KeyButtonProps {
  label: string;
  active: boolean;
}

function KeyButton({ label, active }: KeyButtonProps): JSX.Element {
  const style: React.CSSProperties = {
    width: "60px",
    height: "60px",
    background: active ? "#ffeb3b" : "#333",
    color: active ? "#000" : "#fff",
    border: "2px solid #fff",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    transition: "all 0.1s ease-in-out",
    boxShadow: active ? "0 0 10px #ffeb3b" : "none",
  };
  return <div style={style}>{label}</div>;
}

const GamePage = (): JSX.Element => {
  const [activeKey, setActiveKey] = useState<string>("");
  // Use a ref to keep track of the current activeKey without triggering re-renders
  const activeKeyRef = useRef(activeKey);
  // Ref for double-tap detection on ArrowUp
  const lastArrowUpTime = useRef<number | null>(null);

  // Update ref when state changes
  useEffect(() => {
    activeKeyRef.current = activeKey;
  }, [activeKey]);

  const handleKeyDown = (e: KeyboardEvent) => {
    let key = e.key.toLowerCase();

    // Handle Shift for dodge
    if (e.key === "Shift") {
      key = "shift";
      setActiveKey(key);
      return;
    }

    // Handle Arrow keys
    if (e.key === "ArrowUp") {
      const now = Date.now();
      if (lastArrowUpTime.current && now - lastArrowUpTime.current < 300) {
        key = "doubleup";
      } else {
        key = "arrowup";
      }
      lastArrowUpTime.current = now;
    }
    if (e.key === "ArrowLeft") key = "arrowleft";
    if (e.key === "ArrowRight") key = "arrowright";

    // Only handle defined keys
    if (
      ["arrowup", "doubleup", "arrowleft", "arrowright", "d", "f", "shift"].includes(key)
    ) {
      setActiveKey(key);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    let key = e.key.toLowerCase();
    if (e.key === "Shift") key = "shift";
    if (e.key === "ArrowUp") key = "arrowup";
    if (e.key === "ArrowLeft") key = "arrowleft";
    if (e.key === "ArrowRight") key = "arrowright";

    // Use the ref's current value to decide if we should clear the active key
    if (activeKeyRef.current === key || activeKeyRef.current === "doubleup") {
      setActiveKey("");
    }
  };

  // Add event listeners once on mount
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#222",
        color: "#fff",
        fontFamily: "'Press Start 2P', cursive",
        padding: "20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "32px", margin: "10px 0" }}>Pixel Fighter</h1>
      </div>

      {/* Centered game container with fixed dimensions */}
      <div
        style={{
          width: "800px",
          height: "600px",
          border: "3px solid #fff",
          borderRadius: "10px",
          background: "#000",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <GamefiApp />
      </div>

      {/* Control keys area */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <KeyButton label="↑" active={activeKey === "arrowup" || activeKey === "doubleup"} />
        <KeyButton label="←" active={activeKey === "arrowleft"} />
        <KeyButton label="→" active={activeKey === "arrowright"} />
        <KeyButton label="Shift" active={activeKey === "shift"} />
        <KeyButton label="D" active={activeKey === "d"} />
        <KeyButton label="F" active={activeKey === "f"} />
      </div>
    </div>
  );
};

export default GamePage;
