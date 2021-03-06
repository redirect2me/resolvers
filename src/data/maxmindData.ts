import * as crypto from 'crypto';
import * as fs from 'fs';
import maxmind, { AsnResponse, CityResponse, Reader } from 'maxmind';
import * as path from 'path';
import Pino from 'pino';
import * as stream from 'stream';
import * as tmp from 'tmp-promise';
import * as util from 'util';
import * as zlib from 'zlib';

import config from '../config';
const pipeline = util.promisify(stream.pipeline);

let asnDatabase:Reader<AsnResponse>|null = null;
let cityDatabase:Reader<CityResponse>|null = null;

async function expandFile(logger:Pino.Logger, fileName:string, key:Buffer, iv:Buffer):Promise<string> {
    const retVal = await tmp.tmpName({ postfix: '.mmdb'});
    logger.trace( { original: fileName, expanded: retVal }, 'Expanding compressed file');
    var r = fs.createReadStream(fileName);

    var decrypt = crypto.createDecipheriv('aes-256-ctr', key, iv)
    var unzip = zlib.createGunzip();
    var w = fs.createWriteStream(retVal);


    await pipeline(r, decrypt, unzip, w);

    return retVal;
}

async function initialize(logger:Pino.Logger) {
    let asnFileName = path.join(__dirname, '../..', './data/maxmind/GeoLite2-ASN.mmdb');
    let cityFileName = path.join(__dirname, '../..', './data/maxmind/GeoLite2-City.mmdb');
    let ivFileName = path.join(__dirname, '../..', './data/maxmind/mmdb.iv');
    try {

        const keyHex = config.get('mmdbKey');
        const ivHex = await fs.promises.readFile(ivFileName, 'utf-8');
        if (keyHex && ivHex) {
            const key = Buffer.from(keyHex, "hex");
            const iv = Buffer.from(ivHex, "hex");
            asnFileName = await expandFile(logger, asnFileName + '.enc', key, iv);
            cityFileName = await expandFile(logger, cityFileName + '.enc', key, iv);
        }
        asnDatabase = await maxmind.open<AsnResponse>(asnFileName);
        cityDatabase = await maxmind.open<CityResponse>(cityFileName);
        logger.debug({ asnFileName, cityFileName }, 'Maxmind data loaded');
    }
    catch (err) {
        logger.error({ err, asnFileName, cityFileName }, 'Unable to load Maxmind data files');
    }
}

function asnLookup(ip:string): AsnResponse|null {
    if (asnDatabase == null) {
        throw new Error("asn.initialize not called or failed");
    }
    return asnDatabase.get(ip);
}

function asnLookupStr(ip:string): string {
    if (asnDatabase == null) {
        return "ERROR: initialize not called or failed";
    }
    try {
        const asnResult = asnDatabase.get(ip);

        if (!asnResult) {
            return `Unable to find ASN for ${ip}`;
        }
        return `${asnResult.autonomous_system_organization} (${asnResult.autonomous_system_number})`;
    } catch (err) {
        return err.message;
    }
}
function cityLookup(ip:string): CityResponse|null {
    if (cityDatabase == null) {
        throw new Error("asn.initialize not called or failed");
    }
    return cityDatabase.get(ip);
}

function cityLookupHtml(ip:string): string {
    if (cityDatabase == null) {
        return "ERROR: initialize not called or failed";
    }
    try {
        const cityResult = cityDatabase.get(ip);

        if (!cityResult) {
            return `Unable to geolocate ${ip}`;
        }
        return `${cityResult.city?.names.en}, ${cityResult.country?.names.en}: <a href="https://www.openstreetmap.org/?mlat=${cityResult.location?.latitude}&mlon=${cityResult.location?.longitude}&zoom=12">${cityResult.location?.latitude}, ${cityResult.location?.longitude}</a>`;
    } catch (err) {
        return err.message;
    }
}

export {
    asnLookup,
    asnLookupStr,
    cityLookup,
    cityLookupHtml,
    initialize,
}