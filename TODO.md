# To Do

* FLoC: note if urlParsed != urlFinal

* tlds: list of reserved
* tlds: list of inactive
* glossary from data
* pages with API versions: link to the API overview.
* what's my locale?
* speed test (page with external links already built)
* OpenGraph/schema.org/Twitter/oEmbed/etc metadata checker
* list of domains (and detailed info) from Gandi
* whatsmyip [alternatives](https://dev.to/adityathebe/a-handy-way-to-know-your-public-ip-address-with-dns-servers-4nmn)
* dnscheck [dnsyo](https://github.com/YoSmudge/dnsyo)

## Grading

* [ ] favicon: present, sizes, svg version
* [ ] robots.txt: present, # of lines, ?parse?
* [ ] [MXToolbox](https://mxtoolbox.com/diagnostic.aspx)
* [ ] [dt](https://github.com/42wim/dt/issues/1)
* [ ] trackers: presense, Google Analytics (or other) ID
* [ ] OpenGraph/schema.org/Twitter/oEmbed/etc metadata checker
* [ ] check for CORS headers
* [ ] check for other headers
* [ ] other well-known files
* [ ] show SSL cert info

## Glossary

```plain
id:
expanded (only for abbreviations)
term:
definition (markdown):
sort:
wikipedia:
more (markdown)
markdown -> use npm markdown-it
```

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

## Check SSL improvements

* test on bad/expired certs
* link to SSLlabs

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

* ASN lookup
* OUI lookup https://en.wikipedia.org/wiki/Organizationally_unique_identifier
* base64 decoding (or link to FFI https://www.fileformat.info/convert/text/base64decoder.htm
)

## Features

* A to F grade
* Blackhole check
* email configuration check
* check for domain name availability across all tlds (use single-words in public-suffix-list)

## Other Lists of Open Resolvers

* https://en.wikipedia.org/wiki/Public_recursive_name_server
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

* http://ifconfig.io/ [source](https://github.com/georgyo/ifconfig.io)
*
* https://www.dnsperf.com/
* https://dnsmap.io/articles/
* https://www.opennic.org/
* https://dnsdetective.net/
* http://www.whatsmydnsserver.com/
