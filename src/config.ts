import { default as convict } from 'convict';

const config = convict({
  abstractapiApiKey: {
    default: null,
    doc: 'API key for abstractapi.com',
    env: 'ABSTRACTAPI_API_KEY',
    format: String,
    sensitive: true,
  },
  astroipApiKey: {
    default: null,
    doc: 'API key for astroip.co',
    env: 'ASTROIP_API_KEY',
    format: String,
    sensitive: true,
  },
  bigdatacloudApiKey: {
    default: null,
    doc: 'API key for bigdatacloud.com',
    env: 'BIGDATACLOUD_API_KEY',
    format: String,
    sensitive: true,
  },
  buildId: {
    default: process.env.COMMIT || `local@${new Date().getTime()}`,
    doc: 'Unique Build ID (commit hash or timestamp) for cache busting',
    env: 'BUILD_ID',
    format: String
  },
  ip2locationApiKey: {
    default: null,
    doc: 'API key for ip2location.com',
    env: 'IP2LOCATION_API_KEY',
    format: String,
    sensitive: true,
  },
  ip2locationPackage: {
    default: 'ws5',
    doc: 'Package (=how much data in results) for ip2location.com',
    env: 'IP2LOCATION_PACKAGE',
    format: String,
  },
  ipapiAccessKey: {
    default: null,
    doc: 'ACCESS_KEY for ipapi.com',
    env: 'IPAPI_ACCESS_KEY',
    format: String,
    sensitive: true,
  },
  ipdataApiKey: {
    default: null,
    doc: 'API_KEY for ipdata.co',
    env: 'IPDATA_API_KEY',
    format: String,
    sensitive: true,
  },
  ipGeoLocationApiKey: {
    default: null,
    doc: 'API_KEY for ipgeolocation.io',
    env: 'IPGEOLOCATION_API_KEY',
    format: String,
    sensitive: true,
  },
  ipinfoAccessToken: {
    default: null,
    doc: 'ACCESS_TOKEN for ipinfo.io',
    env: 'IPINFO_ACCESS_TOKEN',
    format: String,
    sensitive: true,
  },
  ipinsightToken: {
    default: null,
    doc: 'API key for ipinsight.io',
    env: 'IPINSIGHT_TOKEN',
    format: String,
    sensitive: true,
  },
  ipstackApiKey: {
    default: null,
    doc: 'API key for ipstack.com',
    env: 'IPSTACK_API_KEY',
    format: String,
    sensitive: true,
  },
  ipregistryApiKey: {
    default: null,
    doc: 'API key for ipregistry.co',
    env: 'IPREGISTRY_API_KEY',
    format: String,
    sensitive: true,
  },
  labstackApiKey: {
    default: null,
    doc: 'API key for labstack.com',
    env: 'LABSTACK_API_KEY',
    format: String,
    sensitive: true,
  },
  logLevel: {
    default: 'debug',
    doc: 'pino logging level [fatal, error, warn, info, debug, trace]',
    env: 'LOG_LEVEL',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
  },
  mmdbKey: {
    default: null,
    doc: 'Random key for encrypting mmdb files',
    env: 'MMDB_ENCRYPTION_KEY',
    format: String,
    sensitive: true,
  },
  port: {
    default: 4000,
    doc: 'TCP port at which this service listens',
    env: 'PORT',
    format: 'int',
  },
  sessionKey: {
    default: 'DSTuYdDnzz3R4DX6XP77wVgbMAlXWp7W',
    doc: 'Random key for encrypting session',
    env: 'SESSION_KEY',
    format: String,
    sensitive: true,
  },
});

export default config;
