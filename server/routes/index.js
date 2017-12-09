"use strict";

const express   = require("express"),
      router    = express.Router(),
      _         = require("lodash"),
      request   = require("request-promise"),
      getLabels = require("../googleImageSearch");

router.get("/recipeData", function (req, res, next) {
  const recipeName = req.query.recipeName;

  getRecipeFromLabel(recipeName)
    .then(res.json);
});

router.post("/recipeNames", (req, res, next) => {
  getLabels(req.body.imageUrl)
    .then(results => getRecipeFromLabel(results[0]))
    .then(result => res.json(result))
    .catch(err => console.log(err));
});

function getRecipeFromLabel(label) {
  return request({
    uri: "https://api.chefkoch.de/v2/recipes",
    qs: {
      descendCategories: 1,
      order: 0,
      minimumRating: 3,
      maximumTime: 0,
      query: label,
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


      return {
        instructions: recipe.instructions,
        ingredientGroups: processedIngredientGroups
      };
    });
}

module.exports = router;
