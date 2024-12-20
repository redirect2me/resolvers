import * as cryptoRouter from "../routers/cryptoRouter.js";
import * as dnsRouter from "../routers/dnsRouter.js";
import * as domainRouter from "../routers/domainRouter.js";
import * as httpRouter from "../routers/httpRouter.js";
import * as infoRouter from '../routers/infoRouter.js';
import * as ipRouter from '../routers/ipRouter.js';
import * as tldsRouter from '../routers/tldsRouter.js';
import * as resolverRouter from '../routers/resolverRouter.js';
import * as pslRouter from '../routers/pslRouter.js';

async function sitemap(ctx:any) {

    let urls:string[] = [];

    urls.push(...cryptoRouter.getUrls());
    urls.push(...dnsRouter.getUrls());
    urls.push(...domainRouter.getUrls());
    urls.push(...httpRouter.getUrls());
    urls.push(...infoRouter.getUrls());
    urls.push(...ipRouter.getUrls());
    urls.push(...resolverRouter.getUrls());
    urls.push(...pslRouter.getUrls());
    urls.push(...tldsRouter.getUrls());

    // hard-coded to avoid circular dependencies
    urls.push("/");
    urls.push("/api.html");
    urls.push("/contact.html");
    urls.push("/tools.html");

    urls.sort();

    ctx.body = await ctx.render('sitemap.hbs', { urls });
    ctx.type = "text/xml;charset=utf-8";
}

export {
    sitemap
}
