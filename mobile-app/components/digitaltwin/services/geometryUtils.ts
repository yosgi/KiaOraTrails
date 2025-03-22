/**
 * Utility functions for handling geometry operations
 * 
 * Consolidates geometry parsing and transformation functions
 * to reduce duplication across the application
 */
import { Logger } from './logger';

export const GeometryUtils = {
  /**
   * Parse coordinate string to array of numbers
   */
  parseCoordinates(coordString: string | any): number[] {
    if (!coordString) return [];
    
    // Handle string or object with #text property
    const text = typeof coordString === 'string' 
      ? coordString 
      : (coordString['#text'] || '');
    
    // Split by spaces or commas and convert to numbers
    return text.trim().split(/[\s,]+/).map(Number);
  },
  
  /**
   * Parse coordinate string into an array of coordinate pairs
   */
  parseCoordinatesArray(coordsString: string | any, stride: number = 2): number[][] {
    const flatCoords = this.parseCoordinates(coordsString);
    const pairs = [];
    
    for (let i = 0; i < flatCoords.length; i += stride) {
      if (i + stride <= flatCoords.length) {
        const pair = flatCoords.slice(i, i + stride);
        pairs.push(pair);
      }
    }
    
    return pairs;
  },
  
  /**
   * Convert any coordinate system to [lon, lat] format
   * GeoJSON uses [longitude, latitude] order
   */
  toGeoJSONCoord(coord: number[]): number[] {
    if (coord.length < 2) {
      Logger.warn('Invalid coordinate with less than 2 values', coord);
      return [0, 0];
    }
    
    // Most GIS systems use [lat, lon] so we need to swap
    return [coord[1], coord[0]];
  },
  
  /**
   * Extract a point geometry from parsed GML
   */
  createPointGeometry(point: any): any {
    try {
      // Check for coordinates in different formats
      if (point.pos) {
        const coords = this.parseCoordinates(point.pos);
        if (coords && coords.length >= 2) {
          return {
            type: 'Point',
            coordinates: this.toGeoJSONCoord(coords)
          };
        }
      } else if (point.coordinates) {
        const coords = this.parseCoordinates(point.coordinates);
        if (coords && coords.length >= 2) {
          return {
            type: 'Point',
            coordinates: this.toGeoJSONCoord(coords)
          };
        }
      }
    } catch (error) {
      Logger.error('Error creating point geometry', error);
    }
    
    return null;
  },
  
  /**
   * Extract a linestring geometry from parsed GML
   */
  createLineStringGeometry(lineString: any): any {
    try {
      // Check for coordinates in different formats
      if (lineString.posList) {
        const coordsList = this.parseCoordinatesArray(lineString.posList, 2);
        if (coordsList && coordsList.length > 0) {
          // Convert each coordinate pair
          const coords = coordsList.map(pair => this.toGeoJSONCoord(pair));
          return {
            type: 'LineString',
            coordinates: coords
          };
        }
      } else if (lineString.coordinates) {
        const coordsList = this.parseCoordinatesArray(lineString.coordinates);
        if (coordsList && coordsList.length > 0) {
          // Convert each coordinate pair
          const coords = coordsList.map(pair => this.toGeoJSONCoord(pair));
          return {
            type: 'LineString',
            coordinates: coords
          };
        }
      } else if (lineString.Point) {
        // Line from individual points
        const points = Array.isArray(lineString.Point) ? lineString.Point : [lineString.Point];
        const coords = [];
        
        for (const point of points) {
          const pointGeom = this.createPointGeometry(point);
          if (pointGeom && pointGeom.coordinates) {
            coords.push(pointGeom.coordinates);
          }
        }
        
        if (coords.length > 0) {
          return {
            type: 'LineString',
            coordinates: coords
          };
        }
      }
    } catch (error) {
      Logger.error('Error creating line geometry', error);
    }
    
    return null;
  },
  
  /**
   * Extract a polygon geometry from parsed GML
   */
  createPolygonGeometry(polygon: any): any {
    try {
      const rings = [];
      
      // Find exterior ring
      let exterior = null;
      if (polygon.exterior) {
        exterior = polygon.exterior.LinearRing;
      } else if (polygon.outerBoundaryIs) {
        exterior = polygon.outerBoundaryIs.LinearRing;
      } else if (polygon.LinearRing) {
        // Single ring polygon
        exterior = polygon.LinearRing;
      }
      
      if (exterior) {
        const exteriorCoords = this.extractRingCoordinates(exterior);
        if (exteriorCoords && exteriorCoords.length > 0) {
          rings.push(exteriorCoords);
          
          // Find interior rings (holes)
          let interiors = [];
          if (polygon.interior) {
            interiors = Array.isArray(polygon.interior) ? polygon.interior : [polygon.interior];
          } else if (polygon.innerBoundaryIs) {
            interiors = Array.isArray(polygon.innerBoundaryIs) ? polygon.innerBoundaryIs : [polygon.innerBoundaryIs];
          }
          
          for (const interior of interiors) {
            const ring = interior.LinearRing;
            if (ring) {
              const interiorCoords = this.extractRingCoordinates(ring);
              if (interiorCoords && interiorCoords.length > 0) {
                rings.push(interiorCoords);
              }
            }
          }
          
          return {
            type: 'Polygon',
            coordinates: rings
          };
        }
      }
    } catch (error) {
      Logger.error('Error creating polygon geometry', error);
    }
    
    return null;
  },
  
  /**
   * Extract ring coordinates from a GML LinearRing
   */
  extractRingCoordinates(ring: any): number[][] | null {
    try {
      if (ring.posList) {
        const coordsList = this.parseCoordinatesArray(ring.posList, 2);
        if (coordsList && coordsList.length > 0) {
          // Convert each coordinate pair
          const coords = coordsList.map(pair => this.toGeoJSONCoord(pair));
          
          // Ensure the ring is closed (first coord === last coord)
          if (coords.length > 0 && 
             (coords[0][0] !== coords[coords.length-1][0] || 
              coords[0][1] !== coords[coords.length-1][1])) {
            coords.push([coords[0][0], coords[0][1]]);
          }
          
          return coords;
        }
      } else if (ring.coordinates) {
        const coordsList = this.parseCoordinatesArray(ring.coordinates);
        if (coordsList && coordsList.length > 0) {
          // Convert each coordinate pair
          const coords = coordsList.map(pair => this.toGeoJSONCoord(pair));
          
          // Ensure the ring is closed
          if (coords.length > 0 &&
             (coords[0][0] !== coords[coords.length-1][0] ||
              coords[0][1] !== coords[coords.length-1][1])) {
            coords.push([coords[0][0], coords[0][1]]);
          }
          
          return coords;
        }
      }
    } catch (error) {
      Logger.error('Error extracting ring coordinates', error);
    }
    
    return null;
  },
  
  /**
   * Create an empty GeoJSON feature collection
   */
  createEmptyFeatureCollection(): {type: string, features: any[]} {
    return {
      type: "FeatureCollection",
      features: []
    };
  },
  
  /**
   * Create a GeoJSON feature with properties
   */
  createFeature(geometry: any, properties: Record<string, any> = {}, id?: string): {type: string, properties: Record<string, any>, geometry: any, id?: string} {
    const feature: {type: string, properties: Record<string, any>, geometry: any, id?: string} = {
      type: "Feature",
      properties: properties,
      geometry: geometry
    };
    
    if (id) {
      feature.id = id;
    }
    
    return feature;
  },
  
  /**
   * Convert BBox array to a GeoJSON polygon
   */
  bboxToPolygon(bbox: number[]): any {
    if (bbox.length !== 4) {
      Logger.warn('Invalid bbox: must have 4 elements', bbox);
      return null;
    }
    
    const [minX, minY, maxX, maxY] = bbox;
    
    return {
      type: 'Polygon',
      coordinates: [[
        [minX, minY],
        [maxX, minY],
        [maxX, maxY],
        [minX, maxY],
        [minX, minY]
      ]]
    };
  }
};

export default GeometryUtils;