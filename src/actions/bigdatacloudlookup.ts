import axios, { AxiosResponse } from 'axios';
//import * as url from 'URL';

import config from "../config.js";
//import { logger } from '../logger.js';
//import * as util from '../util.js';

async function bigdatacloudLookup(ctx:any) {
    const ip = ctx.query['ip'];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`
        };
        return;
    }

    const apiKey = config.get('bigdatacloudApiKey');
    if (!apiKey) {
        ctx.body = {
            success: false,
            message: `BIGDATACLOUD_API_KEY not configured`
        };
        return;
    }

    let retVal:any = {};

    const instance = axios.create({
        headers: {
            'User-Agent': 'resolve.rs/1.0'
        },
        maxRedirects: 0,
        timeout: 5000,
        validateStatus: () => true
    });

    try {
        const response: AxiosResponse<any> = await instance.get(`https://api.bigdatacloud.net/data/ip-geolocation-with-confidence?ip=${encodeURIComponent(ip)}&localityLanguage=en&key=${encodeURIComponent(apiKey)}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from ip.bigdatacloud.com: ${response.status}`;
        retVal.ip = ip;
        retVal.raw = response.data;
        retVal.country = response.data.country ? response.data.country.isoAlpha2 : '(not set)';
        if (response.data.location) {
            retVal.latitude = response.data.location.latitude;
            retVal.longitude = response.data.location.longitude;
            retVal.text = `${response.data.location.city || response.data.location.localityName}, ${response.data.location.isoPrincipalSubdivision}, ${response.data.country ? response.data.country.name : '(No country)'}`;
        } else {
            retVal.text = '(no location info)';
        }
        ctx.log.debug({ data: retVal, ip, provider: 'BigDataCloud' }, 'Geolocation result')
    } catch (err) {
        retVal.success = false;
        retVal.message = err.message;
        ctx.log.warn({ data: retVal, err, ip, provider: 'BigDataCloud' }, 'Geolocation error');
    }

    ctx.body = retVal;
}

export {
    bigdatacloudLookup,
}
