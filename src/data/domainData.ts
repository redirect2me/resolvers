import { promises as fsPromises } from 'fs';
import * as path from 'path';
import Pino from 'pino';
import * as punycode from 'punycode';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const publicSuffixes:string[] = [];
const icannTlds:string[] = [];
const pslTlds:{ [key: string]: string[] } = {};
const niceTlds:string[] = [];
const usableTlds:string[] = [];

async function initialize(logger:Pino.Logger) {

    const icannFileName = path.join(__dirname, '../..', 'data', 'icann', 'tlds-alpha-by-domain.txt');
    const punyIcann = (await fsPromises.readFile(icannFileName, 'utf-8')).split('\n');
    for (const punyDomain of punyIcann.slice(1).filter(line => line.length > 0)) {
        icannTlds.push(punycode.toUnicode(punyDomain.toLowerCase()));
    }

    const psFileName = path.join(__dirname, '../..', 'data', 'publicsuffix', 'public_suffix_list.dat');

    publicSuffixes.push(...(await fsPromises.readFile(psFileName, 'utf-8')).split('\n').filter(line => line.length > 0 && !line.startsWith('//')));

    // tlds that are directly listed
    usableTlds.push(...publicSuffixes.filter(line => line.indexOf('.') == -1 && line.length <= 5 && line.match(/[a-z]+/)));
    // tlds that are listed with '*'
    publicSuffixes.filter(line => line.startsWith('*.') && line.indexOf('.', 3) == -1).forEach(line => usableTlds.push(line.slice(2)));
    usableTlds.sort();

    for (const domain of publicSuffixes) {
        const parts = domain.split('.');
        const last = parts[parts.length - 1].trim();
        if (!pslTlds[last]) {
            pslTlds[last] = [domain];
        } else {
            pslTlds[last].push(domain);
        }
    }
    //LATER: include ones that are in public suffix with a dot (i.e. that don't allow top-level registration)

    const niceFileName = path.join(__dirname, '../..', 'data', 'domain-suffix.txt');

    niceTlds.push(...(await fsPromises.readFile(niceFileName, 'utf-8')).split('\n').filter(line => line.length > 0 && !line.startsWith('//')));

    logger.info({ icannCount: icannTlds.length, publicSuffixCount: publicSuffixes.length, niceCount: niceTlds.length }, 'domains loaded');
}

export {
    icannTlds,
    initialize,
    niceTlds,
    pslTlds,
    publicSuffixes,
    usableTlds,
}
