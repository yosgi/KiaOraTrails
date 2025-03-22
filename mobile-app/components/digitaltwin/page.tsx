"use client";
import React, { useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const CesiumViewerNoSSR = dynamic(
  () => import('./components/CesiumViewer') as any,
  { ssr: false }
);
const HomePage = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <CesiumViewerNoSSR />
    </div>  
  );
}

export default HomePage;
