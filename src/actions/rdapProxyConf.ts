import * as yaml from 'js-yaml';
import * as punycode from 'punycode';
import * as wsw from 'whoisserver-world'

import * as rdapData from '../data/rdapData';

type RdapProxyConf = {
  whois: { [key:string]: string}
  redirect: { [key:string]: string}
};


async function rdapProxyConfGet(ctx: any) {

  const retVal:RdapProxyConf = { whois: {}, redirect: {} };

  Object.getOwnPropertyNames(wsw.tlds()).forEach( domain => {
    const tldInfo = wsw.tldDetails(domain);
    if (tldInfo.whoisServer) {
      retVal.whois[domain] = tldInfo.whoisServer[0];
    }
    ;
  });

  rdapData.list().forEach((ri) => {
    if (ri.rdap && (ri.official || ri.working)) {
      retVal.redirect[punycode.toASCII(ri.tld)] = ri.rdap
    }
  });

  ctx.set('Content-Type', 'text/plain');
  ctx.body = yaml.dump(retVal, { sortKeys: true });
}


export {
  rdapProxyConfGet,
}
