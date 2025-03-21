"use client";
import React, { useEffect, useState } from 'react';
import { Ion, Viewer, Cartesian3 } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import CesiumLINZViewerEnhanced from './CesiumLINZViewerEnhanced';
Ion.defaultAccessToken = process.env.NEXT_PUBLIC_ION_API_KEY || '';

const CesiumViewer: React.ComponentType = () => {
  const [viewer, setViewer] = useState<Viewer | null>(null);

  useEffect(() => {
    // Only render on client-side
    if (typeof window === 'undefined') return;
    
    // Initialize Cesium viewer
    const cesiumViewer = new Viewer('cesiumContainer', {
      terrainProvider: undefined, // Can be set to any terrain provider
      animation: false,
      baseLayerPicker: true,
      fullscreenButton: false,
      geocoder: true,
      homeButton: true,
      infoBox: true,
      sceneModePicker: true,
      selectionIndicator: true,
      timeline: false,
      navigationHelpButton: false,
    });

    // Set default view position (China)
    cesiumViewer.camera.setView({
      destination: Cartesian3.fromDegrees(172.5, -41.0, 1500000) 
    });

    // Save viewer instance to state
    setViewer(cesiumViewer);

    // Cleanup function
    return () => {
      if (cesiumViewer && !cesiumViewer.isDestroyed()) {
        cesiumViewer.destroy();
      }
    };
  }, []);

  return (
    <>
    <div id="cesiumContainer" style={{ width: '100%', height: '100vh' }}>
      
    </div>
    <CesiumLINZViewerEnhanced viewer={viewer} />
    </>
  );
};

export default CesiumViewer;