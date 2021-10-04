import axios, { AxiosResponse } from 'axios';

async function ip_apiLookup(ctx: any) {
    const ip = ctx.query['ip'];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`
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
        const response: AxiosResponse<any> = await instance.get(`http://ip-api.com/json/${encodeURIComponent(ip)}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from ip-api.com: ${response.status}`;
        retVal.ip = ip;
        retVal.raw = response.data;
        retVal.country = response.data.countryCode;
        retVal.latitude = response.data.lat;
        retVal.longitude = response.data.lon;
        retVal.text = `${response.data.city}, ${response.data.regionName}, ${response.data.country}`;
        ctx.log.debug({ data: retVal, ip, provider: 'ip-api' }, 'Geolocation result')
    } catch (err) {
        retVal.success = false;
        retVal.message = err.message;
        ctx.log.warn({ data: retVal, err, ip, provider: 'ip-api' }, 'Geolocation error');
    }

    ctx.body = retVal;
}

export {
    ip_apiLookup,
}
