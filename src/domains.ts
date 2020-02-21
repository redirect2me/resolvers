import { promises as fsPromises } from 'fs';
import * as path from 'path';
import Pino from 'pino';

const allTlds:string[] = [];
const niceTlds:string[] = [];

async function initialize(logger:Pino.Logger) {

    const psFileName = path.join(__dirname, '..', 'data', 'public_suffix_list.dat');

    allTlds.push(...(await fsPromises.readFile(psFileName, 'utf-8')).split('\n').filter(line => line.length > 0 && !line.startsWith('//') && line.indexOf('.') == -1 && line.match(/^a[a-z]+$/)));

    const niceFileName = path.join(__dirname, '..', 'data', 'domain-suffix.txt');

    niceTlds.push(...(await fsPromises.readFile(niceFileName, 'utf-8')).split('\n').filter(line => line.length > 0 && !line.startsWith('//')));

    logger.info({ tldCount: allTlds.length, niceCount: niceTlds.length }, 'domains loaded');
}

export {
    initialize,
    niceTlds,
    allTlds,
}