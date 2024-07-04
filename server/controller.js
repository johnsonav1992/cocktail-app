import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import Sequelize from 'sequelize';
const { DATABASE_URL } = process.env;
import path from 'path';

const sequelize = new Sequelize( DATABASE_URL, {
    dialect: 'postgres'
    , dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
} );

const LETTER_COCKTAIL_URL
	= 'https://www.thecocktaildb.com/api/json/v1/1/search.php?f=';

const INGREDIENT_COCKTAIL_URL
	= 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=';

const NAME_COCKTAIL_URL = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=';

const ID_COCKTAIL_URL = 'https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=';

export const getHomePage = ( req, res ) => {
    res.sendFile( path.join( __dirname, '../client/index.html' ) );
};

export const getDrinksByLetter = ( req, res ) => {
    let { letter } = req.params;

    axios
        .get( `${ LETTER_COCKTAIL_URL }${ letter }` )
        .then( response => {
            res.status( 200 ).send( response.data );
        } )
        .catch( err => console.log( err ) );
};

export const getDrinkByIngredient = ( req, res ) => {
    let { ingredient } = req.params;

    axios
        .get( `${ INGREDIENT_COCKTAIL_URL }${ ingredient }` )
        .then( response => {
            res.status( 200 ).send( response.data );
        } )
        .catch( err => console.log( err ) );
};

export const searchDrinkByName = ( req, res ) => {
    let { name } = req.params;

    axios
        .get( `${ NAME_COCKTAIL_URL }${ name }` )
        .then( response => {
            res.status( 200 ).send( response.data );
        } )
        .catch( err => console.log( err ) );
};

export const getDrinkById = ( req, res ) => {
    let { id } = req.params;

    axios
        .get( `${ ID_COCKTAIL_URL }${ id }` )
        .then( response => {
            res.status( 200 ).send( response.data );
        } )
        .catch( err => console.log( err ) );
};

export const addFavorite = ( req, res ) => {
    let {
        id
        , name
        , letter
    } = req.body;

    sequelize
        .query(
            `
        INSERT INTO favorite_drinks (drink_id, drink_name, drink_letter)
        VALUES (?, ?, ?)`,
            { replacements: [ id, name, letter ] }
        )
        .then( dbRes => {
            res.status( 200 ).send( {
                ...dbRes[ 0 ]
                , id
                , name
                , letter
            } );
        } )
        .catch( err => console.log( err ) );
};

export const deleteFavorite = ( req, res ) => {
    let { drinkId } = req.params;

    sequelize
        .query(
            `
        DELETE FROM favorite_drinks 
        WHERE drink_id = ?`,
            { replacements: [ drinkId ] }
        )
        .then( () => {
            res.status( 200 ).send( { id: drinkId } );
        } )
        .catch( err => {
            console.error( err );
        } );
};

export const getFavorites = ( req, res ) => {
    sequelize
        .query(
            'SELECT drink_id AS id, drink_name AS name, drink_letter AS letter FROM favorite_drinks'
        )
        .then( dbRes => {
            console.log( dbRes[ 0 ] );
            res.status( 200 ).send( dbRes[ 0 ] );
        } )
        .catch( err => {
            console.error( err );
        } );
};
