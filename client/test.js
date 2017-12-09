$(document).ready(function() {
  $("#submitImageUrl").click(function () {
    let imageUrl = $("#imageUrl").val();

    console.log("in handler");
    console.log(imageUrl);

    let req = {
      url: "http://localhost:3000/recipeNames",
      beforeSend: function (xhrObj) {
        xhrObj.setRequestHeader("Content-Type", "application/json");
      },
      type: "POST",
      data: JSON.stringify({ imageUrl: imageUrl }),
      dataType: "json",
      processData: true
    };
    $.ajax(req).done(data => console.log(data))
      .fail(error => console.log(error));
  });
});
