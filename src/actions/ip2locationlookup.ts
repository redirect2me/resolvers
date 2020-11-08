import axios from 'axios';

import config from '../config';

async function ip2locationLookup(ctx: any) {
    const ip = ctx.query['ip'];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`
        };
        return;
    }

    const apiKey = config.get('ip2locationApiKey');
    if (!apiKey) {
        ctx.body = {
            success: false,
            message: `IP2LOCATION_API_KEY not configured`
        };
        return;
    }

    const ip2locationPackage = config.get('ip2locationPackage');

    let retVal: any = {};

    const instance = axios.create({
        headers: { 'User-Agent': 'resolve.rs/1.0' },
        maxRedirects: 0,
        timeout: 5000,
        validateStatus: () => true,
    });

    try {
        const response = await instance.get(`https://api.ip2location.com/v2/?ip=${encodeURIComponent(ip)}&lang=en&package=${encodeURIComponent(ip2locationPackage)}&key=${apiKey}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from api.ip2location.com: ${response.status}`;
        retVal.ip = ip;
        retVal.raw = response.data;
        retVal.country = response.data.country_code;
        retVal.latitude = response.data.latitude;
        retVal.longitude = response.data.longitude;
        retVal.text = `${response.data.city_name}, ${response.data.region_name}, ${response.data.country_name}`;
        ctx.log.debug({ data: retVal, ip, provider: 'ip2location' }, 'Geolocation result')
    } catch (err) {
        retVal.success = false;
        retVal.message = err.message;
        ctx.log.warn({ data: retVal, err, ip, provider: 'ip2location' }, 'Geolocation error')
    }

    ctx.body = retVal;
}

export {
    ip2locationLookup,
}
