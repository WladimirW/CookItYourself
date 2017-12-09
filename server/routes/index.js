"use strict";

const express = require("express"),
      router  = express.Router(),
      _       = require("lodash"),
      request = require("request-promise");

router.get("/recipeData", function (req, res, next) {
  const recipeName = req.query.recipeName;

  request({
    uri: "https://api.chefkoch.de/v2/recipes",
    qs: {
      descendCategories: 1,
      order: 0,
      minimumRating: 3,
      maximumTime: 0,
      query: recipeName,
      limit: 25,
      orderBy: 2
    },
    json: true
  })
    .then(response => {
      const recipeId = response.results[0].recipe.id;

      return request({
        uri: "https://api.chefkoch.de/v2/aggregations/recipe/screen/" + recipeId,
        json: true
      });
    })
    .then(response => {
      const recipe = response.recipe;

      const processedIngredientGroups = [];
      recipe.ingredientGroups.forEach(ingredientGroup => {
        processedIngredientGroups.push({
          name: ingredientGroup.header,
          ingredients: _.map(ingredientGroup.ingredients, ingredient => _.pick(ingredient, ["name", "unit", "amount"]))
        });
      });


      res.json({
        instructions: recipe.instructions,
        ingredientGroups: processedIngredientGroups
      });

      //res.json(recipe);
    });
});

router.post("/recipeNames", (req, res, next) => {
  console.log(req);

  res.json({
    "recipeNames": ["Kürbissuppe", "Knoblauchbrot"]
  });
});

module.exports = router;
