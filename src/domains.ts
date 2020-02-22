import { promises as fsPromises } from 'fs';
import * as path from 'path';
import Pino from 'pino';

const publicSuffixes:string[] = [];
const allTlds:string[] = [];
const niceTlds:string[] = [];
const usableTlds:string[] = [];

async function initialize(logger:Pino.Logger) {

    const psFileName = path.join(__dirname, '..', 'data', 'public_suffix_list.dat');

    publicSuffixes.push(...(await fsPromises.readFile(psFileName, 'utf-8')).split('\n').filter(line => line.length > 0 && !line.startsWith('//')));

    usableTlds.push(...publicSuffixes.filter(line => line.indexOf('.') == -1 && line.length <= 5 && line.match(/[a-z]+/)));
    publicSuffixes.filter(line => line.startsWith('*.') && line.indexOf('.', 3) == -1).forEach(line => usableTlds.push(line.slice(2)));
    usableTlds.sort();
    //usableTlds.forEach( tld => tldSet.add(tld));

    const tldSet = new Set<string>();
    for (const domain of publicSuffixes) {
        const parts = domain.split('.');
        const last = parts[parts.length - 1];
        if (tldSet.has(last)) {
            continue;
        }
        tldSet.add(last);
    }

    allTlds.push(...tldSet.values());       //LATER: include ones that are in public suffix with a dot (i.e. that don't allow top-level registration)
    allTlds.sort();

    const niceFileName = path.join(__dirname, '..', 'data', 'domain-suffix.txt');

    niceTlds.push(...(await fsPromises.readFile(niceFileName, 'utf-8')).split('\n').filter(line => line.length > 0 && !line.startsWith('//')));

    logger.info({ tldCount: allTlds.length, niceCount: niceTlds.length }, 'domains loaded');
}

export {
    allTlds,
    initialize,
    niceTlds,
    publicSuffixes,
    usableTlds,
}