"use strict";

$(document).ready(function() {
  $("#imageUrlSubmit").click(function () {
    let imageUrl = $("#imageUrlInput").val();
    $("#imageUrlContainer").css("background-image", "url(\"" + imageUrl + "\")");

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
    $.ajax(req).done(data => {
      $("#recipeContainer").css("display", "block");
      $("#recipeContainer").empty();

      $("#recipeContainer").append("<h2>" + data.title + "</h2>")
      data.ingredientGroups.forEach(ingredientGroup => {
        let ingredientString = "";
        ingredientGroup.ingredients.forEach(ingredient => {
          ingredientString += "<tr><td>" + (ingredient.amount ? ingredient.amount + " " : "") + ingredient.unit + " " + ingredient.name + "</td></tr>";
        });

        $("#recipeContainer").append("<table>" + ingredientString + "</table>");
      });

      $("#recipeContainer").append("<p>" + data.instructions + "</p>");
    })
      .fail(error => console.log(error));
  });
});
