import * as dnsRouter from '../routers/dnsRouter';
import * as domainRouter from '../routers/domainRouter';
import * as httpRouter from '../routers/httpRouter';
import * as ipRouter from '../routers/ipRouter';
import * as resolverRouter from '../routers/resolverRouter';

async function sitemap(ctx:any) {

    let urls:string[] = [];

    urls.push(...dnsRouter.getUrls());
    urls.push(...domainRouter.getUrls());
    urls.push(...httpRouter.getUrls());
    urls.push(...ipRouter.getUrls());
    urls.push(...resolverRouter.getUrls());

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