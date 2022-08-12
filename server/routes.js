const { getDrinksByLetter, addFavorite } = require('./controller.js')

module.exports = (app) => {
    app.get(`/drinks/:letter`, getDrinksByLetter)
    app.post(`/drinks/favorites`, addFavorite)
}