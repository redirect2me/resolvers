import axios, { AxiosResponse } from 'axios';

import config from '../config';

async function astroipLookup(ctx:any) {
    const ip = ctx.query['ip'];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`
        };
        return;
    }

    const apiKey = config.get('astroipApiKey');
    if (!apiKey) {
        ctx.body = {
            success: false,
            message: `ASTROIP_API_KEY not configured`
        };
        return;
    }

    let retVal:any = {};

    const instance = axios.create({
        maxRedirects: 0,
        timeout: 5000,
        validateStatus: () => true
    });

    try {
        const response: AxiosResponse<any> = await instance.get(` https://api.astroip.co/${encodeURIComponent(ip)}?api_key=${apiKey}&useragent=true&hostname=true`);
        retVal.success = response.status == 200;
        retVal.message = `Status from api.astroip.com: ${response.status}`;
        retVal.ip = ip;
        retVal.raw = response.data;
        if (response.data.geo) {
            retVal.country = response.data.geo.country_code;
            retVal.latitude = response.data.geo.latitude;
            retVal.longitude = response.data.geo.longitude;
            retVal.text = `${response.data.geo.city}, ${response.data.geo.region_name}, ${response.data.geo.country_name}`;
        }
        ctx.log.debug({ data: retVal, ip, provider: 'astroip' }, 'Geolocation result')
    } catch (err) {
        retVal.success = false;
        retVal.message = err.message;
        ctx.log.warn({ data: retVal, err, ip, provider: 'astroip' }, 'Geolocation error')
    }

    ctx.body = retVal;
}

export {
    astroipLookup,
}
