import axios from 'axios';
//import * as url from 'URL';

import config from '../config';
//import { logger } from '../logger';
//import * as util from '../util';

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
        const response = await instance.get(`https://api.bigdatacloud.net/data/ip-geolocation-with-confidence?ip=${encodeURIComponent(ip)}&localityLanguage=en&key=${encodeURIComponent(apiKey)}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from ip.bigdatacloud.com: ${response.status}`;
        retVal.ip = ip;
        retVal.country = response.data.country ? response.data.country.isoAlpha2 : '(not set)';
        if (response.data.location) {
            retVal.latitude = response.data.location.latitude;
            retVal.longitude = response.data.location.longitude;
            retVal.text = `${response.data.location.city}, ${response.data.location.isoPrincipalSubdivision}, ${response.data.country ? response.data.country.name : '(No country)'}`;
        } else {
            retVal.text = '(no location info)';
        }
        retVal.raw = response.data;
    } catch (err) {
        ctx.log.error({ err, ip }, 'Unable to check ip with bigdatacloud');
        retVal.success = false;
        retVal.message = err.message;
    }

    console.log(retVal);

    ctx.body = retVal;
}

export {
    bigdatacloudLookup,
}
