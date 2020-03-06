# To Do

* what's my ip: copy to clipboard, links to api
* automate download of PSL
* dnsRouter.ts
* resolverRouter.ts
* some tools font-weight-bold
* redirect testing
* check SSL certificate
* update credits
* update sitemap.xml
* list of domains (and detailed info) from Gandi

https://github.com/ad-m/github-push-action
- run: |
    mkdir ~/.ssh
    echo "${{ secrets.SECRET_PRIVATE_DEPLOY_KEY }}" > ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
#        git config --local user.email actions@github.com
#        git config --local user.name github-actions


## DNS Check Improvements

* sample domain names (or ip addresses) to try
* error handling
* timeouts (and timing) on dns-check
* sample domain names (or ip addresses) to try
* error handling
* option for reverse-dns on dns checks (or a link)
* multiple simultaneous checks for dns-check
* timing data for dns-check
* [DoT](https://www.npmjs.com/package/dns-over-tls)
* resolver-detail: test on ipv6, DoT, DoH

## General

* privacy policy
* github issue template for new resolvers
* link on resolvers-index to contribute
* CONTRIBUTING.md
* docker-run.sh
* square brackets around ipv6 addresses

## Open Resolvers Enhancements

* tags page
* countries page
* translations for domains in foreign languages

## Open Resolver Data Enhancements

* fill in tags for all resolvers
* fill in social media links
* descriptions for open resolvers
* data/resolvers/xxx.md with details for each open resolvers
* https://cleanbrowsing.org/guides/dnsovertls
* IRC social media links are wrong

## More tools

* base64 decoding (or link to FFI)
* check for CORS headers
* check for robots.txt, favicon & other well-known files

## Features

* A to F grade
* Blackhole check
* email configuration check
* check for domain name availability across all tlds (use single-words in public-suffix-list)

## Open Resolvers

* https://public-dns.info/
* https://www.publicdns.xyz/
* https://www.lifewire.com/free-and-public-dns-servers-2626062
* https://dnsprivacy.org/wiki/display/DP/DNS+Privacy+Public+Resolvers

* DNS Advantage
* Level3
* OpenNIC, https://www.opennic.org/
* SafeDNS, https://www.safedns.com/en/
* NextDNS, https://www.nextdns.io/

## Not included:

* DNSFilter, https://www.dnsfilter.com/, Commercial only
* Hurricane Electric, https://dns.he.net/, Registration required


## other tools

* https://www.dnsperf.com/
* https://dnsmap.io/articles/
* https://www.opennic.org/
* https://dnsdetective.net/
* http://www.whatsmydnsserver.com/
