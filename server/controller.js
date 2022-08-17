const axios = require('axios')
require('dotenv').config()
const Sequelize = require('sequelize')
const { DATABASE_URL } = process.env 
const path = require('path')
    
const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})

const GENERIC_COCKTAIL_URL =
	'https://www.thecocktaildb.com/api/json/v1/1/search.php?f='

module.exports = {
    getHomePage: (req, res) => {
        res.sendFile(path.join(__dirname, '../client/index.html'))
    },

    getCSS: (req, res) => {
        res.sendFile(path.join(__dirname, '../styles.css'))
    },

    getJS: (req, res) => {
        res.sendFile(path.join(__dirname, '../cocktails.js'))
    },

    getDrinksByLetter: (req, res) => {
        let { letter } = req.params

        axios.get(`${GENERIC_COCKTAIL_URL}${letter}`)
            .then(response => {
                res.status(200).send(response.data)
            })
            .catch(err => console.log(err))
    },

    addFavorite : (req, res) => {
        let { id, name, letter } = req.body

        sequelize.query(`
        INSERT INTO favorite_drinks (drink_id, drink_name, drink_letter)
        VALUES (?, ?, ?)`, { replacements: [id, name, letter] })
        .then(dbRes => {
            res.status(200).send({...dbRes[0], id, name, letter})
        })
        .catch(err => console.log(err))
    },

    deleteFavorite: (req, res) => {
        let { drinkId } = req.params
        
        sequelize.query(`
        DELETE FROM favorite_drinks 
        WHERE drink_id = ?`, { replacements: [ drinkId ] })
        .then(dbRes => {
            res.status(200).send({...dbRes[0], drinkId})
        })
        .catch(err => {
            console.error(err)
        })
    },

    getFavorites: (req, res) => {
        sequelize.query('SELECT drink_id AS id, drink_name AS name, drink_letter AS letter FROM favorite_drinks')
        .then(dbRes => {
            console.log(dbRes[0])
            res.status(200).send(dbRes[0])
        })
        .catch(err => {
            console.error(err)
        })
    }
}