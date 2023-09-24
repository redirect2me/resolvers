function mxCheck(domain, el) {
  $.ajax({
      cache: 'no-cache',
      data: { domain },
      dataType: 'jsonp',
      error: function (xhr, status, err) {
          $(el).empty()
              .append($("<img>").attr("src", "/images/16x16/cross-circle.png").addClass("pe-2"))
              .append($("<span>").text("server error"));
      },
      method: "GET",
      success: function (data, status, xhr) {
          console.log("data=" + JSON.stringify(data));
          if (!data.success) {
              $(el).empty()
                  .append($("<img>").attr("src", "/images/16x16/exclamation-red.png").addClass("pe-2"))
                  .append($("<span>").text(data.message));
          }
          else {
              $(el).empty()
                  //.append($("<img>").attr("src", "/images/16x16/tick.png").addClass("pe-2"))
                  .append($("<details>")
                      .append($("<summary>").text(data.message))
                      .append($("<pre>").text(JSON.stringify(data.mailservers, null, 2)))
                  );
          }
      },
      timeout: 15000,
      url: '/dns/mx-check.json'
  });
}
