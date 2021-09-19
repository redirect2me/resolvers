function dnssecCheck(domain, el) {
  $.ajax({
      cache: 'no-cache',
      data: { domain },
      dataType: 'jsonp',
      error: function (xhr, status, err) {
          $(el).empty()
              .append($("<img>").attr("src", "/images/16x16/cross-circle.png").addClass("pr-2"))
              .append($("<span>").text("server error"));
      },
      method: "GET",
      success: function (data, status, xhr) {
          console.log("data=" + JSON.stringify(data));
          if (!data.success) {
              $(el).empty()
                  .append($("<img>").attr("src", "/images/16x16/exclamation-red.png").addClass("pr-2"))
                  .append($("<span>").text(data.message));
          }
          else {
              $(el).empty()
                  .append($("<img>").attr("src", "/images/16x16/tick.png").addClass("pr-2"))
                  .append($("<span>").text(data.message));
          }
      },
      timeout: 15000,
      url: '/dns/dnssec-check.json'
  });
}
