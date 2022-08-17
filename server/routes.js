const { getDrinksByLetter, addFavorite, deleteFavorite, getFavorites, getHomePage } = require('./controller.js')
const { seed } = require('./seedDb')

module.exports = (app) => {
    app.get('/', getHomePage)
    app.post('/seed', seed)
    app.get(`/drinks/:letter`, getDrinksByLetter)
    app.get(`/drinks`, getFavorites)
    app.post(`/drinks/favorites`, addFavorite)
    app.delete(`/drinks/favorites/:drinkId`, deleteFavorite)
}