import axios, { AxiosResponse } from 'axios';

import config from '../config';

async function ipdataLookup(ctx:any) {
    const ip = ctx.query['ip'];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`
        };
        return;
    }

    const apiKey = config.get('ipdataApiKey');
    if (!apiKey) {
        ctx.body = {
            success: false,
            message: `IPDATA_API_KEY not configured`
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
        const response: AxiosResponse<any> = await instance.get(`https://api.ipdata.co/${encodeURIComponent(ip)}?api-key=${apiKey}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from api.ipdata.co: ${response.status}`;
        retVal.ip = ip;
        retVal.raw = response.data;
        retVal.country = response.data.country_code;
        retVal.latitude = response.data.latitude;
        retVal.longitude = response.data.longitude;
        retVal.text = `${response.data.city}, ${response.data.region}, ${response.data.country_name}`;
        ctx.log.debug({ data: retVal, ip, provider: 'ipdata' }, 'Geolocation result')
    } catch (err) {
        retVal.success = false;
        retVal.message = err.message;
        ctx.log.warn({ data: retVal, err, ip, provider: 'ipdata' }, 'Geolocation error')
    }

    ctx.body = retVal;
}

export {
    ipdataLookup,
}
