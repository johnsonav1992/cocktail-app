export async function getDrinksByLetter(letter) {
    return axios
        .get(`/drinks/letter/${letter}`)
        .then(res => res.data.drinks);
}
export async function getDrinkById(id) {
    return axios
        .get(`/drinks/id/${id}`)
        .then(res => res.data.drinks[0]);
}
export async function getDrinkByName(drinkName) {
    return axios
        .get(`/drinks/name/${drinkName}`)
        .then(res => res.data.drinks[0]);
}
export async function getDrinksByIngredient(ingredient) {
    return axios
        .get(`/drinks/ingredient/${ingredient}`)
        .then(res => res.data.drinks);
}
export async function getRandomCocktail() {
    return axios
        .get('https://www.thecocktaildb.com/api/json/v1/1/random.php')
        .then(res => res.data.drinks[0]);
}
export async function getFavorites() {
    return axios
        .get('/drinks')
        .then(res => res.data);
}
export async function addFavoriteDrink(drinkFavorite) {
    return axios
        .post('/drinks/favorites', drinkFavorite)
        .then(res => res.data);
}
export async function deleteFavoriteDrink(id) {
    return axios
        .delete(`/drinks/favorites/${id}`)
        .then(res => res.data.id);
}
//# sourceMappingURL=services.js.map