import dotenv from 'dotenv';
import type { RequestHandler } from 'express';
import { Sequelize } from 'sequelize';
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

export const seed: RequestHandler = ( req, res ) => {
    sequelize.query( `
        DROP TABLE IF EXISTS favorite_drinks;

        CREATE TABLE favorite_drinks (
          favorite_id SERIAL PRIMARY KEY,
          drink_id INT NOT NULL,
          drink_name varchar(120) NOT NULL,
          drink_letter varchar(120) NOT NULL
        );
        ` )
        .then( () => {
            console.log( 'Database seeded' );
            res.sendStatus( 200 );
        } ).catch( err => console.log( 'error seeding database', err ) );
};
