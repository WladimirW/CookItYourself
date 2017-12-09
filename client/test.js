$(document).ready(function() {
  $("#submitImageUrl").click(function () {
    let imageUrl = $("#imageUrl").value;

    console.log("in handler");
    console.log(imageUrl);

    let req = {
      url: "http://localhost:3000/recipeNames",
      beforeSend: function (xhrObj) {
        xhrObj.setRequestHeader("Content-Type", "application/text");
      },
      type: "POST",
      data: imageUrl,
      processData: false
    };
    $.ajax(req).done(data => console.log(data))
      .fail(error => console.log(error));
  });
});
