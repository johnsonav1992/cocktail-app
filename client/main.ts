import type {
    Drink
    , DrinkDropdownFormData
    , DrinkFavorite
    , NameDropdownFormData
} from '../types/types.ts';
import {
    addFavoriteDrink
    , deleteFavoriteDrink
    , getDrinkById
    , getDrinkByName
    , getDrinksByIngredient
    , getDrinksByLetter
    , getFavorites
    , getRandomCocktail
} from './services.js';

//// GLOBAL SELECTORS /////
const favoritesBox = $<HTMLDivElement>( '.favorites-box' );

const addFavoriteButton = $<HTMLButtonElement>( '.add-favorite-btn' );
const closeButton = $<HTMLButtonElement>( '.modal-close-btn' );

const searchForm = $<HTMLFormElement>( '.search-form' );
const ingredientsForm = $<HTMLFormElement>( '.ingredients-form' );
const drinksForm = $<HTMLFormElement>( '.drinks-form' );

const alertModal = $<HTMLDivElement>( '.alert-wrapper' );
const alertMessage = $<HTMLParagraphElement>( '.modal-message' );

const ingredientInput = $<HTMLInputElement>( '.ingredient-input' );
const ingredientsDropdown = $<HTMLSelectElement>( '.ingredients-dropdown' );
const lettersDropdown = $<HTMLSelectElement>( '.letters-dropdown' );
const drinkDropdown = $<HTMLSelectElement>( '.drink-dropdown' );

////// GLOBAL LISTENERS ///////
addFavoriteButton.on( { click: addFavorite } );
closeButton.on( {
    click: () => {
        alertMessage.text( '' );
        alertModal.addClass( 'hide' );
    }
} );

searchForm.on( { submit: getAndLoadDrinkByName } );
ingredientsForm.on( { submit: submitDrinkForm } );
drinksForm.on( { submit: submitDrinkForm } );

ingredientInput.on( { keyup: searchForDrinksByIngredient } );
ingredientsDropdown.on( { change: () => ingredientsForm.trigger( 'submit' ) } );
drinkDropdown.on( { change: () => drinksForm.trigger( 'submit' ) } );
lettersDropdown.on( 'change', e => {
    const letter = e.target.value;

    getDrinksByLetter( letter )
        .then( drinks => populateDropdown( '.drink-dropdown', drinks ) );
} );

// Invoke app start functions
( async function appStart () {
    try {
        const drinks = await getDrinksByLetter( 'a' );
        const initialDrink = drinks[ 15 ];

        // other init fns
        renderFavoritesOnLoad();
        populateLettersDropdown();
        setupRandomCocktail();

        if ( initialDrink ) renderCocktail( initialDrink );
    } catch ( err ) {
        console.log( err );
    }
} )();

function renderFavoritesOnLoad () {
    getFavorites()
        .then( favorites => favorites.forEach( drink => appendFavorite( drink ) ) )
        .catch( err => console.error( err ) );
}

function renderCocktail ( drink: Drink ) {
    if ( !drink ) return;

    const {
        idDrink: id
        , strDrink: name
        , strDrinkThumb: picture
        , strGlass: glass
        , strInstructions: instructions
    } = drink;

    $( '.id-holder' ).attr( 'id', id );
    $( '.drink-name' ).text( name );
    $( '.drink-image' ).attr( 'src', picture );
    $( '.ingredients-title' ).text( 'Ingredients' );
    $( '.glass-name' ).text( `Glass: ${ glass }` );
    $( '.directions-card' ).text( instructions );

    $( '.ingredient' ).detach(); // remove prev. drink ingredients before repopulating

    const numOfIngredients = 15;

    for ( let i = 1; i <= numOfIngredients; i++ ) {
        const currentIngredient = `strIngredient${ i }` as keyof Drink;
        const currentMeasure = `strMeasure${ i }` as keyof Drink;

        if (
            drink[ currentIngredient ] == null
			|| drink[ currentIngredient ] === ''
        ) break;

        if ( drink[ currentMeasure ] == null ) drink[ currentMeasure ] = '';

        const ingredient = $<HTMLLIElement>( '<li></li>' );

        ingredient.html(
            `
                ${ drink[ currentMeasure ] } 
                ${ drink[ `strIngredient${ i }` as keyof Drink ] }
            `
        );

        ingredient.addClass( 'ingredient' );
        $( '.ingredients-list' ).append( ingredient );
    }
}

function setupRandomCocktail () {
    $<HTMLButtonElement>( '.random-cocktail' ).on( {
        click: () => getRandomCocktail()
            .then( cocktail => renderCocktail( cocktail ) )
    } );
}

function getAndLoadDrinkByName ( e: SubmitEvent ) {
    e.preventDefault();
    const { name: drinkName } = getFormData<NameDropdownFormData>( e.target as HTMLFormElement );

    getDrinkByName( drinkName )
        .then( drink => {
            if ( !drink ) {
                return alertUser(
                    'That drink does not exist or was spelled incorrectly. Please try again!'
                );
            }

            renderCocktail( drink );
        } )
        .catch( err => console.log( err ) );

    $( 'name-input' ).val( '' );
}

function getAndLoadDrinkById ( id: string ) {
    getDrinkById( id )
        .then( drink => renderCocktail( drink ) )
        .catch( err => console.log( err ) );
}

function searchForDrinksByIngredient ( e: KeyboardEvent ) {
    e.preventDefault();
    const ingredient = ( e.target as HTMLInputElement )?.value.trim();

    ingredient && ingredientSearch( ingredient );
}

const ingredientSearch = debounce(
    ( ingredient: string ) =>
        getDrinksByIngredient( ingredient )
            .then( drinks => {
                populateDropdown(
                    '.ingredients-dropdown'
                    , drinks
                );
            } )
            .catch( err => console.log( err ) )
    , 500 );

function submitDrinkForm ( e: SubmitEvent ) {
    e.preventDefault();
    const { drink: drinkId } = getFormData<DrinkDropdownFormData>( e.target as HTMLFormElement );

    if ( drinkId ) getAndLoadDrinkById( drinkId );
}

function populateLettersDropdown () {
    const alpha = [
        'A', 'B', 'C', 'D', 'E', 'F'
        , 'G', 'H', 'I', 'J', 'K', 'L'
        , 'M', 'N', 'O', 'P', 'Q', 'R'
        , 'S', 'T', 'U', 'V', 'W', 'X'
        , 'Y', 'Z'
    ];

    for ( let i = 0; i < alpha.length; i++ ) {
        lettersDropdown.append( new Option(
            alpha[ i ],
            alpha[ i ]?.toLowerCase()
        ) );
    }
}

function addFavorite () {
    const drinkId = $( '.id-holder' ).attr( 'id' ) as string;
    const drinkName = $( '.drink-name' ).text();
    const drinkLetter = drinkName.charAt( 0 ).toLowerCase();

    for ( let i = 0; i < favoritesBox.children.length; i++ ) {
        const currentDrinkId = favoritesBox.children().eq( i ).attr( 'id' );

        if ( Number( currentDrinkId ) === +drinkId )
            return alertUser( 'You\'ve already added that drink!' );
    }

    const listItemLength = favoritesBox.children().length;

    if ( listItemLength >= 10 )
        return alertUser( 'You have reached the max amount of favorites!' );

    const drinkFavorite: DrinkFavorite = {
        id: drinkId
        , name: drinkName
        , letter: drinkLetter
    };

    addFavoriteDrink( drinkFavorite )
        .then( drinkFavorite => appendFavorite( drinkFavorite ) )
        .catch( error => {
            console.log( error );
        } );
}

function appendFavorite ( drinkFavorite: DrinkFavorite ) {
    const {
        id
        , name
    } = drinkFavorite;

    const favoriteLi = $( '<li></li>' );
    favoriteLi.addClass( 'favorite' );
    favoriteLi.attr( 'id', id );

    favoriteLi.html( `
        <h3 class="fave-name">${ name }</h3>
        <div class="button-container">
            <button class="button load">Load</button>
            <button class="delete-btn button"><strong>✘</strong></button>
        </div>
    ` );

    favoriteLi
        .find<HTMLButtonElement>( '.load' )
        .on( { click: () => getAndLoadDrinkById( id ) } );

    favoriteLi
        .find<HTMLButtonElement>( '.delete-btn' )
        .on( { click: () => deleteFavorite( id ) } );

    favoritesBox?.append( favoriteLi );
}

function deleteFavorite ( drinkId: string ) {
    deleteFavoriteDrink( drinkId )
        .then( id => {
            const drinkToDelete = favoritesBox.children( `#${ id }` );

            drinkToDelete
                .addClass( 'fall' )
                .on( 'transitionend'
                    , () => drinkToDelete.remove()
                );
        } )
        .catch( err => {
            console.log( err );
        } );
}

function alertUser ( message: string ) {
    alertMessage.text( message );
    alertModal.removeClass( 'hide' );
}

//// UTILS ////
function populateDropdown ( selector: string, drinks: Drink[] | undefined ) {
    if ( !drinks ) return;

    $( '.option' ).detach(); //remove old options before repopulating

    appendDrinkSelectOptions(
        $<HTMLSelectElement>( selector )
        , drinks
    );

    const firstDrink = drinks[ 0 ];

    firstDrink && renderCocktail( firstDrink );
}

function appendDrinkSelectOptions ( selectEl: JQuery<HTMLSelectElement>, drinks: Drink[] ) {
    for ( let i = 0; i < drinks.length; i++ ) {
        const option = $( '<option></option>' );
        option.addClass( 'option' );
        option.text( drinks[ i ]?.strDrink as string );
        option.val( drinks[ i ]?.idDrink as string );
        selectEl.append( option );
    }
}

function debounce<T extends ( ...args: never[] ) => void>( func: T, wait: number ): ( ...args: Parameters<T> ) => void {
    let timeout: ReturnType<typeof setTimeout>;

    return function ( ...args: Parameters<T> ): void {
        const later = () => {
            clearTimeout( timeout );
            func( ...args );
        };

        clearTimeout( timeout );
        timeout = setTimeout( later, wait );
    };
}

function getFormData <TData> ( form: HTMLFormElement ) {
    return Object.fromEntries( new FormData( form ) ) as TData;
}
