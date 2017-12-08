function getIngredients(recipeName) {
  const oReq = new XMLHttpRequest();
  oReq.addEventListener("load", function(response) {
    console.log(response);
  });

  oReq.open("GET", "https://api.chefkoch.de/v2/recipes?descendCategories=1&order=0&minimumRating=0&maximumTime=0&query=" + recipeName + "&limit=25&orderBy=2");
  oReq.send();
}

getIngredients("chili con carne");
