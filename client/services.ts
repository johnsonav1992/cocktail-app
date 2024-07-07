import type {
    DeleteFavoriteRes
    , DrinkFavorite
    , DrinksRes
    , IngredientsDrinkRes
    , SingleDrinkRes
} from '../types/types.js';

declare const axios: import( 'axios' ).AxiosStatic;

export async function getDrinksByLetter ( letter: string ) {
    return axios
        .get<DrinksRes>( `/drinks/letter/${ letter }` )
        .then( res => res.data.drinks );
}

export async function getDrinkById ( id: string ) {
    return axios
        .get<SingleDrinkRes>( `/drinks/id/${ id }` )
        .then( res => res.data.drinks[ 0 ] );
}

export async function getDrinkByName ( drinkName: string ) {
    return axios
        .get<SingleDrinkRes>( `/drinks/name/${ drinkName }` )
        .then( res => res.data.drinks[ 0 ] );
}

export async function getDrinksByIngredient ( ingredient: string ) {
    return axios
        .get<IngredientsDrinkRes>( `/drinks/ingredient/${ ingredient }` )
        .then( res => res.data.drinks );
}

export async function getRandomCocktail () {
    return axios
        .get<SingleDrinkRes>( 'https://www.thecocktaildb.com/api/json/v1/1/random.php' )
        .then( res => res.data.drinks[ 0 ] );
}

export async function getFavorites () {
    return axios
        .get<DrinkFavorite[]>( '/drinks' )
        .then( res => res.data );
}

export async function addFavoriteDrink ( drinkFavorite: DrinkFavorite ) {
    return axios
        .post<DrinkFavorite>( '/drinks/favorites', drinkFavorite )
        .then( res => res.data );
}

export async function deleteFavoriteDrink ( id: string ) {
    return axios
        .delete<DeleteFavoriteRes>( `/drinks/favorites/${ id }` )
        .then( res => res.data.id );
}
