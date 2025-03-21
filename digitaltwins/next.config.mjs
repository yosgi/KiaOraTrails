// apps/gamefi/next.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cesiumSource = path.resolve(__dirname, 'node_modules/cesium/Build/Cesium');

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  eslint: {
    // This will allow production builds to complete even if there are ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Define relative base path for Cesium assets
    config.plugins.push(
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify('/cesium'),
      })
    );

    if (!isServer) {
      // Copy Cesium assets to public/cesium
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: cesiumSource,
              to: '../public/cesium',
            },
          ],
        })
      );
    }

    // Cesium JS module compatibility
    config.resolve.exportsFields = [];

    return config;
  },
};

export default nextConfig;
