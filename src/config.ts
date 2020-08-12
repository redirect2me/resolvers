import { default as convict } from 'convict';

const config = convict({
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
  ipstackApiKey: {
    default: null,
    doc: 'API key for ipstack.com',
    env: 'IPSTACK_API_KEY',
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
