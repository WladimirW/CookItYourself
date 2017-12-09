"use strict";

const express   = require("express"),
      router    = express.Router(),
      _         = require("lodash"),
      request   = require("request-promise"),
      bodyParser = require("body-parser"),
      getLabels = require("../googleImageSearch");

router.get("/recipeData", function (req, res, next) {
  const recipeName = req.query.recipeName;

  getRecipeFromLabel(recipeName)
    .then(res.json);
});

function replaceAll(target, search, replacement)
{
    return target.replace(new RegExp(search, 'g'), replacement);
}

let rawParser = bodyParser.raw({limit: 500000});
router.post("/recipeNames2", rawParser, (req, res, next) => {
var path = require("path");
var fs = require("fs");
const uploadDir = path.join(__dirname, '/../..', '/uploads/');
fs.writeFile(uploadDir + replaceAll(new Date().toISOString(),":",".") + ".img.jpg", req.body, "binary", function(err) 
{
if(err)
  console.log(JSON.stringify(err));
console.log("ok");
});

var result = {
  "responses": [
    {
      "labelAnnotations": [
        {
          "mid": "/m/02y6n",
          "description": "french fries",
          "score": 0.98349416
        },
        {
          "mid": "/m/02q08p0",
          "description": "dish",
          "score": 0.9484921
        },
        {
          "mid": "/m/07l8p5",
          "description": "side dish",
          "score": 0.87812835
        }
      ]
    }
  ]
};
res.json(result);
});

router.post("/recipeNames", (req, res, next) => {
  let labelResults;

  getLabels(req.body.imageUrl)
    .then(results => {
      labelResults = results;

      return getRecipeFromLabel(labelResults[0]);
    })
    .then(result => result || getRecipeFromLabel(labelResults[1]))
    .then(result => result || getRecipeFromLabel(labelResults[2]))
    .then(result => res.json(result))
    .catch(err => console.log(err));
});

router.get("/recipeFromId", (req, res, next) => {
  getRecipeFromId(req.query.recipeId)
    .then(result => res.json(result))
    .catch(err => console.log(err));
});

router.get("/topoftheday", (req, res, next) => {
  let ids;

  request({ uri: "https://api.chefkoch.de/v2/recipes/oftheday", qs: { limit: 3 }, json: true })
    .then(results => {
      ids = results.results.map(result => result.recipe.id);

      return Promise.all(ids.map(id =>
        request({
          uri: "https://api.chefkoch.de/v2/aggregations/recipe/screen/" + id,
          json: true
        })
      ));
    })
    .then(results => {
      const imageIds = results.map(result => result.recipeImages[0].id);

      const urls = imageIds.map((imageId, index) => "https://api.chefkoch.de/v2/recipes/" + ids[index] + "/images/" + imageId + "/fit-960x720");
      res.json({ ids: ids, urls: urls });
    });
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
      const recipeId = _.get(response, "results[0].recipe.id");

      return recipeId ? getRecipeFromId(recipeId) : null;
    });
}

function getRecipeFromId(recipeId) {
  return request({
    uri: "https://api.chefkoch.de/v2/aggregations/recipe/screen/" + recipeId,
    json: true
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
        title: recipe.title,
        instructions: recipe.instructions,
        ingredientGroups: processedIngredientGroups
      };
    });

}

module.exports = router;
