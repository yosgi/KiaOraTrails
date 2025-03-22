/**
 * Coordinate Reference System (CRS) transformation utilities
 * 
 * Handle conversion between different coordinate systems,
 * particularly for New Zealand specific projections like NZTM2000 (EPSG:2193)
 */

import { Logger } from './logger';

// Define EPSG codes
export const EPSG_CODES = {
  WGS84: 'EPSG:4326',          // WGS84 - World Geodetic System (Lat/Lon)
  NZTM2000: 'EPSG:2193',       // New Zealand Transverse Mercator 2000
  WEB_MERCATOR: 'EPSG:3857'    // Web Mercator (used by many web maps)
};

// Define URN versions of the CRS codes (used in some services)
export const CRS_URNS = {
  WGS84: 'urn:ogc:def:crs:EPSG::4326',
  NZTM2000: 'urn:ogc:def:crs:EPSG::2193',
  WEB_MERCATOR: 'urn:ogc:def:crs:EPSG::3857'
};

// NZTM2000 projection parameters
const NZTM_PARAMS = {
  a: 6378137.0,           // Semi-major axis
  rf: 298.257222101,      // Inverse flattening
  cm: 173.0,              // Central meridian (degrees East)
  lto: 0.0,               // Latitude of origin (degrees North)
  fe: 1600000.0,          // False easting (metres)
  fn: 10000000.0,         // False northing (metres)
  sf: 0.9996              // Scale factor
};

/**
 * Convert a CRS URN to its EPSG code
 */
export function urnToEpsg(urn: string): string {
  // Remove extra colon if present (some services use double colon)
  const normalizedUrn = urn.replace('::', ':');
  
  if (normalizedUrn.startsWith('urn:ogc:def:crs:EPSG:')) {
    const parts = normalizedUrn.split(':');
    const code = parts[parts.length - 1];
    return `EPSG:${code}`;
  }
  
  return urn; // Return unchanged if not a URN
}

/**
 * Transform coordinates from NZTM2000 to WGS84
 * 
 * @param x Easting coordinate in NZTM2000
 * @param y Northing coordinate in NZTM2000
 * @returns [longitude, latitude] in WGS84
 */
export function nztmToWgs84(x: number, y: number): [number, number] {
  try {
    // Implementation of the transformation from NZTM2000 to WGS84
    // This is a simplified version of the transformation
    
    // Step 1: Adjust for false easting and northing to get local TM coordinates
    const xTM = x - NZTM_PARAMS.fe;
    const yTM = y - NZTM_PARAMS.fn;
    
    // Step 2: Convert to latitude and longitude
    // This is a simplified approach - for production use, consider using a complete library like proj4js
    
    // Approximate inverse Transverse Mercator projection
    const a = NZTM_PARAMS.a;
    const f = 1.0 / NZTM_PARAMS.rf;
    const k0 = NZTM_PARAMS.sf;
    const lambda0 = NZTM_PARAMS.cm * Math.PI / 180.0; // Central meridian in radians
    
    // Semi-minor axis
    const b = a * (1.0 - f);
    
    // Eccentricity
    const e2 = 2 * f - f * f;
    const e4 = e2 * e2;
    const e6 = e4 * e2;
    
    // Rectifying latitude
    const M = yTM / k0;

    // Footprint latitude
    const mu = M / (a * (1 - e2/4 - 3*e4/64 - 5*e6/256));
    
    // Latitude
    const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
    const phi1 = mu + (3*e1/2 - 27*e1*e1*e1/32) * Math.sin(2*mu)
                + (21*e1*e1/16 - 55*e1*e1*e1*e1/32) * Math.sin(4*mu)
                + (151*e1*e1*e1/96) * Math.sin(6*mu);
    
    // Trigonometric functions of the latitude
    const sinPhi1 = Math.sin(phi1);
    const cosPhi1 = Math.cos(phi1);
    const tanPhi1 = sinPhi1 / cosPhi1;
    
    const N1 = a / Math.sqrt(1 - e2 * sinPhi1 * sinPhi1);
    const T1 = tanPhi1 * tanPhi1;
    const C1 = e2 * cosPhi1 * cosPhi1 / (1 - e2);
    const R1 = a * (1 - e2) / Math.pow(1 - e2 * sinPhi1 * sinPhi1, 1.5);
    const D = xTM / (N1 * k0);
    
    // Latitude
    const phi = phi1 - (N1 * tanPhi1 / R1) * (
        D*D/2 - 
        (5 + 3*T1 + 10*C1 - 4*C1*C1 - 9*e2) * D*D*D*D/24 + 
        (61 + 90*T1 + 298*C1 + 45*T1*T1 - 252*e2 - 3*C1*C1) * D*D*D*D*D*D/720
    );
    
    // Longitude
    const lambda = lambda0 + (
        D - 
        (1 + 2*T1 + C1) * D*D*D/6 + 
        (5 - 2*C1 + 28*T1 - 3*C1*C1 + 8*e2 + 24*T1*T1) * D*D*D*D*D/120
    ) / cosPhi1;
    
    // Convert to degrees
    const lat = phi * 180.0 / Math.PI;
    const lon = lambda * 180.0 / Math.PI;
    
    // For production use, it's recommended to use a well-tested library
    // like proj4js instead of this simplified implementation
    
    return [lon, lat];
  } catch (error) {
    Logger.error('Error transforming NZTM2000 to WGS84:', error);
    // Return original coordinates if transformation fails
    Logger.warn(`Using approximate conversion for NZTM coordinates (${x}, ${y})`);
    
    // Very rough approximation for New Zealand
    // This is a fallback only and should not be used for accurate work
    const approxLon = (x - 1600000) / 90000 + 173;
    const approxLat = -1 * ((y - 10000000) / 111000 + 41);
    
    return [approxLon, approxLat];
  }
}

/**
 * Transform a GeoJSON object from one CRS to another
 * 
 * @param geoJson The GeoJSON object to transform
 * @param sourceCrs The source CRS (if not specified in the GeoJSON)
 * @param targetCrs The target CRS (default is WGS84)
 * @returns Transformed GeoJSON
 */
export function transformGeoJson(
  geoJson: any, 
  sourceCrs?: string, 
  targetCrs: string = EPSG_CODES.WGS84
): any {
  try {
    // If no GeoJSON, return as is
    if (!geoJson) {
      return geoJson;
    }
    
    // Make a deep copy to avoid modifying the original
    const result = JSON.parse(JSON.stringify(geoJson));
    
    // Get CRS from GeoJSON if available
    let crs = sourceCrs || 'EPSG:4326';  // Default to WGS84
    
    if (geoJson.crs && geoJson.crs.properties && geoJson.crs.properties.name) {
      crs = geoJson.crs.properties.name;
    }
    
    // Convert URN to EPSG code if needed
    if (crs.startsWith('urn:')) {
      crs = urnToEpsg(crs);
    }
    
    // No transformation needed if source and target are the same
    if (crs === targetCrs) {
      return result;
    }
    
    Logger.info(`Transforming GeoJSON from ${crs} to ${targetCrs}`);
    
    // Set the output CRS
    result.crs = {
      type: 'name',
      properties: {
        name: targetCrs
      }
    };
    
    // Transform coordinates in features
    if (result.features && Array.isArray(result.features)) {
      for (const feature of result.features) {
        if (feature.geometry) {
          transformGeometry(feature.geometry, crs, targetCrs);
        }
      }
    } else if (result.geometry) {
      // Single feature case
      transformGeometry(result.geometry, crs, targetCrs);
    }
    
    return result;
  } catch (error) {
    Logger.error('Error transforming GeoJSON:', error);
    return geoJson; // Return original if transformation fails
  }
}

/**
 * Transform a geometry object's coordinates
 */
function transformGeometry(geometry: any, sourceCrs: string, targetCrs: string): void {
  if (!geometry || !geometry.type) {
    return;
  }
  
  switch (geometry.type) {
    case 'Point':
      geometry.coordinates = transformPoint(geometry.coordinates, sourceCrs, targetCrs);
      break;
      
    case 'LineString':
    case 'MultiPoint':
      geometry.coordinates = geometry.coordinates.map((point: number[]) => 
        transformPoint(point, sourceCrs, targetCrs)
      );
      break;
      
    case 'Polygon':
    case 'MultiLineString':
      geometry.coordinates = geometry.coordinates.map((ring: number[][]) => 
        ring.map((point: number[]) => transformPoint(point, sourceCrs, targetCrs))
      );
      break;
      
    case 'MultiPolygon':
      geometry.coordinates = geometry.coordinates.map((polygon: number[][][]) => 
        polygon.map((ring: number[][]) => 
          ring.map((point: number[]) => transformPoint(point, sourceCrs, targetCrs))
        )
      );
      break;
      
    case 'GeometryCollection':
      if (geometry.geometries && Array.isArray(geometry.geometries)) {
        for (const geom of geometry.geometries) {
          transformGeometry(geom, sourceCrs, targetCrs);
        }
      }
      break;
  }
}

/**
 * Transform a single point's coordinates
 */
function transformPoint(point: number[], sourceCrs: string, targetCrs: string): number[] {
  // Currently only support NZTM2000 to WGS84
  if (sourceCrs === EPSG_CODES.NZTM2000 && targetCrs === EPSG_CODES.WGS84) {
    return nztmToWgs84(point[0], point[1]);
  } 
  
  // For now, other transformations are not supported
  // In a real application, use a library like proj4js for more transformations
  
  // Return unchanged if transformation not supported
  Logger.warn(`Transformation from ${sourceCrs} to ${targetCrs} not supported`);
  return point;
}

/**
 * Detect CRS from a GeoJSON object or from feature properties
 */
export function detectCrs(geoJson: any): string {
  // Try to get CRS from the GeoJSON object itself
  if (geoJson.crs && geoJson.crs.properties && geoJson.crs.properties.name) {
    const crsName = geoJson.crs.properties.name;
    // Convert URN to EPSG code if needed
    if (crsName.startsWith('urn:')) {
      return urnToEpsg(crsName);
    }
    return crsName;
  }
  
  // Try to detect from feature properties or geometry
  if (geoJson.features && geoJson.features.length > 0) {
    const feature = geoJson.features[0];
    
    // Some services include CRS in properties
    if (feature.properties) {
      if (feature.properties.crs) {
        return feature.properties.crs;
      }
      
      // Look for SRID or SRS fields
      if (feature.properties.srid) {
        return `EPSG:${feature.properties.srid}`;
      }
      if (feature.properties.srs) {
        return feature.properties.srs;
      }
    }
    
    // Try to detect by examining coordinate values
    // This is a rough heuristic and might not always work
    if (feature.geometry && feature.geometry.coordinates) {
      const coords = getFirstCoordinate(feature.geometry);
      if (coords) {
        // NZTM2000 coordinates for New Zealand are typically:
        // Easting: around 1,000,000 to 2,100,000
        // Northing: around 4,700,000 to 6,200,000
        if (coords[0] > 900000 && coords[0] < 2200000 && 
            coords[1] > 4600000 && coords[1] < 6300000) {
          return EPSG_CODES.NZTM2000;
        }
        
        // WGS84 (EPSG:4326) coordinates are in degrees
        // Longitude: -180 to 180, Latitude: -90 to 90
        if (coords[0] >= -180 && coords[0] <= 180 && 
            coords[1] >= -90 && coords[1] <= 90) {
          return EPSG_CODES.WGS84;
        }
      }
    }
  }
  
  // Default to WGS84 if unable to detect
  return EPSG_CODES.WGS84;
}

/**
 * Get the first coordinate from a geometry
 */
function getFirstCoordinate(geometry: any): number[] | null {
  if (!geometry || !geometry.type) {
    return null;
  }
  
  switch (geometry.type) {
    case 'Point':
      return geometry.coordinates;
      
    case 'LineString':
    case 'MultiPoint':
      return geometry.coordinates[0];
      
    case 'Polygon':
    case 'MultiLineString':
      return geometry.coordinates[0][0];
      
    case 'MultiPolygon':
      return geometry.coordinates[0][0][0];
      
    case 'GeometryCollection':
      if (geometry.geometries && geometry.geometries.length > 0) {
        return getFirstCoordinate(geometry.geometries[0]);
      }
      break;
  }
  
  return null;
}