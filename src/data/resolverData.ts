import { promises as fsPromises } from 'fs';
import * as path from 'path';
import Pino from 'pino';

type resolverData = {
  draft?: boolean,
}

const cache = new Map<string, resolverData>();

async function initialize(logger:Pino.Logger) {

  const dataDir = path.join(__dirname, '../..', 'data', 'resolvers');

  const fileNames = await fsPromises.readdir(dataDir);

  for (const fileName of fileNames) {
    if (fileName.endsWith(".json")) {
      const key = fileName.slice(0, -5);
      const resolver = JSON.parse(await fsPromises.readFile(path.join(dataDir, fileName), "utf-8"));
      resolver.key = key;
      cache.set(key, resolver);
    }
  }

  logger.trace( { fileNames }, 'files loaded');

  logger.debug( { count: cache.size }, 'Public resolvers list loaded');
}

function get(fileName:string): any {
  const retVal = cache.get(fileName);

  if (!retVal) {
    throw new Error(`Unable to load ${fileName}`);
  }
  return retVal;
}

function getAll(draft?: boolean): any[] {
  const retVal = [];

  for (const key of cache.keys()) {
    const resolver:resolverData|undefined = cache.get(key);
    if (!resolver) {
      continue;
    }
    if (!draft && resolver.draft) {
      continue;
    }
    console.log(`${key}=${JSON.stringify(cache.get(key))}`)
    retVal.push(cache.get(key));
  }
  return retVal;
}

function list(): string[] {
  return Array.from(cache.keys()).sort();
}

export {
  get,
  getAll,
  initialize,
  list,
}