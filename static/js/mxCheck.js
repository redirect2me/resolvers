//var psl = require('psl');

const ownerMap = {
    'cloudflare.net': "Cloudflare",
    "google.com": "Google",
    "googlemail.com": "Google",
    "outlook.com": "Microsoft",
}

function getOwner(domain) {

}
function getDomain(hostname) {
    console.log(hostname);
    //if (hostname.lastIndexOf('.') == hostname.length) {
    //    hostname = hostname.slice(0, -1);
    //}
    console.log(hostname);
    const parsed = psl.parse(hostname);
    if (!parsed.domain) {
        return '(unable to parse)';
    }
    return ownerMap[parsed.domain] || parsed.domain;
}

function mxCheck(domain, el) {
    console.log(`mx domain=${domain}`);
    $.ajax({
        cache: 'no-cache',
        data: { name: domain, type: "MX", do: "1" },
        dataType: 'json',
        error: function (xhr, status, err) {
            $(el).empty()
                .append($("<img>").attr("src", "/images/16x16/cross-circle.png").addClass("pe-2"))
                .append($("<span>").text("server error"));
        },
        method: "GET",
        success: function (data, status, xhr) {
            console.log("mx data=" + JSON.stringify(data));
            if (data.Status != 0) {
                $(el).empty()
                    .append($("<img>").attr("src", "/images/16x16/exclamation-red.png").addClass("pe-2"))
                    .append($("<span>").text(data.message));
            }
            else if (!data.Answer || data.Answer.length == 0) {
                $(el).empty()
                    .append($("<img>").attr("src", "/images/16x16/exclamation-red.png").addClass("pe-2"))
                    .append($("<i>").text('(not set)'));
            }
            else {
                const mxservers = $("<div>");
                let domain = '';
                for (const answer of data.Answer) {
                    if (answer.type == 15) {
                        mxservers.append($("<span>").text(answer.data));
                        mxservers.append($("<br>"));
                        if (domain == '') {
                            domain = getDomain(answer.data.split(' ')[1]);
                        }
                    }
                }
                $(el).empty()
                    //.append($("<img>").attr("src", "/images/16x16/tick.png").addClass("pe-2"))
                    .append($("<details>")
                        .append($("<summary>").text(domain))
                        .append(mxservers)
                    );
            }
        },
        timeout: 15000,
        url: 'https://dns.google/resolve'
    });
  }
function notset(el) {
    $(el).empty()
        .append($("<img>").attr("src", "/images/16x16/exclamation-red.png").addClass("pe-2"))
        .append($("<i>").text('(not set)'));
}
function spfCheck(domain, el) {
    console.log(`spf domain=${domain}`);
    $.ajax({
        cache: 'no-cache',
        data: { name: domain, type: "TXT", do: "1" },
        dataType: 'json',
        error: function (xhr, status, err) {
            $(el).empty()
                .append($("<img>").attr("src", "/images/16x16/cross-circle.png").addClass("pe-2"))
                .append($("<span>").text("server error"));
        },
        method: "GET",
        success: function (data, status, xhr) {
            console.log("spf data=" + JSON.stringify(data));
            if (data.Status != 0) {
                $(el).empty()
                    .append($("<img>").attr("src", "/images/16x16/exclamation-red.png").addClass("pe-2"))
                    .append($("<span>").text(data.message));
            }
            else if (!data.Answer || data.Answer.length == 0) {
                notset(el);
            }
            else {
                const spfrecords = [];
                for (const answer of data.Answer) {
                    if (answer.type == 16 && answer.data.startsWith("v=spf1 ")) {
                        spfrecords.push(answer.data);
                    }
                }
                if (spfrecords.length == 0) {
                    notset(el);
                } else {
                    $(el).empty()
                        .append($("<img>").attr("src", "/images/16x16/tick.png").addClass("pe-2"))
                        .append($("<span>").text(spfrecords.join(', ')));
                }
            }
        },
        timeout: 15000,
        url: 'https://dns.google/resolve'
    });
  }
  
function dmarcCheck(domain, el) {
    console.log(`dmarc domain=${domain}`);
    $.ajax({
        cache: 'no-cache',
        data: { name: `_dmarc.${domain}`, type: "TXT", do: "1" },
        dataType: 'json',
        error: function (xhr, status, err) {
            $(el).empty()
                .append($("<img>").attr("src", "/images/16x16/cross-circle.png").addClass("pe-2"))
                .append($("<span>").text("server error"));
        },
        method: "GET",
        success: function (data, status, xhr) {
            console.log("dmarc data=" + JSON.stringify(data));
            if (data.Status != 0) {
                $(el).empty()
                    .append($("<img>").attr("src", "/images/16x16/exclamation-red.png").addClass("pe-2"))
                    .append($("<span>").text(data.message));
            }
            else if (!data.Answer || data.Answer.length == 0) {
                notset(el);
            }
             else {
                const dmarcrecores = [];
                for (const answer of data.Answer) {
                    if (answer.type == 16) {
                        dmarcrecores.push(answer.data);
                    }
                }
                if (dmarcrecores.length == 0) {
                    notset(el);
                } else {
                    $(el).empty()
                        .append($("<img>").attr("src", "/images/16x16/tick.png").addClass("pe-2"))
                        .append($("<span>").text(dmarcrecores.join(', ')));
                }
            }
        },
        timeout: 15000,
        url: 'https://dns.google/resolve'
    });
  }
  