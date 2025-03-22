import React, { useEffect, useRef, useState } from 'react';
import {
  Viewer,
  GeoJsonDataSource,
  ColorMaterialProperty,
  ConstantProperty,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Entity,
  Cartesian3,
  Cartographic,
  HeightReference,
  Color,
  Cartesian2,
  Primitive,
  PrimitiveCollection,
  GeometryInstance,
  PolylineGeometry,
  PolylineColorAppearance
} from 'cesium';
import {
  fetchWfsData,
} from '../services/linzDataService';
import { Logger } from '../services/logger';
import { LINZ_CONFIG } from '../services/config';
import * as Cesium from 'cesium';

interface TrackFeature {
  id: string;
  properties: any;
  geometry: any;
  primitive?: Primitive;
  highlighted?: boolean;
}


// Directly use the layerInfo provided rather than fetching it
const LAYER_INFO = {
  id: "52100",
  name: "data.linz.govt.nz:layer-52100",
  title: "NZ Walking and Biking Tracks",
  abstract: "**This dataset is not currently being maintained and includes some track information that is out-of-date. **\n******************************************\n\nThe NZ Tracks data identifies walking and biking tracks across New Zealand and has been developed through a collaboration between the Local Government Geospatial Alliance (LGGA), LINZ, Department of Conservation and the Walking Access commission.\n\nThe dataset is currently a work in progress.  The data has been made available to enable users to access the data supplied to date in its relatively raw form, and to identify the gaps in data provision so that these can be addressed.\n\nThe ultimate aim is to provide a national network of walking and biking tracks, including track grade, conditions of use and supplementary information.\n\nFor more information about the Local Government Geospatial Alliance project which initiated the creation of this dataset please refer to http://lgga-nz.blogspot.co.nz/p/tracks-project.html\nPlease be aware of the following:\n\n-  LINZ has not undertaken any data quality assurance on the data geometry or attribution.\n\n- The existence of track does not necessarily indicate public right of access.\n\n- Closed tracks are defined as being no longer maintained or passable and should not be used by recreationalists.\n\n- The Department of Conservation or other authorities should be contacted for the latest information on tracks and huts.\n\n\nData is sourced from Local Government and Central Government Agencies, including:\nDepartment of Conservation, Walking Access Commission, NZ Transport Agency, Napier City Council, Hastings District Council, Environment Canterbury, Mackenzie District Council, Timaru District Council, Waitaki District Council, Nelson City Council, Tasman District Council, Marlborough District Council, Bay of Plenty Regional Council, Kawerau District Council, Opotiki District Council, Tauranga City Council, Whakatane District Council, Waipa District Council, Waikato District Council, Waikato Regional Council, Invercargill City Council, Environment Southland, New Plymouth District Council, Greater Wellington Regional Council, Wellington City Council, Palmerston North City Council and Ollivier &amp; Company.\n\nLicense: Creative Commons Attribution 4.0 International - https://data.linz.govt.nz/license/attribution-4-0-international/\nMore Information: https://data.linz.govt.nz/layer/52100-nz-walking-and-biking-tracks/\n",
  defaultCRS: "urn:ogc:def:crs:EPSG::2193",
  outputFormats: [
    "application/gml+xml; version=3.2",
    "GML2",
    "KML",
    "application/json",
    "application/vnd.google-earth.kml xml",
    "application/vnd.google-earth.kml+xml",
    "csv",
    "gml3",
    "gml32",
    "json",
    "text/csv",
    "text/javascript",
    "text/xml; subtype=gml/2.1.2",
    "text/xml; subtype=gml/3.1.1",
    "text/xml; subtype=gml/3.2"
  ],
  boundingBox: {
    minX: 166.19999990000005,
    minY: -52.59091814911092,
    maxX: 183.9000001,
    maxY: -34.416873862888025,
    crs: "EPSG:4326"
  },
  keywords: [
    "New Zealand"
  ],
  color: Color.DARKCYAN, // Default color for the layer
  shortAbstract: "This dataset is not currently being maintained and includes some track information that is out-of-date."
};

interface EnhancedLinzLayerProps {
  viewer: Viewer | null;
  initialBbox?: [number, number, number, number];
}

interface TrackInfo {
  id: string;
  name: string;
  length_km?: number;
  track_class?: string;
  description?: string;
  dog_access?: string;
  walk?: string;
  bike?: string;
  surface?: string;
  status?: string;
  last_modified?: string;
  source?: string;
  [key: string]: any; // For other properties
}

interface TrackProperty {
  label: string;
  key: string;
  format?: (value: any) => string;
}

// Define types

interface TrackProperty {
  label: string;
  key: string;
  format?: (value: any) => string;
}

interface TrackFeature {
  id: string;
  properties: any;
  geometry: any;
  primitive?: Primitive;
  highlighted?: boolean;
}


const EnhancedLinzLayer: React.FC<EnhancedLinzLayerProps> = ({
  viewer,
  initialBbox
}) => {
  if (!viewer || !viewer.scene) {
    return <div>Loading Cesium Viewer...</div>;
  }
  // Refs for primitives collections
  const baseLayerPrimitivesRef = useRef<PrimitiveCollection | null>(null);
  const nearbyTracksPrimitivesRef = useRef<PrimitiveCollection | null>(null);
  const highlightedPrimitiveRef = useRef<Primitive | null>(null);
  const clickHandlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  
  // Refs to maintain track data (since primitives don't store properties)
  const baseTracksDataRef = useRef<Map<string, TrackFeature>>(new Map());
  const nearbyTracksDataRef = useRef<Map<string, TrackFeature>>(new Map());
  const highlightedTrackIdRef = useRef<string | null>(null);

  // State for track details panel
  const [selectedTrack, setSelectedTrack] = useState<TrackInfo | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDataWarning, setShowDataWarning] = useState<boolean>(true);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [lastLoadedViewport, setLastLoadedViewport] = useState<{ center: Cartesian3, zoom: number } | null>(null);
  const viewChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Color constants
  const CLICK_CIRCLE_COLOR = Color.GRAY.withAlpha(0.5);
  const HIGHLIGHT_COLOR = Color.YELLOW;
  const DEFAULT_COLOR = Color.BLUE.withAlpha(0.5);
  const NEARBY_TRACKS_COLOR = DEFAULT_COLOR;

  // Added state for mouse position
  const [mouseCartesian, setMouseCartesian] = useState<Cartesian3 | null>(null);

  // API key for LINZ data service
  const LINZ_API_KEY = LINZ_CONFIG.API_KEY;
  const ZOOM_THRESHOLD = 50000; // Height in meters - when to load nearby tracks
  const VIEW_CHANGE_DEBOUNCE = 500; // ms to wait after camera stops moving
  const CIRCLE_CURSOR_RADIUS = 200; // Radius of the circle cursor in meters

  // Initialize primitive collections on component mount
  useEffect(() => {
    if (!viewer || !viewer.scene) return;

    // Create primitive collections for base layer and nearby tracks
    baseLayerPrimitivesRef.current = new PrimitiveCollection();
    nearbyTracksPrimitivesRef.current = new PrimitiveCollection();
    
    // Add primitive collections to the scene
    viewer.scene.primitives.add(baseLayerPrimitivesRef.current);
    viewer.scene.primitives.add(nearbyTracksPrimitivesRef.current);




    // return () => {
    //   // Clean up primitive collections
    //   if (baseLayerPrimitivesRef?.current && viewer) {
    //     try {
    //       viewer?.scene?.primitives?.remove?.(baseLayerPrimitivesRef.current);
    //     } catch (e) {
    //       console.warn('Failed to remove baseLayerPrimitives:', e);
    //     }
    //     baseLayerPrimitivesRef.current = null;
    //   }
      
    //   if (nearbyTracksPrimitivesRef?.current && viewer) {
    //     try {
    //       viewer?.scene?.primitives?.remove?.(nearbyTracksPrimitivesRef.current);
    //     } catch (e) {
    //       console.warn('Failed to remove nearbyTracksPrimitives:', e);
    //     }
    //     nearbyTracksPrimitivesRef.current = null;
    //   }
    // };
}, [viewer]);

  // Convert GeoJSON features to Primitive instances
  const createLineStringPrimitives = (
    features: any[],
    color: Color,
    width: number,
    primitiveCollection: PrimitiveCollection,
    trackDataMap: Map<string, TrackFeature>
  ) => {
    // Clear any existing primitives
    primitiveCollection.removeAll();
    trackDataMap.clear();

    // Batch features by color for better performance
    const instances: GeometryInstance[] = [];
    
    features.forEach(feature => {
      const trackId = feature.id || `track-${Math.random().toString(36).substring(2, 11)}`;
      
      // Store the track data
      trackDataMap.set(trackId, {
        id: trackId,
        properties: feature.properties,
        geometry: feature.geometry,
        highlighted: false
      });

      // Process geometry - only handle LineString for now
      if (feature.geometry.type === 'LineString') {
        const positions: Cartesian3[] = [];
        
        feature.geometry.coordinates.forEach((coord: number[]) => {
          positions.push(Cartesian3.fromDegrees(coord[0], coord[1]));
        });

        if (positions.length > 1) {
          instances.push(new GeometryInstance({
            geometry: new PolylineGeometry({
              positions: positions,
              width: width,
              vertexFormat: PolylineColorAppearance.VERTEX_FORMAT,
              arcType: Cesium.ArcType.GEODESIC
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
            },
            id: trackId
          }));
        }
      }
      // Add support for MultiLineString if needed
      else if (feature.geometry.type === 'MultiLineString') {
        feature.geometry.coordinates.forEach((lineCoords: number[][]) => {
          const positions: Cartesian3[] = [];
          
          lineCoords.forEach((coord: number[]) => {
            positions.push(Cartesian3.fromDegrees(coord[0], coord[1]));
          });

          if (positions.length > 1) {
            instances.push(new GeometryInstance({
              geometry: new PolylineGeometry({
                positions: positions,
                width: width,
                vertexFormat: PolylineColorAppearance.VERTEX_FORMAT,
                arcType: Cesium.ArcType.GEODESIC
              }),
              attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
              },
              id: trackId
            }));
          }
        });
      }
    });

    // Create a single primitive with all instances for better performance
    if (instances.length > 0) {
      const primitive = new Primitive({
        geometryInstances: instances,
        appearance: new PolylineColorAppearance({
          translucent: false
        }),
        asynchronous: true
      });

      primitiveCollection.add(primitive);
      
      return primitive;
    }

    return null;
  };

  // Setup click handling - this is more complex with primitives
  useEffect(() => {
    if (!viewer) return;

    // Create a new handler for screen space events
    const handler = new ScreenSpaceEventHandler(viewer.canvas);
    clickHandlerRef.current = handler;

    // Add the click event handler
    handler.setInputAction((movement: any) => {
      // Get the picked primitive
      const pickedObject = viewer.scene.pick(movement.position);
      
      // Reset previous highlighting
      resetHighlighting();

      if (pickedObject) {
        const pickedId = pickedObject.id;
        
        // Try to find the track in our data maps
        let trackFeature: TrackFeature | undefined;
        let dataSource = 'unknown';
        
        if (baseTracksDataRef.current.has(pickedId)) {
          trackFeature = baseTracksDataRef.current.get(pickedId);
          dataSource = 'base';
        } else if (nearbyTracksDataRef.current.has(pickedId)) {
          trackFeature = nearbyTracksDataRef.current.get(pickedId);
          dataSource = 'nearby';
        }

        if (trackFeature) {
          
          // Store the track id for reference
          highlightedTrackIdRef.current = pickedId;
          setSelectedTrackId(pickedId);
          
          // Highlight the track - we'll need to recreate the primitive with a different color
          highlightTrack(pickedId, dataSource);
          
          // Extract and display track information
          handleTrackDetail(trackFeature, dataSource);
        } else {
          // No track was selected
          setSelectedTrack(null);
          setShowDetails(false);
          setSelectedTrackId(null);
        }
      } else {
        // No object was picked
        setSelectedTrack(null);
        setShowDetails(false);
        setSelectedTrackId(null);
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      if (handler) {
        handler.destroy();
        clickHandlerRef.current = null;
      }
    };
  }, [viewer]);

  // Highlight a track by creating a new primitive with the highlight color
  const highlightTrack = (trackId: string, dataSource: string) => {
    // First remove any existing highlight
    resetHighlighting();
    
    const tracksDataMap = dataSource === 'base' ? baseTracksDataRef.current : nearbyTracksDataRef.current;
    const trackFeature = tracksDataMap.get(trackId);
    
    if (!trackFeature || !viewer) return;
    
    // Mark the track as highlighted
    trackFeature.highlighted = true;
    
    // Get the feature geometry
    const geometry = trackFeature.geometry;
    
    if (geometry.type === 'LineString') {
      const positions: Cartesian3[] = [];
      
      geometry.coordinates.forEach((coord: number[]) => {
        positions.push(Cartesian3.fromDegrees(coord[0], coord[1]));
      });

      if (positions.length > 1) {
        const instance = new GeometryInstance({
          geometry: new PolylineGeometry({
            positions: positions,
            width: 4, // Slightly wider than normal
            vertexFormat: PolylineColorAppearance.VERTEX_FORMAT,
            arcType: Cesium.ArcType.GEODESIC
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(HIGHLIGHT_COLOR)
          },
          id: trackId
        });
        
        const highlightPrimitive = new Primitive({
          geometryInstances: instance,
          appearance: new PolylineColorAppearance({
            translucent: false
          }),
          asynchronous: false // Make this sync for immediate feedback
        });
        
        // Add to the scene and store reference
        viewer.scene.primitives.add(highlightPrimitive);
        highlightedPrimitiveRef.current = highlightPrimitive;
      }
    }
    // Handle MultiLineString if needed
    else if (geometry.type === 'MultiLineString') {
      const instances: GeometryInstance[] = [];
      
      geometry.coordinates.forEach((lineCoords: number[][]) => {
        const positions: Cartesian3[] = [];
        
        lineCoords.forEach((coord: number[]) => {
          positions.push(Cartesian3.fromDegrees(coord[0], coord[1]));
        });

        if (positions.length > 1) {
          instances.push(new GeometryInstance({
            geometry: new PolylineGeometry({
              positions: positions,
              width: 4,
              vertexFormat: PolylineColorAppearance.VERTEX_FORMAT,
              arcType: Cesium.ArcType.GEODESIC
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(HIGHLIGHT_COLOR)
            },
            id: trackId
          }));
        }
      });
      
      if (instances.length > 0) {
        const highlightPrimitive = new Primitive({
          geometryInstances: instances,
          appearance: new PolylineColorAppearance({
            translucent: false
          }),
          asynchronous: false
        });
        
        viewer.scene.primitives.add(highlightPrimitive);
        highlightedPrimitiveRef.current = highlightPrimitive;
      }
    }
  };

  // Reset highlighting by removing the highlight primitive
  const resetHighlighting = () => {
    if (!viewer) return;
    
    if (highlightedPrimitiveRef.current) {
      if (viewer) {
        viewer.scene.primitives.remove(highlightedPrimitiveRef.current);
      highlightedPrimitiveRef.current = null;
      }
      
    }
    
    // Reset highlighted state in data maps
    if (highlightedTrackIdRef.current) {
      const baseTrack = baseTracksDataRef.current.get(highlightedTrackIdRef.current);
      if (baseTrack) baseTrack.highlighted = false;
      
      const nearbyTrack = nearbyTracksDataRef.current.get(highlightedTrackIdRef.current);
      if (nearbyTrack) nearbyTrack.highlighted = false;
      
      highlightedTrackIdRef.current = null;
    }
  };

  // Setup view change monitoring to load nearby tracks when zoomed in
  useEffect(() => {
    if (!viewer) return;

    const checkViewportChange = () => {
      if (!viewer ) return;
      // Get current camera position and height
      const cameraPosition = viewer.camera.position;
      const ellipsoid = viewer.scene.globe.ellipsoid;
      const cartographic = ellipsoid.cartesianToCartographic(cameraPosition);
      const height = cartographic.height;

      // Get center of current view
      const centerCartesian = viewer.camera.pickEllipsoid(
        new Cartesian2(viewer.canvas.clientWidth / 2, viewer.canvas.clientHeight / 2)
      );

      // If not looking at Earth or too high, don't load tracks
      if (!centerCartesian || height > ZOOM_THRESHOLD) {
        return;
      }

      // Convert to lat/long
      const centerCartographic = ellipsoid.cartesianToCartographic(centerCartesian);
      const longitude = CesiumMath.toDegrees(centerCartographic.longitude);
      const latitude = CesiumMath.toDegrees(centerCartographic.latitude);

      // Check if we've moved significantly from last loaded viewport
      const isNewArea = !lastLoadedViewport ||
        Cartesian3.distance(centerCartesian, lastLoadedViewport.center) > 10000 ||
        Math.abs(height - lastLoadedViewport.zoom) > ZOOM_THRESHOLD / 4;

      if (isNewArea) {
        Logger.info(`Loading tracks at zoom level ${height.toFixed(0)}m - center: ${longitude.toFixed(4)}, ${latitude.toFixed(4)}`);

        // Update last loaded viewport
        setLastLoadedViewport({
          center: centerCartesian,
          zoom: height
        });

        // Load nearby tracks
        fetchNearbyTracks(longitude, latitude, selectedTrackId);
      }
    };

    // Set up camera move end event
    const viewChangeHandler = () => {
      if (!viewer) return;
      // Clear any existing timeout
      if (viewChangeTimeoutRef.current) {
        clearTimeout(viewChangeTimeoutRef.current);
      }

      // Set a new timeout to check the viewport change after movement stops
      viewChangeTimeoutRef.current = setTimeout(checkViewportChange, VIEW_CHANGE_DEBOUNCE);
    };

    // Add event listener for camera move end
    viewer.camera.moveEnd.addEventListener(viewChangeHandler);

    // Do an initial check when component mounts
    checkViewportChange();

    // return () => {
    //   if (!viewer) return;
    //   // Clean up event listener
    //   viewer?.camera?.moveEnd?.removeEventListener?.(viewChangeHandler);

    //   // Clear any pending timeout
    //   if (viewChangeTimeoutRef.current) {
    //     clearTimeout(viewChangeTimeoutRef.current);
    //   }
    // };
  }, [viewer, lastLoadedViewport, selectedTrackId]);

  // Load the base layer on component mount
  useEffect(() => {
    if (!viewer) return;

    let isComponentMounted = true;

    const loadBaseLayer = async () => {
      try {
        Logger.info(`Loading ${LAYER_INFO.title} base layer`);

        // Determine bounding box
        let bbox = initialBbox;
        if (!bbox) {
          if (viewer.camera) {
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

          // If still no bbox, use the layer's bounding box as fallback
          if (!bbox && LAYER_INFO.boundingBox) {
            bbox = [
              LAYER_INFO.boundingBox.minX,
              LAYER_INFO.boundingBox.minY,
              LAYER_INFO.boundingBox.maxX,
              LAYER_INFO.boundingBox.maxY
            ];
          }
        }

        // Fetch the layer data
        const geoJson = await fetchWfsData(LAYER_INFO, bbox, 1000);

        if (!isComponentMounted) return;

        if (!geoJson.features || geoJson.features.length === 0) {
          Logger.warn(`No features found in the ${LAYER_INFO.title} layer`);
          return;
        }

        Logger.info(`Loaded ${geoJson.features.length} features for ${LAYER_INFO.title}`);

        // Convert GeoJSON to primitives
        if (baseLayerPrimitivesRef.current) {
          createLineStringPrimitives(
            geoJson.features,
            DEFAULT_COLOR,
            2,
            baseLayerPrimitivesRef.current,
            baseTracksDataRef.current
          );
        }

        Logger.info(`${LAYER_INFO.title} layer loaded successfully as primitives`);
      } catch (err) {
        Logger.error(`Error loading ${LAYER_INFO.title} layer:`, err);
      }
    };

    loadBaseLayer();

    return () => {
      isComponentMounted = false; 
    };
  }, [viewer, initialBbox]);

  // Handle track selection
  const handleTrackDetail = (trackFeature: TrackFeature, dataSource: string) => {
    if (!trackFeature) return;
    // Extract track information
    const trackInfo: TrackInfo = {
      id: trackFeature.id || 'unknown',
      name: 'Unknown Track',
      dataSource: dataSource
    };

    const props = trackFeature.properties;
    if (props) {
      // Fast name lookup
      const nameKeys = ['name', 'track_name', 'trail_name', 'title'];
      for (const key of nameKeys) {
        if (props[key] !== undefined) {
          trackInfo.name = props[key];
          break;
        }
      }

      // Optimized property gathering
      const importantKeys = ['length_km', 'track_class', 'description', 'surface', 'status'];
      for (const key of importantKeys) {
        if (props[key] !== undefined) {
          trackInfo[key] = props[key];
        }
      }

      // Then collect other properties
      setTimeout(() => {
        const additionalProps: Record<string, any> = {};
        let hasAdditionalProps = false;

        for (const key in props) {
          if (!trackInfo[key] && props[key] !== undefined &&
            !['id', 'type', 'geometry'].includes(key)) {
            additionalProps[key] = props[key];
            hasAdditionalProps = true;
          }
        }

        // Only update state if we found additional properties
        if (hasAdditionalProps) {
          setSelectedTrack(prev => prev ? { ...prev, ...additionalProps } : null);
        }
      }, 100);
    }

    // Update the track info and show details panel
    setSelectedTrack(trackInfo);
    setShowDetails(true);
  };

  // Fetch tracks near the clicked location
  const fetchNearbyTracks = async (longitude: number, latitude: number, preserveTrackId: string | null = null) => {
    if (!viewer) return;

    try {
      setIsLoading(true);

      // Save the existing selected track data before removing
      let selectedTrackData = null;
      if (preserveTrackId) {
        selectedTrackData = nearbyTracksDataRef.current.get(preserveTrackId) || 
                           baseTracksDataRef.current.get(preserveTrackId);
      }

      // Clear existing nearby tracks primitives
      if (nearbyTracksPrimitivesRef.current) {
        nearbyTracksPrimitivesRef.current.removeAll();
      }
      nearbyTracksDataRef.current.clear();

      // Construct the LINZ API URL
      const radius = 10000; // 10km radius
      const url = `https://data.linz.govt.nz/services/query/v1/vector.json?key=${LINZ_API_KEY}&layer=${LAYER_INFO.id}&x=${longitude}&y=${latitude}&radius=${radius}&geometry=true&with_field_names=true`;

      Logger.info(`Fetching nearby tracks from: ${url}`);

      // Fetch the data
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();

      if (!data.vectorQuery || !data.vectorQuery.layers || !data.vectorQuery.layers[LAYER_INFO.id]) {
        Logger.info('No tracks found near the current viewport.');
        setIsLoading(false);
        return;
      }

      // Extract the correct GeoJSON from the nested structure
      const geoJsonData = data.vectorQuery.layers[LAYER_INFO.id];

      if (!geoJsonData || !geoJsonData.features || geoJsonData.features.length === 0) {
        Logger.info('No tracks found in the response.');
        setIsLoading(false);
        return;
      }

      // Convert GeoJSON to primitives
      if (nearbyTracksPrimitivesRef.current) {
        createLineStringPrimitives(
          geoJsonData.features,
          NEARBY_TRACKS_COLOR,
          3,
          nearbyTracksPrimitivesRef.current,
          nearbyTracksDataRef.current
        );
      }

      Logger.info(`Loaded ${geoJsonData.features.length} nearby tracks as primitives.`);

      // If we were preserving a track selection and it exists in the new data,
      // re-highlight it
      if (preserveTrackId && nearbyTracksDataRef.current.has(preserveTrackId)) {
        highlightTrack(preserveTrackId, 'nearby');
        
        // If the details panel was open, keep it open with updated data
        if (showDetails) {
          const trackFeature = nearbyTracksDataRef.current.get(preserveTrackId);
          if (trackFeature) {
            handleTrackDetail(trackFeature, 'nearby');
          }
        }
      }
      // If the track is no longer in the data but we still have its details,
      // keep the panel open
      else if (preserveTrackId && selectedTrackData && showDetails) {
        Logger.info(`Selected track ${preserveTrackId} not found in new data, but details panel remains open.`);
      }

    } catch (error) {
      Logger.error('Error fetching nearby tracks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render the track details panel if a track is selected
  const renderTrackDetails = () => {
    if (!selectedTrack || !showDetails) return null;

    // Get all non-empty properties from the track
    const propertiesToShow = Object.entries(selectedTrack)
      .filter(([key, value]) => {
        // Filter out empty values and special properties we don't want to show
        return value !== undefined &&
          value !== null &&
          value !== '' &&
          !['id', '__typename', 'geometry', 'type'].includes(key);
      })
      .sort(([keyA], [keyB]) => {
        // Sort properties - put important ones first
        const importantKeys = ['name', 'length_km', 'track_class', 'description'];
        const indexA = importantKeys.indexOf(keyA);
        const indexB = importantKeys.indexOf(keyB);

        if (indexA >= 0 && indexB >= 0) return indexA - indexB;
        if (indexA >= 0) return -1;
        if (indexB >= 0) return 1;
        return keyA.localeCompare(keyB);
      });

    return (
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '15px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        maxWidth: '350px',
        maxHeight: '50vh',
        overflowY: 'auto',
        color: '#333',
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>{selectedTrack.name || 'Unnamed Track'}</h3>

        <div style={{ marginBottom: '10px' }}>
          {propertiesToShow.map(([key, value]) => {
            // Format the key as a label
            const label = key
              .replace(/_/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');

            // Format special values
            let displayValue = value;
            if (key === 'length_km' && !isNaN(parseFloat(value))) {
              displayValue = `${value} km`;
            } else if (typeof value === 'boolean') {
              displayValue = value ? 'Yes' : 'No';
            } else if (value instanceof Date) {
              displayValue = value.toLocaleDateString();
            }

            return (
              <div key={key} style={{ marginBottom: '5px' }}>
                <strong>{label}:</strong> {displayValue}
              </div>
            );
          })}

          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            <strong>Track ID:</strong> {selectedTrack.id}
          </div>
        </div>

        <div style={{ marginTop: '10px', fontSize: '12px', color: '#f00' }}>
          Note: This dataset is not currently being maintained and may include out-of-date information.
        </div>

        <button
          onClick={() => setShowDetails(false)}
          style={{
            marginTop: '10px',
            padding: '5px 10px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    );
  };

  // Render loading indicator
  const renderLoadingIndicator = () => {
    if (!isLoading) return null;

    return (
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        padding: '8px 15px',
        borderRadius: '20px',
        fontWeight: 'bold'
      }}>
        Loading tracks...
      </div>
    );
  };

  // Render attribution
  const renderAttribution = () => {
    return (
      <div style={{
        position: 'absolute',
        bottom: '5px',
        right: '5px',
        zIndex: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: '3px 8px',
        borderRadius: '3px',
        fontSize: '10px',
        maxWidth: '300px'
      }}>
        <a
          href="https://data.linz.govt.nz/layer/52100-nz-walking-and-biking-tracks/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#333', textDecoration: 'none' }}
        >
          Data source: LINZ - NZ Walking and Biking Tracks
        </a>
      </div>
    );
  };

  return (
    <>
      {renderTrackDetails()}
      {renderLoadingIndicator()}
      {/* {renderAttribution()} */}
    </>
  );
};

export default EnhancedLinzLayer;