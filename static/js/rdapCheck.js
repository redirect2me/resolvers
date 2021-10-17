function rdapCheck(domain, el) {
  console.log(`domain=${domain}`);
  $.ajax({
      cache: 'no-cache',
      data: { name: domain, type: "NS", do: "1" },
      dataType: 'json',
      error: function (xhr, status, err) {
          $(el).empty()
              .append($("<img>").attr("src", "/images/16x16/cross-circle.png").addClass("pr-2"))
              .append($("<span>").text("server error"));
      },
      method: "GET",
      success: function (data, status, xhr) {
          console.log("data=" + JSON.stringify(data));
          if (data.Status != 0) {
              $(el).empty()
                  .append($("<img>").attr("src", "/images/16x16/exclamation-red.png").addClass("pr-2"))
                  .append($("<span>").text(data.message));
          }
          else {
              const nameservers = [];
              for (const answer of data.Answer) {
                  if (answer.type == 2) {
                      nameservers.push(answer.data);
                  }
              }
              $(el).empty()
                  .append($("<img>").attr("src", "/images/16x16/tick.png").addClass("pr-2"))
                  .append($("<span>").text(nameservers.join(', ')));
          }
      },
      timeout: 15000,
      url: 'https://dns.google/resolve'
  });
}