import { promises as fsPromises } from 'fs';
import * as path from 'path';
import Pino from 'pino';
import * as yaml from 'js-yaml';
//import * as punycode from 'punycode';

type rdapInfo = {
  notes?: string,
  official: boolean,
  tld: string,      // NOTE: string is in puny-code!
  rdap?: string,
  working?: boolean,
}

const cache = new Map<string, rdapInfo>();
//const secondaryMap = new Map<string, string>();

async function initialize(logger:Pino.Logger) {

  const rdapFileName = path.join(__dirname, '../..', 'data', 'rdap', 'rdap.yaml');
  const rdapRaw:any = yaml.load(await fsPromises.readFile(rdapFileName, 'utf-8'));
  for (const tld of Object.getOwnPropertyNames(rdapRaw.cctlds)) {
    const theInfo:rdapInfo = rdapRaw.cctlds[tld];
    theInfo.tld = tld;
    theInfo.official = false;
    cache.set(tld, rdapRaw.cctlds[tld])
  }

  const ianaFileName = path.join(__dirname, '../..', 'data', 'rdap', 'dns.json');
  const raw = JSON.parse((await fsPromises.readFile(ianaFileName, 'utf-8')));

  for (const service of raw.services) {
    for (const tld of service[0]) {
      const theInfo = cache.get(tld);
      if (theInfo) {
        theInfo.official = true;
      }
      else {
        cache.set(tld, { tld: tld, rdap: service[1][0], official: true});
      }
    }
  }

  logger.info({ count: cache.size }, 'rdap loaded');
}

function list(): rdapInfo[] {
  return Array.from(cache.values()).sort((a, b) => { return a.tld.localeCompare(b.tld); });
}


export {
    initialize,
    list,
}