# To Do

* timeouts (and timing) on dns-check
* multiple simultaneous checks for dns-check
* tile on VLZ for redirect2me
* DNS check for all ips of a specific resolver
* tags for open resolvers
* descriptions for open resolvers
* data/xxx.md with details for each open resolvers
* github issue template for new resolvers
* link on resolvers-index to contribute
* CONTRIBUTING.md
* docker-run.sh
* where am I?
* where are you?
* what resolvers are you using?
* JSON schema for resolvers
* more open resolvers
* option to do reverse-dns on resolved IP addresses

## Open Resolvers

* https://public-dns.info/
* DNSFilter, Neustar, Norton, NuSec, SafeDNS
* https://www.verisign.com/en_US/security-services/public-dns/index.xhtml

## other tools

* https://www.dnsperf.com/

## which.resolve.rs

- [ ] dns server that resolves static IP for `XXX.which.resolve.rs`
- [ ] stores requesting IP mapped by `XXX` value
- [ ] api.json: return IP used to resolve `XXX`
- [ ] any access w/o `XXX` -> redirect to `UUID.which.resolve.rs/index.html`
- [ ] robots.txt: deny all
- [ ] favicon.ico/svg
- [ ] status.json
- [ ] additional formats: txt, jsonp, html
- [ ] optional forward DNS