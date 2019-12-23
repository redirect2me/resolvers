
function jsonp(callback: string, retVal: any) {
    return `${callback}(${JSON.stringify(retVal)})`;
}

export {
    jsonp
}