"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Ion, Viewer, Cartesian3 } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import CesiumLINZViewerEnhanced from './CesiumLINZViewerEnhanced';
import AdvancedPointLayer from "./AdvancedTrackPointsLayer";
Ion.defaultAccessToken = process.env.NEXT_PUBLIC_ION_API_KEY || '';

const sampleTrackPoints = [
  {
    id: '1',
    name: 'Tongariro Alpine Crossing Trailhead',
    latitude: -39.1328,
    longitude: 175.6473,
    color: 'green',
    type: 'trailhead',
    properties: {
      difficulty: 'Advanced',
      estimated_time: '7-8 hours',
      elevation_gain: '765m'
    }
  },
  {
    id: '2',
    name: 'Emerald Lakes Viewpoint',
    latitude: -39.1361,
    longitude: 175.6587,
    color: 'blue',
    type: 'poi',
    properties: {
      description: 'Stunning colored volcanic lakes',
      photo_opportunity: true
    }
  },
  {
    id: '3',
    name: 'Red Crater Summit',
    latitude: -39.1342,
    longitude: 175.6551,
    color: 'red',
    type: 'summit',
    properties: {
      elevation: '1868m',
      volcanic_activity: 'Active thermal area'
    }
  },
  {
    id: '4',
    name: 'Mangatepopo Car Park',
    latitude: -39.1558,
    longitude: 175.5807,
    color: 'green',
    type: 'parking',
    properties: {
      facilities: 'Toilets, Information',
      shuttle_service: true
    }
  },
  {
    id: '5',
    name: 'Ketetahi Car Park',
    latitude: -39.1099,
    longitude: 175.6519,
    color: 'green',
    type: 'parking',
    properties: {
      facilities: 'Toilets, Information',
      shuttle_service: true
    }
  }
];

// Helper function to check if a viewer is valid and ready to use
const isViewerReady = (viewer: Viewer | null): boolean => {
  return !!viewer && 
         !!viewer.scene && 
         !!viewer.camera && 
         !!viewer.entities && 
         !viewer.isDestroyed();
};

const CesiumViewer: React.FC = () => {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [viewerReady, setViewerReady] = useState<boolean>(false);
  const viewerRef = useRef<Viewer | null>(null);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    // Only render on client-side
    if (typeof window === 'undefined') return;
    
    let cesiumViewer: Viewer | null = null;
    
    try {
      // Initialize Cesium viewer
      cesiumViewer = new Viewer('cesiumContainer', {
        terrainProvider: undefined, // Can be set to any terrain provider
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

      // Set default view position (New Zealand)
      cesiumViewer.camera.setView({
        destination: Cartesian3.fromDegrees(172.5, -41.0, 1500000) 
      });

      // Keep reference in ref (for cleanup) and state (for rendering)
      viewerRef.current = cesiumViewer;
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        setViewer(cesiumViewer);
        
        // Set viewer ready after a short delay to ensure initialization is complete
        setTimeout(() => {
          if (mountedRef.current && isViewerReady(cesiumViewer)) {
            setViewerReady(true);
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error initializing Cesium viewer:", error);
    }

    // Cleanup function
    return () => {
      mountedRef.current = false;
      
      try {
        if (cesiumViewer && !cesiumViewer.isDestroyed()) {
          // First set state to null to prevent child components from accessing a destroyed viewer
          setViewer(null);
          setViewerReady(false);
          
          // Then destroy the viewer
          cesiumViewer.destroy();
        }
      } catch (error) {
        console.error("Error destroying Cesium viewer:", error);
      }
    };
  }, []);

  return (
    <>
      <div id="cesiumContainer" style={{ width: '100%', height: '100vh' }}></div>
      
      {/* Only render child components when viewer is ready */}
      {viewerReady && viewer && (
        <>
          <CesiumLINZViewerEnhanced viewer={viewer} />
          <AdvancedPointLayer
            viewer={viewer}
            trackPoints={sampleTrackPoints}
          />
        </>
      )}
    </>
  );
};

export default CesiumViewer;