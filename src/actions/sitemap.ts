import * as cryptoRouter from '../routers/cryptoRouter';
import * as dnsRouter from '../routers/dnsRouter';
import * as domainRouter from '../routers/domainRouter';
import * as httpRouter from '../routers/httpRouter';
import * as infoRouter from '../routers/infoRouter';
import * as ipRouter from '../routers/ipRouter';
import * as tldsRouter from '../routers/tldsRouter';
import * as resolverRouter from '../routers/resolverRouter';
import { pslChangeLogGetUrls } from '../routers/pslRouter';

async function sitemap(ctx:any) {

    let urls:string[] = [];

    urls.push(...cryptoRouter.getUrls());
    urls.push(...dnsRouter.getUrls());
    urls.push(...domainRouter.getUrls());
    urls.push(...httpRouter.getUrls());
    urls.push(...infoRouter.getUrls());
    urls.push(...ipRouter.getUrls());
    urls.push(...resolverRouter.getUrls());
    urls.push(...pslChangeLogGetUrls());
    urls.push(...tldsRouter.getUrls());
    urls.push(...tldsRouter.tldsChangeLogGetUrls());

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
