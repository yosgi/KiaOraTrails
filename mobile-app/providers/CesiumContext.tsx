// CesiumContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Ion, Viewer } from 'cesium';

interface CesiumContextType {
  viewer: Viewer | null;
}

interface CesiumProviderProps {
  children: ReactNode;
}

const CesiumContext = createContext<CesiumContextType>({ viewer: null });

export const CesiumProvider: React.FC<CesiumProviderProps> = ({ children }) => {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    Ion.defaultAccessToken = process.env.NEXT_PUBLIC_ION_API_KEY || '';
    
    if (!containerRef.current) return;
    
    const cesiumViewer = new Viewer(containerRef.current, {
      terrainProvider: undefined,
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
    });
    
    viewerRef.current = cesiumViewer;
    setViewer(cesiumViewer);
    
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, []);
  
  return (
    <CesiumContext.Provider value={{ viewer }}>
      {/* <div ref={containerRef} style={{ width: '100%', height: '100vh' }}></div> */}
      {
        children
      }
    </CesiumContext.Provider>
  );
};

export const useCesium = (): CesiumContextType => useContext(CesiumContext);