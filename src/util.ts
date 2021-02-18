function getCurrentIP(ctx:any):string {
    return ctx.ips.length > 0 ? ctx.ips[0] : ctx.ip;
}

function getFirst(value:string|string[]):string {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
}

function getJsonp(ctx:any):string|null {
    const callback = ctx.request.query['callback'];
    if (!callback) {
      return null;
    }

    if (callback.match(/^[$A-Za-z_][0-9A-Za-z_$]*$/) != null) {
      return callback;
    }
    return null;
}

function handleJsonp(ctx:any, retVal:Object) {
    const callback = getJsonp(ctx);
    const jsonStr = ctx.query && ctx.query.pretty ? JSON.stringify(retVal, null, 2) : JSON.stringify(retVal);
    if (callback) {
        ctx.body = callback + '(' + jsonStr + ');';
        ctx.set('Content-Type', 'text/javascript');
    } else {
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Methods', 'POST, GET');
        ctx.set('Access-Control-Max-Age', '604800');
        ctx.body = jsonStr;
        ctx.set('Content-Type', 'application/json; charset=utf-8');
    }
}

function parseUrl(urlParam:string): URL|null {
    try {
        const theUrl = new URL(urlParam);
        if (!theUrl.protocol) {
            theUrl.protocol = 'https:';
        }
        return theUrl;
    } catch (err) {
        return null;
    }
}

function safeParseInt(val:string, defaultValue:number): number {

    let retVal = defaultValue;
    try {
        retVal = parseInt(val);
    }
    catch (err) {
        // deliberatly do nothing here, including no logging
    }

    if (isNaN(retVal)) {
        return defaultValue;
    }

    return retVal;
}

function validateApiKey(apiKey:string):boolean {
    if (!apiKey) {
        return false;
    }

    if (apiKey.indexOf('@') == -1) {    // LATER: check against a list
        return false;
    }

    return true;
}

function validateCaller(ctx:any):boolean {

    if (validateApiKey(ctx.request.headers['X-Api-Key'])) {
      return true;
    }

    if (ctx.query && ctx.query.apikey && validateApiKey(ctx.query.apikey)) {
      return true;
    }

    if (ctx.request.body && ctx.request.body.apikey && validateApiKey(ctx.request.body.apikey)) {
        return true;
    }

    if (getJsonp(ctx)) {
      return true;
    }

    handleJsonp(ctx, {
      success: false,
      message: "No API key: see https://resolve.rs/api.html for more details"
    });
    return false;
}

export {
    getCurrentIP,
    getFirst,
    getJsonp,
    handleJsonp,
    parseUrl,
    safeParseInt,
    validateApiKey,
    validateCaller
}
