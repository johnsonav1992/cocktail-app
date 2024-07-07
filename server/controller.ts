import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';
import type {
    RequestHandler
    , Response
} from 'express';
import path from 'path';
import {
    DatabaseError
    , Sequelize
} from 'sequelize';
import type {
    Drink
    , DrinkFavorite
} from '../types/types.js';

dotenv.config();
const { DATABASE_URL } = process.env;

const sequelize = new Sequelize( DATABASE_URL!, {
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

export const getHomePage: RequestHandler = ( req, res ) => {
    res.sendFile( path.join( __dirname, '../client/index.html' ) );
};

export const getDrinksByLetter: RequestHandler<{ letter: string }> = ( req, res ) => {
    const { letter } = req.params;

    axios.default
        .get<Drink[]>( `${ LETTER_COCKTAIL_URL }${ letter }` )
        .then( response => {
            res
                .status( 200 )
                .json( response.data );
        } )
        .catch( ( err: AxiosError ) => handleAxiosError( err, res ) );
};

export const getDrinkByIngredient: RequestHandler<{ ingredient: string }> = ( req, res ) => {
    const { ingredient } = req.params;

    axios.default
        .get( `${ INGREDIENT_COCKTAIL_URL }${ ingredient }` )
        .then( response => {
            res.status( 200 ).send( response.data );
        } )
        .catch( ( err: AxiosError ) => handleAxiosError( err, res ) );
};

export const searchDrinkByName: RequestHandler<{ name: string }> = ( req, res ) => {
    const { name } = req.params;

    axios.default
        .get( `${ NAME_COCKTAIL_URL }${ name }` )
        .then( response => {
            res.status( 200 ).send( response.data );
        } )
        .catch( ( err: AxiosError ) => handleAxiosError( err, res ) );
};

export const getDrinkById: RequestHandler<{ id: string }> = ( req, res ) => {
    const { id } = req.params;

    axios.default
        .get( `${ ID_COCKTAIL_URL }${ id }` )
        .then( response => {
            res.status( 200 ).send( response.data );
        } )
        .catch( ( err: AxiosError ) => handleAxiosError( err, res ) );
};

export const addFavorite: RequestHandler<DrinkFavorite> = ( req, res ) => {
    const {
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
        .then( () => {
            res
                .status( 200 )
                .json( {
                    id
                    , name
                    , letter
                } );
        } )
        .catch( ( err: DatabaseError ) => handleDbError( err, res ) );
};

export const deleteFavorite: RequestHandler<{ drinkId: string }> = ( req, res ) => {
    const { drinkId } = req.params;

    sequelize
        .query(
            `
        DELETE FROM favorite_drinks 
        WHERE drink_id = ?`,
            { replacements: [ drinkId ] }
        )
        .then( () => {
            res
                .status( 200 )
                .send( { id: drinkId } );
        } )
        .catch( ( err: DatabaseError ) => handleDbError( err, res ) );
};

export const getFavorites: RequestHandler = ( req, res ) => {
    sequelize
        .query(
            'SELECT drink_id AS id, drink_name AS name, drink_letter AS letter FROM favorite_drinks'
        )
        .then( dbRes => {
            res
                .status( 200 )
                .send( dbRes[ 0 ] );
        } )
        .catch( ( err: DatabaseError ) => handleDbError( err, res ) );
};

const handleDbError = ( err: DatabaseError, res: Response ) => {
    console.log( err.message );

    res
        .status( 500 )
        .json( { message: 'An error occurred on the server. Please try again.' } );
};

const handleAxiosError = ( err: AxiosError, res: Response ) => {
    console.log( err );

    res
        .status( +err.code! )
        .json( err );
};
