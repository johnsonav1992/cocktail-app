const {
	getDrinksByLetter,
	addFavorite,
	deleteFavorite,
	getFavorites,
	getHomePage,
	getDrinkByIngredient,
	searchDrinkByName,
	getDrinkById,
} = require('./controller.js')
const { seed } = require('./seedDb')

module.exports = app => {
	app.get('/drinks/letter/:letter', getDrinksByLetter)
	app.get('/drinks/ingredient/:ingredient', getDrinkByIngredient)
	app.get('/drinks/name/:name', searchDrinkByName)
	app.get('/drinks/id/:id', getDrinkById)
	app.get('/drinks', getFavorites)
	app.post('/seed', seed)
	app.post('/drinks/favorites', addFavorite)
	app.delete('/drinks/favorites/:drinkId', deleteFavorite)
}
