import { promises as fsPromises } from 'fs';
import * as path from 'path';
import Pino from 'pino';
import * as punycode from 'punycode';
import * as yaml from 'js-yaml';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

type rdapInfo = {
  notes?: string,
  official: boolean,
  tld: string,      // NOTE: string is in puny-code!
  unicode: string,
  rdap?: string,
  working?: boolean,
}

const cache = new Map<string, rdapInfo>();

async function initialize(logger:Pino.Logger) {

  const rdapFileName = path.join(__dirname, '../..', 'data', 'rdap', 'rdap.yaml');
  const rdapRaw:any = yaml.load(await fsPromises.readFile(rdapFileName, 'utf-8'));
  for (const tld of Object.getOwnPropertyNames(rdapRaw.cctlds)) {
    const theInfo:rdapInfo = rdapRaw.cctlds[tld];
    theInfo.tld = tld;
    theInfo.unicode = punycode.toUnicode(tld);
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
        cache.set(tld, {
          tld: tld,
          unicode: punycode.toUnicode(tld),
          rdap: service[1][0],
          official: true
        });
      }
    }
  }

  const uniqueSize = cache.size;

  Array.from(cache.values()).forEach(x => {
    if (x.tld != x.unicode) {
      cache.set(x.unicode, x);
    }
  });

  logger.info({ count: uniqueSize }, 'rdap loaded');
}

function get(tld:string): rdapInfo|undefined {
  return cache.get(tld);
}

function list(): rdapInfo[] {
    const retVal:rdapInfo[] = [];

    for (const entry of cache.entries()) {
        if (entry[0].startsWith("xn--")) {
          continue;
        }
        retVal.push(entry[1]);
    }
    retVal.sort((a, b) => { return a.unicode.localeCompare(b.unicode); });

    return retVal;
}

export {
    get,
    initialize,
    list,
}
