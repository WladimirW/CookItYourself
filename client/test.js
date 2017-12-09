"use strict";

$(document).ready(function () {
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

      $("#recipeContainer").append("<h2>" + data.title + "</h2>");
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

  $.ajax({
    url: "http://localhost:3000/topoftheday",
    beforeSend: function (xhrObj) {
      xhrObj.setRequestHeader("Content-Type", "application/json");
    },
    type: "GET",
    dataType: "json",
    processData: true
  })
    .done(data => {
      data.ids.forEach((id, index) => {
        $("#recipesOfTheDayContainer").append("<img class=\"topOfTheDayImage\" id=\"" + id + "\" src=\"" + data.urls[index] + "\" />");
      });

      setTimeout(() => {
          console.log($(".topOfTheDayImage"));
          $(".topOfTheDayImage").each(function() {
            console.log($(this));
            var recipeId = $(this).attr("id");
            $(this).click(() => {
              console.log("image clicked");


              let req = {
                url: "http://localhost:3000/recipeFromId?recipeId=" + recipeId,
                beforeSend: function (xhrObj) {
                  xhrObj.setRequestHeader("Content-Type", "application/json");
                },
                type: "GET",
                dataType: "json",
                processData: true
              };
              $.ajax(req).done(data => {
                $("#recipeContainer").css("display", "block");
                $("#recipeContainer").empty();

                $("#recipeContainer").append("<h2>" + data.title + "</h2>");
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
        }
        , 500);

    })
    .fail(error => console.log(error));

});
