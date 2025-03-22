import React, { useEffect, useRef, useState } from 'react';
import {
  Entity,
  Cartesian3,
  Color,
  HorizontalOrigin,
  VerticalOrigin,
  NearFarScalar,
  HeightReference,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  PinBuilder
} from 'cesium';
import * as Cesium from 'cesium';
import { Logger } from '../services/logger';

// Define interface for track point data
interface TrackPoint {
  id: string;
  name?: string;
  latitude: number;
  longitude: number;
  color?: string; 
  type?: string; // Optional type (e.g., 'trailhead', 'poi', 'viewpoint')
  properties?: any; // Additional properties
}

interface TrackPointsLayerProps {
  viewer: Cesium.Viewer | null;
  trackPoints: TrackPoint[];
  onPointClick?: (point: TrackPoint) => void;
}

const TrackPointsLayer: React.FC<TrackPointsLayerProps> = ({
  viewer,
  trackPoints,
  onPointClick
}) => {
  // Reference to store entity objects for cleanup
  const entitiesRef = useRef<Map<string, Entity>>(new Map());
  const clickHandlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  
  // State for selected point
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // Available colors for pins (matching the screenshot)
  const PIN_COLORS: Record<string, Color> = {
    red: Color.RED,
    green: Color.GREEN,
    blue: Color.BLUE,
    default: Color.DARKCYAN
  };

  // Function to create pin entities from track points
  useEffect(() => {
    if (!viewer || !trackPoints || trackPoints.length === 0) return;

    // Create pin builder
    const pinBuilder = new PinBuilder();
    
    // Clear any existing entities
    clearEntities();

    Logger.info(`Creating ${trackPoints.length} track point markers`);
    
    // Create entities for each track point
    trackPoints.forEach(point => {
      try {
        // Determine color (default to green if not specified)
        const colorName = (point.color && Object.keys(PIN_COLORS).includes(point.color)) 
          ? point.color 
          : 'green';
        
        const colorValue = PIN_COLORS[colorName] || PIN_COLORS.default;
        
        // Create pin canvas
        const pinCanvas = pinBuilder.fromColor(colorValue, 48);
        
        // Create the entity
        const entity = new Entity({
          id: `track-point-${point.id}`,
          name: point.name || `Track Point ${point.id}`,
          position: Cartesian3.fromDegrees(point.longitude, point.latitude),
          billboard: {
            image: pinCanvas,
            verticalOrigin: VerticalOrigin.BOTTOM,
            horizontalOrigin: HorizontalOrigin.CENTER,
            heightReference: HeightReference.RELATIVE_TO_GROUND,
            scale: 0.8,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            scaleByDistance: new NearFarScalar(1000, 1.0, 5000, 0.6)
          },
          properties: {
            ...point.properties,
            originalPointData: point
          }
        });
        
        // Add to viewer and store reference
        viewer.entities.add(entity);
        entitiesRef.current.set(point.id, entity);
        
      } catch (err) {
        Logger.error(`Error creating entity for track point ${point.id}:`, err);
      }
    });
    
    // Setup click handler
    setupClickHandler();
    
    return () => {
      clearEntities();
      if (clickHandlerRef.current) {
        clickHandlerRef.current.destroy();
        clickHandlerRef.current = null;
      }
    };
  }, [viewer, trackPoints]);
  
  // Function to clear all entities
  const clearEntities = () => {
    if (!viewer) return;
    
    entitiesRef.current.forEach((entity, id) => {
      try {
        viewer.entities.remove(entity);
      } catch (err) {
        Logger.error(`Error removing entity ${id}:`, err);
      }
    });
    
    entitiesRef.current.clear();
  };
  
  // Setup click handler for points
  const setupClickHandler = () => {
    if (!viewer) return;
    
    // Remove existing handler if any
    if (clickHandlerRef.current) {
      clickHandlerRef.current.destroy();
    }
    
    // Create new handler
    const handler = new ScreenSpaceEventHandler(viewer.canvas);
    clickHandlerRef.current = handler;
    
    // Add click event
    handler.setInputAction((movement: any) => {
      const pickedObject = viewer.scene.pick(movement.position);
      
      // Reset previous selection
      resetHighlighting();
      
      if (pickedObject && pickedObject.id instanceof Entity) {
        const entity = pickedObject.id;
        const entityId = entity.id;
        
        // Check if it's one of our track points
        if (entityId && entityId.toString().startsWith('track-point-')) {
          const pointId = entityId.toString().replace('track-point-', '');
          
          // Highlight selected point
          highlightPoint(pointId);
          
          // Call the click handler if provided
          if (onPointClick && entity.properties) {
            const pointData = entity.properties.originalPointData.getValue();
            onPointClick(pointData);
          }
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
  };
  
  // Highlight selected point
  const highlightPoint = (pointId: string) => {
    const entity = entitiesRef.current.get(pointId);
    
    if (entity && entity.billboard) {
      // Scale up the selected point
      entity.billboard.scale = 1.2 as any; // Type assertion needed for Cesium property compatibility
      
      // Store the selected point id
      setSelectedPointId(pointId);
    }
  };
  
  // Reset highlighting
  const resetHighlighting = () => {
    if (selectedPointId) {
      const entity = entitiesRef.current.get(selectedPointId);
      
      if (entity && entity.billboard) {
        // Reset scale
        entity.billboard.scale = 0.8 as any; // Type assertion needed for Cesium property compatibility
      }
      
      setSelectedPointId(null);
    }
  };
  
  // Component doesn't render anything directly to the DOM
  return null;
};

export default TrackPointsLayer;