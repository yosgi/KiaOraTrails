"use client";
import React, { useEffect, useState } from 'react';
import { Ion, Viewer, Cartesian3 } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import CesiumLINZViewerEnhanced from './CesiumLINZViewerEnhanced';
import PointLayer from "./TrackPointsLayer"
import AdvancedPointLayer from "./AdvancedTrackPointsLayer"
import { useCesium } from '../../../providers/CesiumContext';
import * as Cesium from 'cesium';
import { AuthAPI } from "../../../app/utils/api"
import IssueDetailsModal from './IssueDetailsModal';
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
  const [issues, setIssues] = useState([])
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  useEffect(() => {
    // Only render on client-side
    if (typeof window === 'undefined') return;
    
    let isMounted = true;
    const cesiumViewer = new Viewer('cesiumContainer', {
      // terrainProvider: Cesium.createWorldTerrain(), // Can be set to any terrain provider
      animation: false,
      baseLayerPicker: true,
      fullscreenButton: true,
      geocoder: true,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
    });
    
  
    Cesium.createWorldTerrainAsync()
      .then(terrain => {
        if (isMounted && cesiumViewer && !cesiumViewer.isDestroyed()) {
          cesiumViewer.terrainProvider = terrain;
        }
      })
      .catch(error => {
        if (isMounted) {
          console.error('Failed to load terrain:', error);
        }
      });
  
    // Set default view position
    cesiumViewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(174.7692, -36.8885, 8500)
    });
  
    // Save viewer instance to state
    setViewer(cesiumViewer);
  
    // Cleanup function
    return () => {
      isMounted = false;
      if (cesiumViewer && !cesiumViewer.isDestroyed()) {
        cesiumViewer.destroy();
      }
    };
  }, []);


  useEffect(() => {
    async function fetchIssues() {
      try {
        let response = await AuthAPI.get("/posts")
        response = response.map((issue) => {
          console.log(issue.location)
          issue.latitude = JSON.parse(issue.location).lat
          issue.longitude = JSON.parse(issue.location).lng
          issue.color = 'red'
          issue.type = 'trailhead'
          return issue
        }
        )
        console.log("response",response)
        setIssues(response)
      } catch (error) {
        console.error("Failed to fetch issues:", error)
      }
    }

    fetchIssues()
  }, [])

   // Handle issue click
   const handleIssueClick = (issue: any) => {
    console.log('Issue clicked:', issue);
    // Additional handling if needed
  };
  
  // Close the issue details modal
  const handleCloseIssueDetails = () => {
    setSelectedIssue(null);
  };

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
          trackPoints={issues}
          showLabels={true}
          setSelectedIssue={setSelectedIssue}
          defaultPinSize={32}
          pulsateOnHover={true}
     ></AdvancedPointLayer>
        )
      }
      {/* Issue details modal */}
      {selectedIssue && (
        <IssueDetailsModal
          issue={selectedIssue}
          onClose={handleCloseIssueDetails}
        />
      )}
      
       
    </>
  );
};

export default CesiumViewer;