import type {
    DeleteFavoriteRes
    , Drink
    , DrinkFavorite
    , DrinksRes
    , SingleDrinkRes
} from '../types/types.ts';
declare const axios: import( 'axios' ).AxiosStatic;

//// GLOBAL SELECTORS /////
const addFavoriteButton = $<HTMLButtonElement>( '.add-favorite-btn' );
const favoritesBox = $<HTMLDivElement>( '.favorites-box' );
const searchForm = $<HTMLFormElement>( '.search-form' );
const ingredientsForm = $<HTMLFormElement>( '.ingredients-form' );
const alertModal = $<HTMLDivElement>( '.alert-wrapper' );
const alertMessage = $<HTMLParagraphElement>( '.modal-message' );
const closeButton = $<HTMLButtonElement>( '.modal-close-btn' );
const ingredientInput = $<HTMLInputElement>( '.ingredient-input' );

////// GLOBAL LISTENERS ///////
addFavoriteButton.on( { click: addFavorite } );
searchForm.on( { submit: getDrinkByName } );
ingredientsForm.on( {
    submit: e => {
        e.preventDefault();
        const data = getFormData<{ drink: Drink['idDrink'] }>( e.target );

        getDrinkById( data.drink );
    }
} );
ingredientInput.on( { keyup: getDrinkByIngredient } );
closeButton.on( {
    click: () => {
        alertMessage.text( '' );
        alertModal.addClass( 'hide' );
    }
} );

// Invoke app start functions
( async function appStart () {
    try {
        const cocktailRes = await axios.get<DrinksRes>( '/drinks/letter/a' );
        const initialDrink = cocktailRes.data.drinks[ 15 ];

        // other init fns
        renderFavoritesOnLoad();
        populateLettersDropdown();
        setupRandomCocktail();

        if ( initialDrink ) displayCocktail( initialDrink );
    } catch ( err ) {
        console.log( err );
    }
} )();

function displayCocktail ( drink: Drink ) {
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

        if ( drink[ currentMeasure ] == null ) {
            drink[ currentMeasure ] = '';
        }

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
        click: () => {
            axios
                .get<SingleDrinkRes>( 'https://www.thecocktaildb.com/api/json/v1/1/random.php' )
                .then( response => displayCocktail( response.data.drinks[ 0 ] ) )
                .catch( err => console.log( err ) );
        }
    } );
}

function getDrinkByName ( e: SubmitEvent ) {
    e.preventDefault();
    const nameInput = ( e.target as HTMLFormElement )[ 0 ] as HTMLInputElement;
    const drinkName = nameInput.value;

    axios
        .get<SingleDrinkRes>( `/drinks/name/${ drinkName }` )
        .then( response => {
            if ( response.data.drinks == null ) {
                return alertUser(
                    'That drink does not exist or was spelled incorrectly. Please try again!'
                );
            }
            displayCocktail( response.data.drinks[ 0 ] );
        } )
        .catch( err => console.log( err ) );

    nameInput.value = '';
}

function getDrinkByIngredient ( e: KeyboardEvent ) {
    e.preventDefault();
    const ingredient = ( e.target as HTMLInputElement )?.value;

    ingredientSearch( ingredient );
}

const ingredientSearch = debounce(
    ( ingredient: string ) => axios
        .get<DrinksRes>( `/drinks/ingredient/${ ingredient }` )
        .then( response => {
            populateIngredientsDropDown( response.data.drinks );
        } )
        .catch( err => console.log( err ) )
    , 500 );

function populateIngredientsDropDown ( drinks: Drink[] | undefined ) {
    if ( !drinks ) return;

    $( '.option' ).detach(); //remove old options before repopulating

    for ( let i = 0; i < drinks.length; i++ ) {
        const select = $<HTMLSelectElement>( '.ingredients-dropdown' );
        const option = $<HTMLOptionElement>( '<option></option>' );

        option.addClass( 'option' );

        option.text( drinks[ i ]?.strDrink as string );
        option.val( drinks[ i ]?.idDrink as string );

        select.append( option );
    }
}

function populateDrinkDropdown ( drinks: Drink[] ) {
    $( '.option' ).detach(); //remove old options before repopulating

    for ( let i = 0; i < drinks.length; i++ ) {
        const select = $<HTMLSelectElement>( '.drink-dropdown' );
        const option = $( '<option></option>' );
        option.addClass( 'option' );
        option.text( drinks[ i ]?.strDrink as string );
        option.val( drinks[ i ]?.idDrink as string );
        select.append( option );
    }

    $<HTMLFormElement>( '.drinks-form' ).on( {
        submit: e => {
            e.preventDefault();

            const select = ( e.target as HTMLFormElement )?.[ 1 ] as HTMLSelectElement;
            const opt = select.options[ select.selectedIndex ]?.value;

            const index = drinks.findIndex( drink => drink.idDrink == opt );
            const drink = drinks[ index ];

            if ( drink ) displayCocktail( drink );
        }
    } );
}

////// POPULATE LETTERS DROPDOWN ////////
function populateLettersDropdown () {
    const alpha = [
        'A', 'B', 'C', 'D', 'E', 'F'
        , 'G', 'H', 'I', 'J', 'K', 'L'
        , 'M', 'N', 'O', 'P', 'Q', 'R'
        , 'S', 'T', 'U', 'V', 'W', 'X'
        , 'Y', 'Z'
    ];

    const lettersDropdown = document.querySelector( '.letters-dropdown' ) as HTMLSelectElement;

    for ( let i = 0; i < alpha.length; i++ ) {
        lettersDropdown.options[ lettersDropdown.options.length ] = new Option(
            alpha[ i ],
            alpha[ i ]?.toLowerCase()
        );
    }

    $( '.letters-dropdown' ).on( 'change', e => {
        const letter = ( e.target as HTMLOptionElement ).value;

        axios.get<DrinksRes>( `/drinks/letter/${ letter }` ).then( response => {
            populateDrinkDropdown( response.data.drinks );
        } );
    } );
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

    axios
        .post<DrinkFavorite>( '/drinks/favorites', drinkFavorite )
        .then( response => {
            const { data } = response;
            addFavoriteItem( data );
        } )
        .catch( error => {
            console.log( error );
        } );
}

function addFavoriteItem ( drinkFavorite: DrinkFavorite ) {
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
        .on( {
            click: () => getDrinkById( id )
        } );

    // const selectedDrinkId = $( '.id-holder' ).attr( 'id' );
    // const favoriteId = favoriteLi.attr( 'id' );

    // if ( selectedDrinkId === favoriteId ) {
    //     loadButton.prop( 'disabled', true );
    //     loadButton.css( 'pointer-events', 'none' );
    // }

    favoriteLi
        .find<HTMLButtonElement>( '.delete-btn' )
        .on( {
            click: () => deleteFavorite( id )
        } );

    favoritesBox?.append( favoriteLi );
}

function deleteFavorite ( drinkId: string ) {
    axios
        .delete<DeleteFavoriteRes>( `/drinks/favorites/${ drinkId }` )
        .then( response => {
            const { id } = response.data;

            for ( let i = 0; i < favoritesBox.children().length; i++ ) {
                const drinkToDelete = favoritesBox?.children().eq( i );

                if ( drinkToDelete?.attr( 'id' ) === String( id ) ) {
                    drinkToDelete
                        .addClass( 'fall' )
                        .on( 'transitionend'
                            , () => {
                                drinkToDelete.remove();
                            }
                        );
                }
            }
        } )
        .catch( err => {
            console.log( err );
        } );
}

function renderFavoritesOnLoad () {
    axios
        .get( '/drinks' )
        .then( response => {
            response
                .data
                .forEach( ( drink: DrinkFavorite ) => addFavoriteItem( drink ) );
        } )
        .catch( err => console.error( err ) );
}

function getDrinkById ( id: string ) {
    axios
        .get<SingleDrinkRes>( `/drinks/id/${ id }` )
        .then( response => {
            displayCocktail( response.data.drinks[ 0 ] );
        } )
        .catch( err => console.log( err ) );
}

function alertUser ( message: string ) {
    alertMessage.text( message );
    alertModal.removeClass( 'hide' );
}

//// UTILS ////
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
