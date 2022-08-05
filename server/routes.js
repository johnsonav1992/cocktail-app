const { getDrinksByLetter, getRandomCocktail } = require('./controller.js')

module.exports = (app) => {
    app.get(`/drinks/:letter`, getDrinksByLetter)
}