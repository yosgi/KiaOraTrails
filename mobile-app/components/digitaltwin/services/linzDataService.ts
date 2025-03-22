import { Color, GeoJsonDataSource, ColorMaterialProperty, ConstantProperty } from 'cesium';
import { XMLParser } from 'fast-xml-parser';
import { 
  fetchWFSCapabilities, 
  fetchLayerCapabilities,
  getBestOutputFormat,
  WFSLayerInfo,
  fetchWFSFeatures
} from './linzCapabilitiesService';
import { LINZ_CONFIG } from './config';
import { Logger } from './logger';
import GeometryUtils from './geometryUtils';
import { transformGeoJson, detectCrs } from './crsTransformer';

// Interface for our layer info with UI properties
export interface LinzLayerInfo extends WFSLayerInfo {
  color: Color;
  visible: boolean;
  shortAbstract?: string;         // Short version of abstract for UI display
  description?: string;           // Human-readable description
  
  // State properties
  isLoading?: boolean;            // Whether the layer is currently loading
  loadError?: string;             // Error message if loading failed
  featureCount?: number;          // Number of features in the layer
  lastUpdated?: Date;             // When the layer was last updated
  
  // Styling properties
  highlightColor?: Color;         // Color to use for highlighted features
  lineWidth?: number;             // Width of lines in pixels
  fillOpacity?: number;           // Opacity for filled polygons (0-1)
  
  // Interaction properties
  selectable?: boolean;           // Whether features can be selected
  clickable?: boolean;            // Whether features respond to clicks
  hoverable?: boolean;            // Whether features respond to hover
  
  // Feature filtering
  filter?: {
    property: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like';
    value: string | number | boolean;
  }[];
  
  // Custom metadata
  metadata?: Record<string, any>; // For application-specific needs
}

// Single default layer configuration
export const DEFAULT_LAYER: LinzLayerInfo = {
  id: '52100',
  name: 'NZ Walking and Biking Tracks',
  title: 'NZ Walking and Biking Tracks',
  color: Color.BLUE.withAlpha(0.7),
  visible: true,
  outputFormats: [],
  shortAbstract: "This dataset is not currently being maintained and includes some track information that is out-of-date.",
  description: "The NZ Tracks data identifies walking and biking tracks across New Zealand.",
  lineWidth: 2,
  fillOpacity: 0.3,
  highlightColor: Color.YELLOW,
  selectable: true,
  clickable: true,
  hoverable: true
};

// Cache for layer information to avoid redundant API calls
const layerInfoCache = new Map<string, LinzLayerInfo>();
const geoJsonCache = new Map<string, GeoJsonFeatureCollection>();

/**
 * Generate a cache key based on layer and bbox
 */
function generateCacheKey(layerId: string, bbox?: [number, number, number, number]): string {
  if (!bbox) return layerId;
  return `${layerId}:${bbox.join(',')}`;
}

/**
 * Loads layer information from the WFS capabilities with caching
 */
export const loadLayerInfo = async (): Promise<LinzLayerInfo> => {
  // Check if we already have this layer info cached
  if (layerInfoCache.has(DEFAULT_LAYER.id)) {
    Logger.info(`Using cached layer info for ${DEFAULT_LAYER.id}`);
    return layerInfoCache.get(DEFAULT_LAYER.id)!;
  }

  try {
    // Get available layers from WFS capabilities
    Logger.info('Loading LINZ layer information from WFS capabilities');
    const wfsLayers = await fetchWFSCapabilities();
    
    // Find our target layer in WFS capabilities
    const wfsLayer = wfsLayers.find(l => l.id === DEFAULT_LAYER.id);
    
    let layerInfo: LinzLayerInfo;
    
    if (wfsLayer) {
      // Merge WFS information with our default configuration
      layerInfo = {
        ...wfsLayer,
        color: DEFAULT_LAYER.color,
        visible: true
      };
    } else {
      // Layer not found in WFS, use our default data
      Logger.warn(`Layer ${DEFAULT_LAYER.id} not found in WFS capabilities, using default configuration`);
      layerInfo = DEFAULT_LAYER;
    }
    
    // Cache the result
    layerInfoCache.set(DEFAULT_LAYER.id, layerInfo);
    
    return layerInfo;
  } catch (error) {
    // Fall back to default layer if WFS loading fails
    Logger.error('Error loading layer info:', error);
    Logger.warn('Falling back to default layer configuration');
    
    // Cache the default to avoid future failures
    layerInfoCache.set(DEFAULT_LAYER.id, DEFAULT_LAYER);
    
    return DEFAULT_LAYER;
  }
};

/**
 * Fetch data using WFS with the appropriate output format and caching
 */
export const fetchWfsData = async (
  layerInfo: any,
  bbox?: [number, number, number, number], // [minLon, minLat, maxLon, maxLat]
  maxFeatures: number = 5000
): Promise<GeoJsonFeatureCollection> => {
  // Generate cache key
  const cacheKey = generateCacheKey(layerInfo.id, bbox);
  
  // Check if we already have this data cached
  if (geoJsonCache.has(cacheKey)) {
    Logger.info(`Using cached GeoJSON for ${cacheKey}`);
    return geoJsonCache.get(cacheKey)!;
  }
  
  try {
    // If we don't have output formats info yet, get it from layer capabilities or cache
    if (!layerInfo.outputFormats || layerInfo.outputFormats.length === 0) {
      // Check if we have cached layer info with output formats
      const cachedLayerInfo = layerInfoCache.get(layerInfo.id);
      
      if (cachedLayerInfo && cachedLayerInfo.outputFormats && cachedLayerInfo.outputFormats.length > 0) {
        layerInfo.outputFormats = cachedLayerInfo.outputFormats;
      } else {
        Logger.info(`No output formats available for layer ${layerInfo.id}, fetching capabilities`);
        const detailedInfo = await fetchLayerCapabilities(layerInfo.id);
        if (detailedInfo && detailedInfo.outputFormats) {
          layerInfo.outputFormats = detailedInfo.outputFormats;
          
          // Update cache with the more detailed layer info
          if (cachedLayerInfo) {
            const updatedLayerInfo = { ...cachedLayerInfo, outputFormats: detailedInfo.outputFormats };
            layerInfoCache.set(layerInfo.id, updatedLayerInfo);
          }
        }
      }
    }
    
    // Determine the best output format - prefer JSON for faster processing
    const outputFormat = getBestOutputFormat(layerInfo.outputFormats);
    const isJsonFormat = outputFormat.toLowerCase().includes('json');
    
    Logger.info(`Fetching WFS data for layer: ${layerInfo.name} (${layerInfo.id})`);
    Logger.info(`Using output format: ${outputFormat}`);
    
    // Get the layer name with namespace if present
    const layerName = layerInfo.name; // This should include any namespace prefix
    
    // Use the fetchWFSFeatures function from linzCapabilitiesService
    const featuresData = await fetchWFSFeatures(
      layerName,
      outputFormat,
      bbox,
      maxFeatures
    );
    
    let geoJson: GeoJsonFeatureCollection;
    
    // Process based on format - optimized for performance
    if (isJsonFormat || (featuresData && featuresData.type === 'FeatureCollection')) {
      // For JSON data, convert to GeoJSON if needed
      if (featuresData.type === 'FeatureCollection') {
        // Already in GeoJSON format
        // Check for CRS and transform if needed
        geoJson = transformGeoJson(featuresData);
      } else {
        // Convert to GeoJSON
        const tempGeoJson = convertToGeoJson(featuresData, layerInfo.id);
        // Transform coordinates if needed
        geoJson = transformGeoJson(tempGeoJson);
      }
    } else if (typeof featuresData === 'string') {
      // XML data (as string) - convert to GeoJSON
      const tempGeoJson = convertGmlToGeoJson(featuresData, layerInfo.id);
      // Transform coordinates if needed
      geoJson = transformGeoJson(tempGeoJson);
    } else {
      // Already parsed XML - convert to GeoJSON
      const tempGeoJson = convertToGeoJson(featuresData, layerInfo.id);
      // Transform coordinates if needed
      geoJson = transformGeoJson(tempGeoJson);
    }
    
    // Cache the result
    geoJsonCache.set(cacheKey, geoJson);
    
    return geoJson;
  } catch (error) {
    Logger.error('Error fetching WFS data:', error);
    throw error;
  }
};

/**
 * Clear the cache for a specific layer or all layers
 */
export const clearCache = (layerId?: string) => {
  if (layerId) {
    // Clear specific layer cache
    layerInfoCache.delete(layerId);
    
    // Clear any GeoJSON cache entries for this layer
    for (const key of geoJsonCache.keys()) {
      if (key.startsWith(layerId)) {
        geoJsonCache.delete(key);
      }
    }
    
    Logger.info(`Cleared cache for layer ${layerId}`);
  } else {
    // Clear all caches
    layerInfoCache.clear();
    geoJsonCache.clear();
    Logger.info('Cleared all layer and GeoJSON caches');
  }
};

/**
 * GeoJSON type definitions
 */
interface GeoJsonGeometry {
  type: string;
  coordinates: any;
}

interface GeoJsonFeature {
  type: string;
  properties: Record<string, any>;
  geometry: GeoJsonGeometry | null;
  id?: string | number;
}

interface GeoJsonFeatureCollection {
  type: string;
  features: GeoJsonFeature[];
}

/**
 * Convert any object data to GeoJSON - optimized version
 */
function convertToGeoJson(data: any, layerId: string): GeoJsonFeatureCollection {
  // Create a GeoJSON feature collection
  const geoJson = GeometryUtils.createEmptyFeatureCollection() as GeoJsonFeatureCollection;
  
  // Try to find features in the data structure
  let features: any[] = [];
  
  if (data.features) {
    // Already has features array
    features = data.features;
  } else if (data.wfs && data.wfs.FeatureCollection && data.wfs.FeatureCollection.member) {
    // WFS structure
    features = Array.isArray(data.wfs.FeatureCollection.member) 
      ? data.wfs.FeatureCollection.member 
      : [data.wfs.FeatureCollection.member];
  } else {
    // Try to find any arrays that might contain features
    for (const key in data) {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        features = data[key];
        break;
      }
    }
  }
  
  // Optimize: Pre-allocate array size if possible
  geoJson.features = [];
  
  if (features.length > 0) {
    // Process features in batches for better performance
    const BATCH_SIZE = 100;
    
    for (let i = 0; i < features.length; i += BATCH_SIZE) {
      const batch = features.slice(i, i + BATCH_SIZE);
      
      // Process each feature in the batch
      for (const feature of batch) {
        const geoJsonFeature: GeoJsonFeature = {
          type: "Feature",
          properties: {},
          geometry: null
        };
        
        // Extract properties and geometry
        for (const key in feature) {
          if (key === 'geometry' || key.includes('geom') || key.includes('shape')) {
            geoJsonFeature.geometry = processGeometry(feature[key]) as GeoJsonGeometry;
          } else if (key !== 'type' && key !== 'id') {
            geoJsonFeature.properties[key] = feature[key];
          }
        }
        
        // Add feature ID if available
        if ('id' in feature && feature.id !== undefined) {
          geoJsonFeature.id = feature.id;
        }
        
        // Only add features with geometry
        if (geoJsonFeature.geometry) {
          geoJson.features.push(geoJsonFeature);
        }
      }
      
      // Allow UI thread to process in between batches
      if (i + BATCH_SIZE < features.length) {
         new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  }
  
  Logger.info(`Converted ${geoJson.features.length} features to GeoJSON`);
  return geoJson;
}

/**
 * Process geometry object into valid GeoJSON geometry
 */
function processGeometry(geometry: any): any {
  if (!geometry) return null;
  
  // If already in GeoJSON format
  if (geometry.type && geometry.coordinates) {
    return geometry;
  }
  
  // Otherwise extract geometry information
  if (geometry.Point) {
    return GeometryUtils.createPointGeometry(geometry.Point);
  } else if (geometry.LineString) {
    return GeometryUtils.createLineStringGeometry(geometry.LineString);
  } else if (geometry.Polygon) {
    return GeometryUtils.createPolygonGeometry(geometry.Polygon);
  }
  
  return null;
}

/**
 * Convert GML (XML) to GeoJSON using fast-xml-parser - optimized version
 */
export const convertGmlToGeoJson = async (gmlString: string, layerId: string): Promise<GeoJsonFeatureCollection> => {
  try {
    // Create GeoJSON structure
    const geoJson = GeometryUtils.createEmptyFeatureCollection() as GeoJsonFeatureCollection;
    
    // Configure parser
    const parserOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (name: string) => {
        // Make sure certain elements are always treated as arrays
        return ['member', 'featureMember', 'coordinates', 'pos', 'posList', 'Point', 'LineString', 'Polygon'].includes(name);
      },
      removeNSPrefix: true // Remove namespace prefixes for easier processing
    };
    
    // Parse XML
    const parser = new XMLParser(parserOptions);
    const result = parser.parse(gmlString);
    
    // Find the FeatureCollection or similar root element
    const featureCollection = result.FeatureCollection || result.GML_FeatureCollection;
    if (!featureCollection) {
      Logger.warn('No FeatureCollection found in GML');
      return geoJson;
    }
    
    // Find features (members or featureMembers)
    let features: any[] = [];
    if (featureCollection.member) {
      features = featureCollection.member;
    } else if (featureCollection.featureMember) {
      features = featureCollection.featureMember;
    } else {
      // Try to find the layer directly
      const layerTag = `layer-${layerId}`;
      if (featureCollection[layerTag]) {
        features = Array.isArray(featureCollection[layerTag]) 
          ? featureCollection[layerTag] 
          : [featureCollection[layerTag]];
      }
    }
    
    if (!features || features.length === 0) {
      Logger.warn('No features found in GML');
      return geoJson;
    }
    
    // Process features in batches for better performance
    const BATCH_SIZE = 100;
    geoJson.features = [];
    
    for (let i = 0; i < features.length; i += BATCH_SIZE) {
      const batch = features.slice(i, i + BATCH_SIZE);
      
      // Process each feature in the batch
      for (const feature of batch) {
        // Create a GeoJSON feature
        const geoJsonFeature: GeoJsonFeature = {
          type: "Feature",
          properties: {},
          geometry: null
        };
        
        // Find the actual feature content (might be nested)
        let featureContent = feature;
        
        // If feature contains a specific layer element, use that
        const layerTag = `layer-${layerId}`;
        if (feature[layerTag]) {
          featureContent = feature[layerTag];
        }
        
        // Extract feature ID if available
        if (('@_id' in feature && feature['@_id']) || ('@_gml:id' in feature && feature['@_gml:id'])) {
          geoJsonFeature.id = feature['@_id'] || feature['@_gml:id'];
        }
        
        // Process each property in the feature
        for (const key in featureContent) {
          // Skip attributes and nested objects
          if (key.startsWith('@_') || featureContent[key] === null || 
              typeof featureContent[key] === 'object') {
            continue;
          }
          
          // Add as a property
          geoJsonFeature.properties[key] = featureContent[key];
        }
        
        // Extract geometry
        geoJsonFeature.geometry = extractGeometryFromFeature(featureContent) as GeoJsonGeometry;
        
        // Only add features with geometry
        if (geoJsonFeature.geometry) {
          geoJson.features.push(geoJsonFeature);
        }
      }
      
      // Allow UI thread to process in between batches
      if (i + BATCH_SIZE < features.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    Logger.info(`Converted ${geoJson.features.length} features from GML to GeoJSON`);
    return geoJson;
  } catch (error) {
    Logger.error('Error converting GML to GeoJSON:', error);
    // Return an empty GeoJSON feature collection
    return GeometryUtils.createEmptyFeatureCollection() as GeoJsonFeatureCollection;
  }
};

/**
 * Extract geometry from a parsed feature - cached version for performance
 */
const geometryCache = new Map<string, any>();

function extractGeometryFromFeature(feature: any): any {
  // Generate a cache key for the feature (using stringified structure)
  const featureKey = JSON.stringify(feature);
  
  // Check cache first
  if (geometryCache.has(featureKey)) {
    return geometryCache.get(featureKey);
  }
  
  // Look for common geometry properties
  const geometryProperties = [
    'geometry', 'Shape', 'the_geom', 'geom', 
    'Point', 'LineString', 'Polygon', 'MultiPoint', 
    'MultiLineString', 'MultiPolygon', 'MultiSurface', 'MultiCurve'
  ];
  
  // Find geometry property
  let geometryProp = null;
  let geometryType = null;
  
  for (const prop of geometryProperties) {
    if (feature[prop]) {
      geometryProp = feature[prop];
      geometryType = prop;
      break;
    }
  }
  
  // If not found directly, look in child properties
  if (!geometryProp) {
    for (const key in feature) {
      if (typeof feature[key] === 'object' && feature[key] !== null) {
        // Check if this property contains a geometry
        for (const geomProp of geometryProperties) {
          if (feature[key][geomProp]) {
            geometryProp = feature[key][geomProp];
            geometryType = geomProp;
            break;
          }
        }
        
        if (geometryProp) break;
      }
    }
  }
  
  // Process based on geometry type
  if (!geometryProp || !geometryType) {
    return null;
  }
  
  try {
    let geometry;
    
    // Use GeometryUtils to create appropriate geometry
    switch (geometryType) {
      case 'Point':
        geometry = GeometryUtils.createPointGeometry(geometryProp);
        break;
      
      case 'LineString':
      case 'MultiCurve':
        geometry = GeometryUtils.createLineStringGeometry(geometryProp);
        break;
      
      case 'Polygon':
      case 'MultiSurface':
        geometry = GeometryUtils.createPolygonGeometry(geometryProp);
        break;
      
      default:
        // Check for nested geometries
        for (const geomType of ['Point', 'LineString', 'Polygon']) {
          if (geometryProp[geomType]) {
            geometry = extractGeometryFromFeature({ [geomType]: geometryProp[geomType] });
            break;
          }
        }
    }
    
    // Cache the result (limit cache size to prevent memory issues)
    if (geometry && geometryCache.size < 1000) {
      geometryCache.set(featureKey, geometry);
    }
    
    return geometry;
  } catch (error) {
    Logger.error('Error extracting geometry:', error);
  }
  
  return null;
}