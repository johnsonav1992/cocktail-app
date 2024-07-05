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
const alertModal = $<HTMLDivElement>( '.alert-wrapper' );
const alertMessage = $<HTMLParagraphElement>( '.modal-message' );
const closeButton = $<HTMLButtonElement>( '.modal-close-btn' );
const ingredientInput = $<HTMLInputElement>( '.ingredient-input' );

// Invoke app start functions
( async function appStart () {
    try {
        const cocktailRes = await axios.get<DrinksRes>( '/drinks/letter/a' );
        const initialDrink = cocktailRes.data.drinks[ 15 ];

        // other init fns
        loadFavorites();
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
    const randomButton = $<HTMLButtonElement>( '.random-cocktail' );

    randomButton.on( {
        click: () => {
            axios
                .get<SingleDrinkRes>( 'https://www.thecocktaildb.com/api/json/v1/1/random.php' )
                .then( response => displayCocktail( response.data.drinks[ 0 ] ) )
                .catch( err => console.log( err ) );
        }
    } );
}

////// GET DRINK BY NAME //////
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

function populateIngredientsDropDown ( drinks: Drink[] ) {
    $( '.option' ).detach(); //remove old options before repopulating

    for ( let i = 0; i < drinks.length; i++ ) {
        const select = $<HTMLSelectElement>( '.ingredients-dropdown' );
        const option = $<HTMLOptionElement>( '<option></option>' );

        option.addClass( 'option' );

        option.text( drinks[ i ]?.strDrink as string );
        option.val( drinks[ i ]?.idDrink as string );

        select.append( option );
    }

    const ingredientsForm = $<HTMLFormElement>( '.ingredients-form' );

    ingredientsForm.on( {
        submit: e => {
            e.preventDefault();
            const select = ( e.target as HTMLFormElement )?.[ 1 ] as HTMLSelectElement;

            const id = select?.options[ select.selectedIndex ]?.value as string;

            getDrinkById( +id );
        }
    } );
}

////// POPULATE DRINK DROPDOWN ////////
function populateDrinkDropdown ( drinks: Drink[], letter: string ) {
    $( '.option' ).detach(); //remove old options before repopulating

    for ( let i = 0; i < drinks.length; i++ ) {
        const select = document.querySelector( '.drink-dropdown' ) as HTMLSelectElement;
        const option = document.createElement( 'option' );
        option.classList.add( 'option' );
        option.text = drinks[ i ]?.strDrink as string;
        option.value = drinks[ i ]?.idDrink as string;
        select.appendChild( option );
    }

    const onSubmit = ( e: SubmitEvent ) => {
        e.preventDefault();

        const select = ( e.target as HTMLFormElement )?.[ 1 ] as HTMLSelectElement;
        const opt = select.options[ select.selectedIndex ]?.value;

        const index = drinks.findIndex( drink => drink.idDrink == opt );
        const drink = drinks[ index ];

        if ( drink ) displayCocktail( drink );
    };

    const form = document.querySelector( '.drinks-form' ) as HTMLFormElement;

    form.removeEventListener( 'submit', onSubmit ); // remove old listener
    form.addEventListener( 'submit', onSubmit );
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
            populateDrinkDropdown( response.data.drinks, letter );
        } );
    } );
}

/////// ADD FAVORITE TO DB///////
function addFavorite ( e: any ) {
    const listItemLength
		= e.target.parentNode.parentNode.children[ 7 ].children.length;
    console.log( listItemLength );
    const id = $( '.id-holder' ).attr( 'id' ) as string;

    for ( let i = 0; i < favoritesBox.children.length; i++ ) {
        if ( Number( favoritesBox.children().eq( i ).attr( 'id' ) ) === +id )
            return alertUser( 'You\'ve already added that drink!' );
    }

    if ( listItemLength >= 10 )
        return alertUser( 'You have reached the max amount of favorites!' );

    const drinkId
		= e.target.parentNode.parentNode.parentNode.children[ 1 ].children[ 2 ].id;
    const drinkLetter
		= e.target.parentNode.parentNode.parentNode.children[ 1 ].children[ 0 ].innerHTML.charAt( 0 ).toLowerCase();
    const drinkName
		= e.target.parentNode.parentNode.parentNode.children[ 1 ].children[ 0 ].innerHTML;

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

/// LOAD THE FAVORITE TO DOM /////
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

    const loadButton = favoriteLi.find<HTMLButtonElement>( '.load' );
    loadButton.on( {
        click: () => getDrinkById( id )
    } );

    const selectedDrinkId = $( '.id-holder' ).attr( 'id' );
    const favoriteId = favoriteLi.attr( 'id' );

    if ( selectedDrinkId === favoriteId ) {
        loadButton.prop( 'disabled', true );
        loadButton.css( 'pointer-events', 'none' );
    }

    const deleteButton = favoriteLi.find<HTMLButtonElement>( '.delete-btn' );
    deleteButton.on( {
        click: () => deleteFavorite( id )
    } );

    favoritesBox?.append( favoriteLi );
}

/////// DELETE FAVORITE ///////
function deleteFavorite ( drinkId: number ) {
    axios
        .delete<DeleteFavoriteRes>( `/drinks/favorites/${ drinkId }` )
        .then( response => {
            const { id } = response.data;

            for ( let i = 0; i < favoritesBox.children().length; i++ ) {
                const drinkToDelete = favoritesBox?.children().eq( i );

                if (
                    drinkToDelete?.attr( 'id' ) === String( id )
                ) {
                    favoritesBox?.children().eq( i ).addClass( 'fall' );
                    favoritesBox?.children().eq( i ).on(
                        'transitionend',
                        () => {
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

///// LOAD FAVORITES ON WINDOW ONLOAD ///////
function loadFavorites () {
    axios
        .get( '/drinks' )
        .then( response => {
            // console.log(response)
            response.data.forEach( ( drink: any ) => {
                addFavoriteItem( drink );
            } );
        } )
        .catch( err => console.error( err ) );
}

///// GET DRINK By ID //////
function getDrinkById ( id: number ) {
    axios
        .get<SingleDrinkRes>( `/drinks/id/${ id }` )
        .then( response => {
            displayCocktail( response.data.drinks[ 0 ] );
        } )
        .catch( err => console.log( err ) );
}

///// ALERT FUNCTION /////
function alertUser ( message: string ) {
    alertMessage.text( message );
    alertModal.removeClass( 'hide' );
}

////// GLOBAL LISTENERS ///////
addFavoriteButton.on( { click: addFavorite } );
searchForm.on( { submit: getDrinkByName } );
ingredientInput.on( { keyup: getDrinkByIngredient } );
closeButton.on( {
    click: () => {
        alertMessage.text( '' );
        alertModal.addClass( 'hide' );
    }
} );

//// UTILS ////
function debounce<T extends ( ...args: any[] ) => void>( func: T, wait: number ): ( ...args: Parameters<T> ) => void {
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
