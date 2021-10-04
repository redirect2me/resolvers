import axios, { AxiosResponse } from 'axios';

import config from '../config';

async function ipregistryLookup(ctx:any) {
    const ip = ctx.query['ip'];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`
        };
        return;
    }

    const apiKey = config.get('ipregistryApiKey');
    if (!apiKey) {
        ctx.body = {
            success: false,
            message: `IPREGISTRY_API_KEY not configured`
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
        const response: AxiosResponse<any> = await instance.get(`https://api.ipregistry.co/${encodeURIComponent(ip)}?key=${apiKey}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from ipregistry.co: ${response.status}`;
        retVal.ip = ip;
        retVal.raw = response.data;
        retVal.country = response.data.location.country.code;
        retVal.latitude = response.data.location.latitude;
        retVal.longitude = response.data.location.longitude;
        retVal.text = `${response.data.location.city}, ${response.data.location.region.name}, ${response.data.location.country.name}`;
        ctx.log.debug({ data: retVal, ip, provider: 'ipregistry' }, 'Geolocation result')
    } catch (err) {
        retVal.success = false;
        retVal.message = err.message;
        ctx.log.warn({ data: retVal, err, ip, provider: 'ipregistry' }, 'Geolocation error')
    }

    ctx.body = retVal;
}

export {
    ipregistryLookup,
}
