import pkg from 'axios';
const { AxiosError } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { DatabaseError, Sequelize } from 'sequelize';
dotenv.config();
const { DATABASE_URL } = process.env;
const axios = pkg.default;
const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
});
const LETTER_COCKTAIL_URL = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?f=';
const INGREDIENT_COCKTAIL_URL = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=';
const NAME_COCKTAIL_URL = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=';
const ID_COCKTAIL_URL = 'https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=';
export const getHomePage = (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
};
export const getDrinksByLetter = (req, res) => {
    const { letter } = req.params;
    axios
        .get(`${LETTER_COCKTAIL_URL}${letter}`)
        .then(response => {
        res
            .status(200)
            .json(response.data);
    })
        .catch((err) => handleAxiosError(err, res));
};
export const getDrinkByIngredient = (req, res) => {
    const { ingredient } = req.params;
    axios
        .get(`${INGREDIENT_COCKTAIL_URL}${ingredient}`)
        .then(response => {
        res.status(200).send(response.data);
    })
        .catch((err) => handleAxiosError(err, res));
};
export const searchDrinkByName = (req, res) => {
    const { name } = req.params;
    axios
        .get(`${NAME_COCKTAIL_URL}${name}`)
        .then(response => {
        res.status(200).send(response.data);
    })
        .catch((err) => handleAxiosError(err, res));
};
export const getDrinkById = (req, res) => {
    const { id } = req.params;
    axios
        .get(`${ID_COCKTAIL_URL}${id}`)
        .then(response => {
        res.status(200).send(response.data);
    })
        .catch((err) => handleAxiosError(err, res));
};
export const addFavorite = (req, res) => {
    const { id, name, letter } = req.body;
    sequelize
        .query(`
        INSERT INTO favorite_drinks (drink_id, drink_name, drink_letter)
        VALUES (?, ?, ?)`, { replacements: [id, name, letter] })
        .then(() => {
        res
            .status(200)
            .json({
            id,
            name,
            letter
        });
    })
        .catch((err) => handleDbError(err, res));
};
export const deleteFavorite = (req, res) => {
    const { drinkId } = req.params;
    sequelize
        .query(`
        DELETE FROM favorite_drinks 
        WHERE drink_id = ?`, { replacements: [drinkId] })
        .then(() => {
        res
            .status(200)
            .send({ id: drinkId });
    })
        .catch((err) => handleDbError(err, res));
};
export const getFavorites = (req, res) => {
    sequelize
        .query('SELECT drink_id AS id, drink_name AS name, drink_letter AS letter FROM favorite_drinks')
        .then(dbRes => {
        res
            .status(200)
            .send(dbRes[0]);
    })
        .catch((err) => handleDbError(err, res));
};
const handleDbError = (err, res) => {
    console.log(err.message);
    res
        .status(500)
        .json({ message: 'An error occurred on the server. Please try again.' });
};
const handleAxiosError = (err, res) => {
    console.log(err);
    res
        .status(+err.code)
        .json(err);
};
//# sourceMappingURL=controller.js.map