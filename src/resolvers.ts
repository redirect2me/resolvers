import { promises as fsPromises } from 'fs';
import * as path from 'path';
import Pino from 'pino';

const cache = new Map<string, string>();

async function initialize(logger:Pino.Logger) {

  const queryDir = path.join(__dirname, '..', 'data');

  const fileNames = await fsPromises.readdir(queryDir);

  for (const fileName of fileNames) {
    if (fileName.endsWith(".json")) {
      const key = fileName.slice(0, -5);
      const resolver = JSON.parse(await fsPromises.readFile(path.join(queryDir, fileName), "utf-8"));
      if (resolver.draft) {
        continue;
      }
      resolver.key = key;
      cache.set(key, resolver);
    }
  }

  logger.trace( { fileNames }, 'files loaded');

  logger.debug( { count: cache.size }, 'Query cache loaded');
}

function get(fileName:string): any {
  const retVal = cache.get(fileName);

  if (!retVal) {
    throw new Error(`Unable to load ${fileName}`);
  }
  return retVal;
}

function getAll(): any[] {
  const retVal = [];

  for (const key of cache.keys()) {
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