import { default as convict } from 'convict';

const config = convict({
  logLevel: {
    default: 'debug',
    doc: 'bunyan logger logging level [fatal, error, warn, info, debug, trace]',
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
  mmdbIv: {
    default: null,
    doc: 'Random IV for encrypting mmdb files',
    env: 'MMDB_ENCRYPTION_IV',
    format: String,
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
