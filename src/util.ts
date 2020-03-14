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
    if (callback) {
        ctx.body = callback + '(' + JSON.stringify(retVal) + ');';
        ctx.set('Content-Type', 'text/javascript');
    } else {
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Methods', 'POST, GET');
        ctx.set('Access-Control-Max-Age', '604800');
        ctx.body = retVal;
    }
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

    if (ctx.request.params && ctx.request.params.api_key && validateApiKey(ctx.request.params.api_key)) {
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
    getJsonp,
    handleJsonp,
    validateApiKey,
    validateCaller
}