import axios from 'axios';

import config from '../config';

async function ipapiLookup(ctx: any) {
    const ip = ctx.query['ip'];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`
        };
        return;
    }

    const accessKey = config.get('ipapiAccessKey');
    if (!accessKey) {
        ctx.body = {
            success: false,
            message: `IPAPI_ACCESS_KEY not configured`
        };
        return;
    }

    let retVal:any = {};

    const instance = axios.create({
        headers: { 'User-Agent': 'resolve.rs/1.0' },
        maxRedirects: 0,
        timeout: 5000,
        validateStatus: () => true,
    });

    try {
        const response = await instance.get(`http://api.ipapi.com/${encodeURIComponent(ip)}?access_key=${accessKey}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from ipapi.com: ${response.status}`;
        retVal.ip = ip;
        retVal.raw = response.data;
        retVal.country = response.data.country_code;
        retVal.latitude = response.data.latitude;
        retVal.longitude = response.data.longitude;
        retVal.text = `${response.data.city}, ${response.data.region_name}, ${response.data.country_name}`;
        ctx.log.debug({ data: retVal, ip, provider: 'ipapi' }, 'Geolocation result')
    } catch (err) {
        retVal.success = false;
        retVal.message = err.message;
        ctx.log.warn({ data: retVal, err, ip, provider: 'ipapi' }, 'Geolocation error')
    }

    ctx.body = retVal;
}

export {
    ipapiLookup,
}
