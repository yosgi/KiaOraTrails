"use client";
import React, { useEffect, useState } from 'react';
import { Ion, Viewer, Cartesian3 } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import CesiumLINZViewerEnhanced from './CesiumLINZViewerEnhanced';
import PointLayer from "./TrackPointsLayer"
import AdvancedPointLayer from "./AdvancedTrackPointsLayer"
import { useCesium } from '../../../providers/CesiumContext';
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

const CesiumViewer: React.ComponentType = () => {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  useEffect(() => {
    // Only render on client-side
    if (typeof window === 'undefined') return;
    
    // Initialize Cesium viewer
    const cesiumViewer = new Viewer('cesiumContainer', {
      terrainProvider: undefined, // Can be set to any terrain provider
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: true,
      geocoder: true,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: true,
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
      <div id="cesiumContainer" style={{ width: '100%', height: '100vh' }}></div>
      {
        viewer && (
          <CesiumLINZViewerEnhanced viewer={viewer} />
        )
      }
      {
        viewer && (
          <AdvancedPointLayer
          viewer={viewer}
          trackPoints={sampleTrackPoints}
     ></AdvancedPointLayer>
        )
      }
      
       
    </>
  );
};

export default CesiumViewer;