// Imports the Google Cloud client library
const Vision = require('@google-cloud/vision');

function getLabels(fileName) {

    // Creates a client
    const vision = new Vision.ImageAnnotatorClient();
    var res = [];

    var x = vision.labelDetection(fileName)
        .then((results) => {

            const labels = results[0].labelAnnotations;

            labels.forEach(function(label){
                if(label.description !== "dish"
                    && label.description !== "food"){
                    res.push(label.description)
                }
            });

            //console.log(res);
            res = res.slice(0,3);
            console.log(res);
            return res;
        })
        .catch((err) => {
            console.error('ERROR:', err);
        });

    return x;

};


// var test = getLabels("https://www.browneyedbaker.com/wp-content/uploads/2016/06/blueberry-muffins-23-600.jpg");
// console.log(test);

module.exports = getLabels;
