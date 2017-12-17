# CookItYourself

<p align="center">
  <img src="page.png" width="400"/>
</p>

CookItYourself is a neat web app which transforms pictures of food (or single ingredients) into recipes.

It uses image recognition—powered by Google Cloud Platform—to fetch matching recipes from [Chefkoch](http://chefkoch.de).

The app was created by an amazing team at a hackathon in Karlsruhe, Germany (sponsored by [real.digital](http://real.digital/)), winning the first prize.
[Read the full story here!](https://pioniergarage.de/2017/hck-e-food-hackathon/) (German)

## How to run

Prerequisites: You need node.js installed.
Additionally, you must have a valid private key file (JSON format) for Google Cloud Platform.
Please see [this guide](https://cloud.google.com/docs/authentication/getting-started) for instructions on how to get this.

1. Clone this repo
2. `cd server`
3. `npm install`
4. `GOOGLE_APPLICATION_CREDENTIALS=<path to your private key file> node bin/www`
5. Open `index_.html` (in `client` directory) in Browser (yes, the one with the dash, sorry!)

(Warning: This code should be treated as a hacky PoC and is not suitable for production.)
