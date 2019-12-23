# To Do

* more stuff on home page
* tile on VLZ for redirect2me

## DNS Check Improvements

* error handling
* timeouts (and timing) on dns-check
* option for reverse-dns on dns checks
* multiple simultaneous checks for dns-check
* timing data for dns-check
* [DoT](https://www.npmjs.com/package/dns-over-tls)
* resolver-detail: test on ipv6, DoT, DoH

## General

* contact page
* privacy policy
* github issue template for new resolvers
* link on resolvers-index to contribute
* CONTRIBUTING.md
* docker-run.sh
* where am I?
* where are you?
* what resolvers are you using?
* make and use map of country code to country name
* tags page
* countries page

## Data Enhancements

* ASN data
* Geolocation data
* JSON schema for resolver data
* square brackets around ipv6 addresses
* fill in tags for all resolvers
* fill in social media links
* descriptions for open resolvers
* data/xxx.md with details for each open resolvers
* https://cleanbrowsing.org/guides/dnsovertls

## Features

* A to F grade
* Blackhole check
* email configuration check

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

## which.resolve.rs

- [ ] dns server that resolves static IP for `XXX.which.resolve.rs`
- [ ] stores requesting IP mapped by `XXX` value
- [ ] api.json: return IP used to resolve `XXX`
- [ ] any access w/o `XXX` -> redirect to `UUID.which.resolve.rs/index.html`
- [ ] optional forward DNS

