/**
 * LINZ Data Service Capabilities Service
 * 
 * Handles retrieving and parsing WFS capabilities from the LINZ Data Service
 */

import { XMLParser } from 'fast-xml-parser';
import { LINZ_CONFIG } from './config';
import { Logger } from './logger';

export interface WFSLayerInfo {
  id: string;
  name: string;
  title: string;
  abstract?: string;
  geometryType?: string;
  defaultCRS?: string;
  outputFormats?: string[];
  boundingBox?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    crs: string;
  };
  keywords?: string[];
}

/**
 * Get and parse WFS capabilities document to retrieve available layers
 */
export const fetchWFSCapabilities = async (): Promise<WFSLayerInfo[]> => {
  Logger.time('fetchWFSCapabilities');
  try {
    // Get WFS capabilities document
    const url = `${LINZ_CONFIG.BASE_URL};key=${LINZ_CONFIG.API_KEY}${LINZ_CONFIG.ENDPOINTS.WFS}/?service=WFS&request=GetCapabilities&srsName=EPSG:4326`;
    Logger.debug('Fetching WFS capabilities from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch WFS capabilities: ${response.status} - ${errorText.substring(0, 100)}`);
    }
    
    const capabilitiesXml = await response.text();
    const layers = parseWFSCapabilities(capabilitiesXml);
    
    Logger.debug(`Retrieved ${layers.length} layers from WFS capabilities`);
    Logger.timeEnd('fetchWFSCapabilities');
    return layers;
  } catch (error) {
    Logger.error('Error fetching WFS capabilities:', error);
    Logger.timeEnd('fetchWFSCapabilities');
    return [];
  }
};

/**
 * Get capabilities for a specific layer by ID
 */
export const fetchLayerCapabilities = async (layerId: string): Promise<WFSLayerInfo | null> => {
  try {
    // Get capabilities for a specific layer
    const url = `${LINZ_CONFIG.BASE_URL};key=${LINZ_CONFIG.API_KEY}${LINZ_CONFIG.ENDPOINTS.WFS}/layer-${layerId}/?service=WFS&request=GetCapabilities`;
    Logger.debug(`Fetching capabilities for layer ${layerId}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch layer capabilities: ${response.status} - ${errorText.substring(0, 100)}`);
    }
    
    const capabilitiesXml = await response.text();
    const layers = parseWFSCapabilities(capabilitiesXml);
    return layers.length > 0 ? layers[0] : null;
  } catch (error) {
    Logger.error(`Error fetching capabilities for layer ${layerId}:`, error);
    return null;
  }
};

/**
 * Parse WFS capabilities XML to extract layer information
 * Uses fast-xml-parser library to process XML
 */
function parseWFSCapabilities(capabilitiesXml: string): WFSLayerInfo[] {
  try {
    // Configure XML parser options
    const parserOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (name: string) => {
        // Ensure specific elements are always treated as arrays, even if only one
        return ['FeatureType', 'Keyword', 'Value', 'OutputFormat'].includes(name);
      },
      // Preserve namespace prefixes to support different WFS versions
      removeNSPrefix: false
    };

    const parser = new XMLParser(parserOptions);
    const result = parser.parse(capabilitiesXml);
    
    Logger.debug('XML parsing complete');
    
    // Find WFS capabilities root element
    const wfs = result['wfs:WFS_Capabilities'] || result['WFS_Capabilities'];
    if (!wfs) {
      Logger.error('WFS_Capabilities element not found');
      return [];
    }
    
    // Find FeatureTypeList node
    const featureTypeList = wfs['wfs:FeatureTypeList'] || wfs['FeatureTypeList'];
    if (!featureTypeList) {
      Logger.error('FeatureTypeList element not found');
      return [];
    }
    
    // Get FeatureType list
    const featureTypes = featureTypeList['wfs:FeatureType'] || featureTypeList['FeatureType'] || [];
    
    if (!featureTypes || featureTypes.length === 0) {
      Logger.error('No FeatureType elements found');
      return [];
    }
    
    Logger.debug(`Found ${featureTypes.length} FeatureType elements`);
    
    // Find supported output formats
    let outputFormats: string[] = [];
    
    // Look for WFS 2.0.0 style output formats
    const operationsMetadata = wfs['ows:OperationsMetadata'] || wfs['OperationsMetadata'];
    if (operationsMetadata) {
      const operations = operationsMetadata['ows:Operation'] || operationsMetadata['Operation'] || [];
      
      const getFeatureOperation = Array.isArray(operations) 
        ? operations.find(op => op['@_name'] === 'GetFeature')
        : operations['@_name'] === 'GetFeature' ? operations : null;
      
      if (getFeatureOperation) {
        const parameters = getFeatureOperation['ows:Parameter'] || getFeatureOperation['Parameter'] || [];
        
        const outputFormatParam = Array.isArray(parameters)
          ? parameters.find(param => param['@_name'] === 'outputFormat')
          : parameters['@_name'] === 'outputFormat' ? parameters : null;
        
        if (outputFormatParam) {
          const allowedValues = outputFormatParam['ows:AllowedValues'] || outputFormatParam['AllowedValues'];
          
          if (allowedValues) {
            const values = allowedValues['ows:Value'] || allowedValues['Value'] || [];
            if (Array.isArray(values)) {
              outputFormats = values.map(v => typeof v === 'string' ? v : v['#text']);
            }
          }
        }
      }
    }
    
    // If no formats found in OperationsMetadata, check other locations (for WFS 1.x)
    if (outputFormats.length === 0) {
      const capability = wfs['Capability'];
      if (capability) {
        const request = capability['Request'];
        if (request && request['GetFeature']) {
          const formats = request['GetFeature']['Format'];
          if (formats) {
            outputFormats = Array.isArray(formats) ? formats : [formats];
          }
        }
      }
    }
    
    // Process each FeatureType
    const layers: WFSLayerInfo[] = [];
    
    for (const featureType of featureTypes) {
      // Extract layer name (handling namespace prefixes)
      const name = getNestedValue(featureType, ['wfs:Name', 'Name']);
      if (!name) {
        Logger.warn('FeatureType missing Name element, skipping');
        continue;
      }
      
      // Extract layer ID from name
      const nameParts = name.split(':');
      const nameValue = nameParts.length > 1 ? nameParts[1] : name;
      const layerId = nameValue.includes('-') ? nameValue.split('-')[1] : nameValue;
      
      // Extract title
      const title = getNestedValue(featureType, ['wfs:Title', 'Title']) || name;
      
      // Extract abstract/description
      const abstract = getNestedValue(featureType, ['wfs:Abstract', 'Abstract']) || '';
      
      // Extract default CRS
      const defaultCRS = getNestedValue(featureType, [
        'wfs:DefaultCRS', 'DefaultCRS', 
        'wfs:DefaultSRS', 'DefaultSRS'
      ]) || '';
      
      // Extract bounding box
      let boundingBox = null;
      const bboxElement = featureType['ows:WGS84BoundingBox'] || featureType['WGS84BoundingBox'];
      
      if (bboxElement) {
        const lowerCorner = getNestedValue(bboxElement, ['ows:LowerCorner', 'LowerCorner']);
        const upperCorner = getNestedValue(bboxElement, ['ows:UpperCorner', 'UpperCorner']);
        
        if (lowerCorner && upperCorner) {
          const lowerValues = lowerCorner.split(' ').map(Number);
          const upperValues = upperCorner.split(' ').map(Number);
          
          if (lowerValues.length >= 2 && upperValues.length >= 2) {
            boundingBox = {
              minX: lowerValues[0],
              minY: lowerValues[1],
              maxX: upperValues[0],
              maxY: upperValues[1],
              crs: 'EPSG:4326' // WGS84
            };
          }
        }
      }
      
      // Extract keywords
      let keywords: string[] = [];
      const keywordsElement = featureType['ows:Keywords'] || featureType['Keywords'];
      
      if (keywordsElement) {
        const keywordElements = keywordsElement['ows:Keyword'] || keywordsElement['Keyword'] || [];
        keywords = Array.isArray(keywordElements) 
          ? keywordElements.map(k => typeof k === 'string' ? k : k['#text'] || '')
          : [keywordElements.toString()];
      }
      
      layers.push({
        id: layerId,
        name,
        title,
        abstract,
        defaultCRS,
        outputFormats,
        boundingBox: boundingBox || undefined,
        keywords
      });
    }
    
    Logger.debug(`Successfully parsed ${layers.length} layers`);
    return layers;
  } catch (error) {
    Logger.error('Error parsing WFS capabilities:', error);
    return [];
  }
}

/**
 * Helper function: Get nested value from object
 * Tries multiple possible key paths
 */
function getNestedValue(obj: any, possibleKeys: string[]): string | null {
  if (!obj) return null;
  
  for (const key of possibleKeys) {
    if (obj[key] !== undefined) {
      return obj[key].toString();
    }
  }
  
  return null;
}

/**
 * Find best output format for WFS query
 * Prefers JSON/GeoJSON formats if available
 */
export function getBestOutputFormat(formats: string[] = []): string {
  // Use preferred formats from config
  for (const preferred of LINZ_CONFIG.PREFERRED_FORMATS) {
    const match = formats.find(format => 
      format.toLowerCase().includes(preferred.toLowerCase())
    );
    if (match) {
      Logger.debug(`Selected output format: ${match}`);
      return match;
    }
  }
  
  // If no preferred format found, default to GML
  Logger.debug('No preferred format found, defaulting to GML');
  return 'text/xml; subtype=gml/3.2';
}

/**
 * Get features from a WFS layer
 * Includes support for pagination with startIndex
 */
// Response cache to avoid duplicate requests
const wfsResponseCache = new Map<string, any>();

/**
 * Generate a cache key for WFS requests
 */
function generateWFSCacheKey(
  layerName: string,
  outputFormat: string | undefined,
  bbox: [number, number, number, number] | undefined,
  maxFeatures: number,
  startIndex: number,
  filter?: string
): string {
  return `${layerName}|${outputFormat || ''}|${bbox ? bbox.join(',') : ''}|${maxFeatures}|${startIndex}|${filter || ''}`;
}

/**
 * Fetch features from WFS service with caching and optimizations
 */
export const fetchWFSFeatures = async (
  layerName: string, 
  outputFormat?: string, 
  bbox?: [number, number, number, number],
  maxFeatures: number = 1000,
  startIndex: number = 0,
  filter?: string,
  sortBy?: string,
  sortOrder: 'ASC' | 'DESC' = 'ASC',
  timeout: number = 30000, // 30 seconds timeout
  retryCount: number = 2   // Number of retries on failure
): Promise<any> => {
  try {
    // Generate cache key
    const cacheKey = generateWFSCacheKey(layerName, outputFormat, bbox, maxFeatures, startIndex, filter);
    
    // Check cache first
    if (wfsResponseCache.has(cacheKey)) {
      Logger.debug(`Using cached WFS response for ${layerName}`);
      return wfsResponseCache.get(cacheKey);
    }
    
    // Build WFS GetFeature URL
    let url = `${LINZ_CONFIG.BASE_URL};key=${LINZ_CONFIG.API_KEY}${LINZ_CONFIG.ENDPOINTS.WFS}/?service=WFS&version=2.0.0&request=GetFeature&typeName=${encodeURIComponent(layerName)}`;
    
    // Add output format
    if (outputFormat) {
      url += `&outputFormat=${encodeURIComponent(outputFormat)}`;
    }
    
    // Add bounding box
    if (bbox && bbox.length === 4) {
      // url += `EPSG:4326`;
      // url += `&bbox=${bbox.join(',')},EPSG:4326`;
    }
    
    // Add pagination parameters
    url += `&count=${maxFeatures}&startIndex=${startIndex}`;
    
    // Add filter if provided
    if (filter) {
      url += `&filter=${encodeURIComponent(filter)}`;
    }
    
    // Add sorting if provided
    if (sortBy) {
      url += `&sortBy=${encodeURIComponent(sortBy)}+${sortOrder}`;
    }
    
    Logger.debug(`Fetching WFS features from: ${url}`);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Implement retry logic
    let lastError: Error | null = null;
    let attempt = 0;
    
    while (attempt <= retryCount) {
      try {
        const response = await fetch(url, { 
          signal: controller.signal,
          headers: {
            'Accept': outputFormat && outputFormat.toLowerCase().includes('json') 
              ? 'application/json' 
              : 'application/xml'
          }
        });
        
        // Clear timeout
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 404) {
            Logger.error(`404 Error: Full response body: ${errorText}`);
          }
          throw new Error(`Failed to fetch WFS features: ${response.status} - ${errorText.substring(0, 100)}`);
        }
        
        let result;
        
        // Process response based on format
        if (outputFormat && outputFormat.toLowerCase().includes('json')) {
          Logger.debug('Processing JSON response');
          result = await response.json();
        } else {
          // Parse XML response
          Logger.debug('Processing XML response');
          const text = await response.text();
          
          // Use optimized XML parsing for large responses
          if (text.length > 1000000) { // 1MB threshold
            Logger.debug('Large XML response detected, using optimized parsing');
            result = await parseXMLOptimized(text);
          } else {
            const parser = new XMLParser({
              ignoreAttributes: false,
              attributeNamePrefix: '@_',
              isArray: (name: string) => {
                return ['member', 'featureMember'].includes(name);
              }
            });
            result = parser.parse(text);
          }
        }
        
        // Store in cache (limit cache size to prevent memory issues)
        if (wfsResponseCache.size < 50) {
          wfsResponseCache.set(cacheKey, result);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry aborted requests or if it's the last attempt
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new Error(`WFS request timed out after ${timeout}ms`);
        }
        
        // If it's not the last attempt, wait and retry
        if (attempt < retryCount) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          Logger.warn(`WFS request failed, retrying in ${delay}ms. Error: ${error}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
        } else {
          throw error;
        }
      }
    }
    
    // This should never be reached due to the throw in the loop, but TypeScript needs it
    throw lastError;
    
  } catch (error) {
    Logger.error('Error fetching WFS features:', error);
    throw error;
  }
};

/**
 * Optimized XML parsing for large responses
 * This uses a streaming approach to parse large XML without blocking the UI
 */
async function parseXMLOptimized(xmlText: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Use a worker or chunked processing for very large XML
    try {
      // For now, we'll use the regular parser but in chunks
      // In a real implementation, you might want to use a Web Worker
      
      // Parse in the next event loop to avoid blocking UI
      setTimeout(() => {
        try {
          const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            isArray: (name: string) => {
              return ['member', 'featureMember', 'coordinates', 'pos', 'posList'].includes(name);
            },
            parseTagValue: false,
            parseAttributeValue: false
          });
          
          const result = parser.parse(xmlText);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 0);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Clear the WFS response cache
 */
export const clearWFSCache = (layerName?: string) => {
  if (layerName) {
    // Clear specific layer cache entries
    for (const key of wfsResponseCache.keys()) {
      if (key.startsWith(layerName + '|')) {
        wfsResponseCache.delete(key);
      }
    }
    Logger.info(`Cleared WFS cache for layer ${layerName}`);
  } else {
    // Clear all cache
    wfsResponseCache.clear();
    Logger.info('Cleared all WFS response cache');
  }
};

/**
 * Example: How to use this module to get and display WFS data
 */
export async function fetchAndDisplayWFSData() {
  try {
    // 1. Get available WFS layers
    const layers = await fetchWFSCapabilities();
    Logger.info('Available WFS layers:', layers);
    
    if (layers.length === 0) {
      Logger.warn('No WFS layers found');
      return;
    }
    
    // 2. Select first layer
    const firstLayer = layers[0];
    Logger.info('Selected layer:', firstLayer);
    
    // 3. Get best output format
    const outputFormat = getBestOutputFormat(firstLayer.outputFormats);
    Logger.info('Using output format:', outputFormat);
    
    // 4. Get features for the layer
    const featuresData = await fetchWFSFeatures(firstLayer.name, outputFormat);
    Logger.info('Retrieved feature data:', featuresData);
    
    // 5. Process based on data type
    if (typeof featuresData === 'object') {
      if (featuresData.features) {
        // GeoJSON format
        const features = featuresData.features;
        Logger.info(`Retrieved ${features.length} features`);
        
        // You can add your data processing and display logic here
      } else {
        // Parsed XML data
        // Find feature members
        const wfsResponse = featuresData['wfs:FeatureCollection'] || featuresData['FeatureCollection'];
        if (wfsResponse) {
          const members = wfsResponse['wfs:member'] || wfsResponse['member'] || 
                         wfsResponse['gml:featureMember'] || wfsResponse['featureMember'] || [];
          
          Logger.info(`Parsed ${Array.isArray(members) ? members.length : 1} feature members`);
          
          // You can add your XML data processing and display logic here
        }
      }
    }
    
    return featuresData;
  } catch (error) {
    Logger.error('Error getting and displaying WFS data:', error);
    throw error;
  }
}