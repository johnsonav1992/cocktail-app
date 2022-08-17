const { getDrinksByLetter, addFavorite, deleteFavorite, getFavorites, getHomePage, getCSS, getJS } = require('./controller.js')
const { seed } = require('./seedDb')

module.exports = (app) => {
    app.get('/', getHomePage)
    app.get('/css', getCSS)
    app.get('/js', getJS)
    app.post('/seed', seed)
    app.get(`/drinks/:letter`, getDrinksByLetter)
    app.get(`/drinks`, getFavorites)
    app.post(`/drinks/favorites`, addFavorite)
    app.delete(`/drinks/favorites/:drinkId`, deleteFavorite)
}