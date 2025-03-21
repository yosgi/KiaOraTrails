/**
 * SingleLinzLayer Component
 * 
 * React component for loading and displaying a single LINZ layer (NZ Walking and Biking Tracks)
 */

import React, { useEffect, useRef } from 'react';
import {
  Viewer,
  GeoJsonDataSource,
  ColorMaterialProperty,
  ConstantProperty,
  Math as CesiumMath
} from 'cesium';
import {
  loadLayerInfo,
  fetchWfsData,
  DEFAULT_LAYER
} from '../services/linzDataService';
import { Logger } from '../services/logger';

interface SingleLinzLayerProps {
  viewer: Viewer | null;
  initialBbox?: [number, number, number, number];
}

const SingleLinzLayer: React.FC<SingleLinzLayerProps> = ({
  viewer,
  initialBbox
}) => {
  // Use ref to track the loaded data source
  const dataSourceRef = useRef<GeoJsonDataSource | null>(null);
  
  // Load the layer on component mount
  useEffect(() => {
    let isComponentMounted = true;
    
    const loadLayer = async () => {
      if (!viewer) return;
      
      try {
        Logger.info('Loading NZ Walking and Biking Tracks layer');
        
        // Get the complete layer info from WFS service
        const layerInfo = await loadLayerInfo();
        
        // Determine bounding box
        let bbox = initialBbox;
        if (!bbox && viewer.camera) {
          // Try to get current view extent
          const rectangle = viewer.camera.computeViewRectangle();
          if (rectangle) {
            bbox = [
              CesiumMath.toDegrees(rectangle.west),
              CesiumMath.toDegrees(rectangle.south),
              CesiumMath.toDegrees(rectangle.east),
              CesiumMath.toDegrees(rectangle.north)
            ];
          }
        }
        
        // Fetch the layer data
        const geoJson = await fetchWfsData(layerInfo, bbox);
        
        if (!isComponentMounted) return;
        
        if (!geoJson.features || geoJson.features.length === 0) {
          Logger.warn(`No features found in the Walking and Biking Tracks layer`);
          return;
        }
        
        Logger.info(`Loaded ${geoJson.features.length} features for Walking and Biking Tracks`);
        
        // Load the GeoJSON into Cesium
        const dataSource = await GeoJsonDataSource.load(geoJson, {
          stroke: layerInfo.color,
          fill: layerInfo.color.withAlpha(0.3),
          strokeWidth: 2,
          clampToGround: true
        });
        
        if (!isComponentMounted) return;
        
        // Set the name for the data source
        dataSource.name = layerInfo.name;
        
        // Style the entities based on their type
        dataSource.entities.values.forEach(entity => {
          if (entity.polyline) {
            entity.polyline.width = new ConstantProperty(2);
            entity.polyline.material = new ColorMaterialProperty(layerInfo.color);
            entity.polyline.clampToGround = new ConstantProperty(true);
          }
          
          // Create description from properties
          if (entity.properties) {
            let description = '<table class="cesium-infoBox-defaultTable">';
            for (const key in entity.properties) {
              if (entity.properties.hasOwnProperty(key)) {
                const value = entity.properties[key];
                if (value && value._value !== undefined) {
                  description += `<tr><th>${key}</th><td>${value._value}</td></tr>`;
                }
              }
            }
            description += '</table>';
            entity.description = new ConstantProperty(description);
          }
        });
        
        // Store the data source in ref
        dataSourceRef.current = dataSource;
        
        // Add the data source to the viewer
        await viewer.dataSources.add(dataSource);
        
        Logger.info('Walking and Biking Tracks layer loaded successfully');
      } catch (err) {
        Logger.error('Error loading Walking and Biking Tracks layer:', err);
      }
    };
    
    if (viewer) {
      loadLayer();
    }
    
    // Cleanup function for component unmount
    return () => {
      isComponentMounted = false;
      if (viewer && dataSourceRef.current) {
        viewer.dataSources.remove(dataSourceRef.current);
        dataSourceRef.current = null;
      }
    };
  }, [viewer, initialBbox]);
  
  // This component doesn't render any UI
  return null;
};

export default SingleLinzLayer;