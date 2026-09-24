import axios, { AxiosResponse } from "axios";

import config from "../config.js";

async function iptrustLookup(ctx: any) {
    const ip = ctx.query["ip"];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`,
        };
        return;
    }

    const apiKey = config.get("iptrustApiKey");
    if (!apiKey) {
        ctx.body = {
            success: false,
            message: `IPTRUST_API_KEY not configured`,
        };
        return;
    }

    let retVal: any = {};

    const instance = axios.create({
        headers: {
            "User-Agent": "resolve.rs/1.0",
            "X-API-Key": apiKey,
        },
        maxRedirects: 0,
        timeout: 5000,
        validateStatus: () => true,
    });

    try {
        const response: AxiosResponse<any> = await instance.get(
            `https://api.iptrust.co/ip/${encodeURIComponent(ip)}?access_key=${apiKey}&format=1`,
        );
        retVal.success = response.status == 200;
        retVal.message = `Status from api.iptrust.co: ${response.status}`;
        retVal.ip = ip;
        retVal.raw = response.data;
        retVal.country = response.data.location.country;
        retVal.latitude = response.data.location.latitude;
        retVal.longitude = response.data.location.longitude;
        retVal.text = `${response.data.location.city}, ${response.data.location.state}, ${response.data.location.country}`;
        ctx.log.debug(
            { data: retVal, ip, provider: "iptrust" },
            "Geolocation result",
        );
    } catch (err) {
        retVal.success = false;
        retVal.message = err instanceof Error ? err.message : String(err);
        ctx.log.warn(
            { data: retVal, err, ip, provider: "iptrust" },
            "Geolocation error",
        );
    }

    ctx.body = retVal;
}

export { iptrustLookup };
