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
  PinBuilder,
  CallbackProperty,
  ConstantProperty,
  Billboard,
  Math as CesiumMath
} from 'cesium';
import { Logger } from '../services/logger';
import * as Cesium from 'cesium';

// Define interface for track point data
interface TrackPoint {
  id: string;
  name?: string;
  latitude: number;
  longitude: number;
  color?: string; // Optional color (e.g., 'red', 'blue', 'green')
  type?: string; // Optional type (e.g., 'trailhead', 'poi', 'viewpoint')
  icon?: string; // Optional icon to use inside the pin (e.g., 'parking', 'info', 'summit')
  properties?: any; // Additional properties
  customStyle?: {
    scale?: number;
    pixelOffset?: [number, number];
    eyeOffset?: [number, number, number];
    customImageUrl?: string; // For completely custom marker images
  };
}

interface TrackPointsLayerProps {
  viewer: Cesium.Viewer | null;
  trackPoints: TrackPoint[];
  onPointClick?: (point: TrackPoint) => void;
  defaultPinSize?: number; // Default size for pins (default: 48px)
  defaultPinColor?: string; // Default color for pins (default: 'green')
  clusterMarkers?: boolean; // Whether to cluster markers when zoomed out
  pulsateOnHover?: boolean; // Whether markers should pulsate on hover
  showLabels?: boolean; // Whether to show labels next to markers
  flyToDuration?: number; // Duration of camera flight animation in seconds (default: 3)
  terrainHeightOffset?: number; // Height offset above terrain in meters (default: 500)
}

const TrackPointsLayer: React.FC<TrackPointsLayerProps> = ({
  viewer,
  trackPoints,
  onPointClick,
  defaultPinSize = 48,
  defaultPinColor = 'green',
  clusterMarkers = false,
  pulsateOnHover = false,
  showLabels = false,
  flyToDuration = 3,
  terrainHeightOffset = 1000
}) => {
  // Reference to store entity objects for cleanup
  const entitiesRef = useRef<Map<string, Entity>>(new Map());
  const clickHandlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  const hoverHandlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  const dataSourceRef = useRef<Cesium.CustomDataSource | null>(null);
  
  // State for selected and hovered points
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

  // Available colors for pins (matching the screenshot)
  const PIN_COLORS: Record<string, Color> = {
    red: Color.RED,
    green: Color.GREEN,
    blue: Color.BLUE,
    yellow: Color.YELLOW,
    cyan: Color.CYAN,
    magenta: Color.MAGENTA,
    white: Color.WHITE,
    black: Color.BLACK,
    orange: Color.ORANGE,
    default: Color.GREEN
  };

  // Available icons for pins
  const PIN_ICONS: Record<string, string | undefined> = {
    parking: '🅿️',
    info: 'ℹ️',
    summit: '🏔️',
    viewpoint: '👁️',
    trailhead: '🚶',
    cafe: '☕',
    water: '💧',
    danger: '⚠️',
    lodge: '🏠',
    tent: '⛺',
    default: undefined
  };

  // Function to create pin entities from track points
  useEffect(() => {
    if (!viewer || !trackPoints || trackPoints.length === 0) return;

    // Create pin builder
    const pinBuilder = new PinBuilder();
    
    // Create data source for clustering (if enabled)
    if (clusterMarkers) {
      if (dataSourceRef.current) {
        viewer.dataSources.remove(dataSourceRef.current);
      }
      
      dataSourceRef.current = new Cesium.CustomDataSource('trackPoints');
      viewer.dataSources.add(dataSourceRef.current);
      
      // Configure clustering
      dataSourceRef.current.clustering.enabled = true;
      dataSourceRef.current.clustering.pixelRange = 50;
      dataSourceRef.current.clustering.minimumClusterSize = 3;
    } else {
      // Clear any existing entities
      clearEntities();
    }

    Logger.info(`Creating ${trackPoints.length} track point markers`);
    
    // Create entities for each track point
    trackPoints.forEach(point => {
      try {
        // Determine color (default to the specified default color if not specified)
        const colorName = (point.color && Object.keys(PIN_COLORS).includes(point.color)) 
          ? point.color 
          : defaultPinColor;
        
        const colorValue = PIN_COLORS[colorName] || PIN_COLORS.default;
        
        // Determine icon if provided
        const icon = point.icon 
          ? (Object.keys(PIN_ICONS).includes(point.icon) ? PIN_ICONS[point.icon] : point.icon) 
          : undefined;
        
        // Create pin canvas - with or without icon
        let pinCanvas;
        if (icon) {
          pinCanvas = pinBuilder.fromText(icon, colorValue, defaultPinSize);
        } else {
          pinCanvas = pinBuilder.fromColor(colorValue, defaultPinSize);
        }
        
        // Create entity options
        const entityOptions: any = {
          id: `track-point-${point.id}`,
          name: point.name || `Track Point ${point.id}`,
          position: Cartesian3.fromDegrees(point.longitude, point.latitude),
          billboard: {
            image: point.customStyle?.customImageUrl || pinCanvas,
            verticalOrigin: VerticalOrigin.BOTTOM,
            horizontalOrigin: HorizontalOrigin.CENTER,
            heightReference: HeightReference.RELATIVE_TO_GROUND,
            scale: point.customStyle?.scale || 0.8,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            scaleByDistance: new NearFarScalar(1000, 1.0, 5000, 0.6)
          },
          properties: {
            ...point.properties,
            originalPointData: point
          }
        };
        
        // Add pixel offset if specified
        if (point.customStyle?.pixelOffset) {
          entityOptions.billboard.pixelOffset = new Cesium.Cartesian2(
            point.customStyle.pixelOffset[0],
            point.customStyle.pixelOffset[1]
          );
        }
        
        // Add eye offset if specified
        if (point.customStyle?.eyeOffset) {
          entityOptions.billboard.eyeOffset = new Cesium.Cartesian3(
            point.customStyle.eyeOffset[0],
            point.customStyle.eyeOffset[1],
            point.customStyle.eyeOffset[2]
          );
        }
        
        // Add label if showLabels is enabled
        if (showLabels && point.name) {
          entityOptions.label = {
            text: point.name,
            font: '12px sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            outlineColor: Color.BLACK,
            fillColor: Color.WHITE,
            verticalOrigin: VerticalOrigin.TOP,
            horizontalOrigin: HorizontalOrigin.CENTER,
            pixelOffset: new Cesium.Cartesian2(0, -5),
            heightReference: HeightReference.RELATIVE_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            translucencyByDistance: new NearFarScalar(1e3, 1.0, 5.0e3, 0.0)
          };
        }
        
        // Create the entity
        const entity = new Entity(entityOptions);
        
        // Add to viewer and store reference
        if (clusterMarkers && dataSourceRef.current) {
          dataSourceRef.current.entities.add(entity);
        } else {
          viewer.entities.add(entity);
        }
        
        entitiesRef.current.set(point.id, entity);
        
      } catch (err) {
        Logger.error(`Error creating entity for track point ${point.id}:`, err);
      }
    });
    
    // Setup handlers
    setupClickHandler();
    if (pulsateOnHover) {
      setupHoverHandler();
    }
    
    return () => {
      clearEntities();
      if (clickHandlerRef.current) {
        clickHandlerRef.current.destroy();
        clickHandlerRef.current = null;
      }
      if (hoverHandlerRef.current) {
        hoverHandlerRef.current.destroy();
        hoverHandlerRef.current = null;
      }
      if (dataSourceRef.current) {
        viewer.dataSources.remove(dataSourceRef.current);
        dataSourceRef.current = null;
      }
    };
  }, [viewer, trackPoints, defaultPinColor, defaultPinSize, clusterMarkers, pulsateOnHover, showLabels]);
  
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

  // Function to fly to a point with 45-degree pitch
  const flyToPoint = (point: TrackPoint) => {
    if (!viewer) return;

    try {
      // Get point position
      const position = Cartesian3.fromDegrees(
        point.longitude,
        point.latitude
      );

      // Get the ellipsoid for coordinate calculations
      const ellipsoid = viewer.scene.globe.ellipsoid;
      
      // Define camera parameters for 45-degree view
      const pitch = CesiumMath.toRadians(-45); // 45 degrees pitch (negative for looking down)
      const heading = CesiumMath.toRadians(0); // Optional: adjust heading if needed
      
      // Create a camera flight options object
      const options = {
        destination: position,
        orientation: {
          heading: heading,
          pitch: pitch,
          roll: 0
        },
        duration: flyToDuration,
        complete: () => {
          // After flight is complete, adjust height to be above terrain
          const cartographic = ellipsoid.cartesianToCartographic(position);
          
          // Get terrain height asynchronously, then adjust camera
          // Using sampleHeightMostDetailed instead of deprecated sampleTerrainMostDetailed
          viewer.scene.sampleHeightMostDetailed([cartographic])
            .then((updatedPositions: Array<{ height: number; longitude: number; latitude: number }>) => {
              // Height is now available in the returned positions
              const terrainHeight = updatedPositions[0]?.height || 0;
              
              // Calculate final position with height offset
              const finalPosition = Cartesian3.fromRadians(
                cartographic.longitude,
                cartographic.latitude,
                terrainHeight + terrainHeightOffset
              );
              
              // Set the camera to the final position with the same orientation
              viewer.camera.setView({
                destination: finalPosition,
                orientation: {
                  heading: heading,
                  pitch: pitch,
                  roll: 0
                }
              });
              
              Logger.info(`Camera positioned at height ${terrainHeight + terrainHeightOffset}m above terrain`);
            })
            .catch((error: Error) => {
              Logger.error('Error sampling terrain:', error);
              
              // Fallback: just move camera up by the offset
              const finalPosition = Cartesian3.fromRadians(
                cartographic.longitude,
                cartographic.latitude,
                terrainHeightOffset
              );
              
              viewer.camera.setView({
                destination: finalPosition,
                orientation: {
                  heading: heading,
                  pitch: pitch,
                  roll: 0
                }
              });
            });
        }
      };
      
      // Start the camera flight
      viewer.camera.flyTo(options);
      
      Logger.info(`Flying to point ${point.id} at ${point.latitude}, ${point.longitude}`);
    } catch (err) {
      Logger.error(`Error flying to point ${point.id}:`, err);
    }
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
          
          // Get the point data
          if (entity.properties) {
            const pointData = entity.properties.originalPointData.getValue();
            
            // Fly to the point with camera animation
            flyToPoint(pointData);
            
            // Call the click handler if provided
            if (onPointClick) {
              onPointClick(pointData);
            }
          }
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
  };
  
  // Setup hover handler for pulsating effect
  const setupHoverHandler = () => {
    if (!viewer || !pulsateOnHover) return;
    
    // Remove existing handler if any
    if (hoverHandlerRef.current) {
      hoverHandlerRef.current.destroy();
    }
    
    // Create new handler
    const handler = new ScreenSpaceEventHandler(viewer.canvas);
    hoverHandlerRef.current = handler;
    
    // Add hover events
    handler.setInputAction((movement: any) => {
      const pickedObject = viewer.scene.pick(movement.endPosition);
      
      // Reset previous hover state
      if (hoveredPointId) {
        const entity = entitiesRef.current.get(hoveredPointId);
        if (entity && entity.billboard) {
          // Stop pulsating
          entity.billboard.scale = new ConstantProperty(0.8);
        }
        setHoveredPointId(null);
      }
      
      if (pickedObject && pickedObject.id instanceof Entity) {
        const entity = pickedObject.id;
        const entityId = entity.id;
        
        // Check if it's one of our track points
        if (entityId && entityId.toString().startsWith('track-point-')) {
          const pointId = entityId.toString().replace('track-point-', '');
          
          // Don't apply hover effect to selected point
          if (pointId !== selectedPointId) {
            setHoveredPointId(pointId);
            
            // Start pulsating
            const entity = entitiesRef.current.get(pointId);
            if (entity && entity.billboard) {
              // Create pulsating effect
              let time = Date.now();
              entity.billboard.scale = new CallbackProperty(() => {
                const t = (Date.now() - time) / 1000;
                return 0.8 + 0.2 * Math.sin(t * 4);
              }, false) as any; // Type assertion needed for Cesium property compatibility
            }
          }
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);
  };
  
  // Highlight selected point
  const highlightPoint = (pointId: string) => {
    const entity = entitiesRef.current.get(pointId);
    
    if (entity && entity.billboard) {
      // Scale up the selected point
      entity.billboard.scale = new ConstantProperty(1.2);
      
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
        entity.billboard.scale = new ConstantProperty(0.8);
      }
      
      setSelectedPointId(null);
    }
  };
  
  // Component doesn't render anything directly to the DOM
  return null;
};

export default TrackPointsLayer;