const { getDrinksByLetter, addFavorite, deleteFavorite } = require('./controller.js')
const { seed } = require('./seedDb')

module.exports = (app) => {
    app.post('/seed', seed)
    app.get(`/drinks/:letter`, getDrinksByLetter)
    app.post(`/drinks/favorites`, addFavorite)
    app.delete(`/drinks/favorites/:drinkId`, deleteFavorite)
}