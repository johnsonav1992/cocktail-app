import {
    getDrinksByLetter
    , addFavorite
    , deleteFavorite
    , getFavorites
    , getDrinkByIngredient
    , searchDrinkByName
    , getDrinkById
} from './controller.js';
import { seed } from './seedDb.js';

export default app => {
    app.get( '/drinks/letter/:letter', getDrinksByLetter );
    app.get( '/drinks/ingredient/:ingredient', getDrinkByIngredient );
    app.get( '/drinks/name/:name', searchDrinkByName );
    app.get( '/drinks/id/:id', getDrinkById );
    app.get( '/drinks', getFavorites );
    app.post( '/seed', seed );
    app.post( '/drinks/favorites', addFavorite );
    app.delete( '/drinks/favorites/:drinkId', deleteFavorite );
};
