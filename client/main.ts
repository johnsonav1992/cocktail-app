import type {
    Drink
    , DrinksRes
    , SingleDrinkRes
} from '../types/types.ts';
declare const axios: import( 'axios' ).AxiosStatic;

//// GLOBAL SELECTORS /////
const addFavoriteButton = document.querySelector( '.add-favorite-btn' ) as HTMLButtonElement;
const favoritesBox = document.querySelector( '.favorites-box' ) as HTMLDivElement;
const searchForm = document.querySelector( '.search-form' ) as HTMLFormElement;
const alertModal = document.querySelector( '.alert-wrapper' ) as HTMLDivElement;
const alertMessage = document.querySelector( '.modal-message' ) as HTMLParagraphElement;
const closeButton = document.querySelector( '.modal-close-btn' ) as HTMLButtonElement;
const ingredientInput = document.querySelector( '.ingredient-input' ) as HTMLInputElement;

//// Invoke starter functions on window load
loadFavorites();
populateLettersDropdown();
initDisplay(); //initialize the drink to be displayed on first load
getRandomCocktail();

async function initDisplay () {
    try {
        const cocktailRes = await axios.get<DrinksRes>( '/drinks/letter/a' );
        displayCocktail( cocktailRes.data.drinks, 15 );
    } catch ( err ) {
        console.log( err );
    }
}

////// DISPLAY COCKTAIL ////////
function displayCocktail ( drinks: Drink[], index = 0 ) {
    const currentDrink = drinks[ index ];

    if ( !currentDrink ) return;

    const {
        idDrink: id
        , strDrink: name
        , strDrinkThumb: picture
        , strGlass: glass
        , strInstructions: instructions
    } = currentDrink;

    $( '.id-holder' ).attr( 'id', id );

    // Drink card
    $( '.drink-name' ).text( name );

    // Picture
    $( '.drink-image' ).attr( 'src', picture );

    // Ingredients List
    $( '.ingredient' ).detach(); //remove the ingredients from previous drink
    $( '.ingredients-title' ).text( 'Ingredients' );

    const numOfIngredients = 15;

    for ( let i = 1; i <= numOfIngredients; i++ ) {
        const currentIngredient = `strIngredient${ i }` as keyof Drink;
        const currentMeasure = `strMeasure${ i }` as keyof Drink;

        if (
            currentDrink[ currentIngredient ] == null
			|| currentDrink[ currentIngredient ] === ''
        ) break;

        if ( currentDrink[ currentMeasure ] == null ) {
            currentDrink[ currentMeasure ] = '';
        }

        const ingredient = document.createElement( 'li' );

        ingredient.innerHTML
			= `${ currentDrink[ [ currentMeasure ] as never ] } ${ currentDrink[ [ `strIngredient${ i }` ] as never ] }`;

        ingredient.classList.add( 'ingredient' );
        $( '.ingredients-list' ).append( ingredient );
    }

    // Glass
    $( '.glass-name' ).text( `Glass: ${ glass }` );

    // Directions
    $( '.directions-card' ).text( instructions );
}

////// GET RANDOM COCKTAIL /////////
function getRandomCocktail () {
    const randomButton = document.querySelector( '.random-cocktail' ) as HTMLButtonElement;

    randomButton.addEventListener( 'click', () => {
        axios
            .get<SingleDrinkRes>( 'https://www.thecocktaildb.com/api/json/v1/1/random.php' )
            .then( response => displayCocktail( response.data.drinks ) )
            .catch( err => console.log( err ) );
    } );
}

////// GET DRINK BY NAME //////
function getDrinkByName ( e: any ) {
    e.preventDefault();
    const name = e.target[ 0 ].value;

    axios
        .get( `/drinks/name/${ name }` )
        .then( response => {
            if ( response.data.drinks == null ) {
                return alertUser(
                    'That drink does not exist or was spelled incorrectly. Please try again!'
                );
            }
            displayCocktail( response.data );
        } )
        .catch( err => console.log( err ) );

    e.target[ 0 ].value = '';
}

////// GET DRINK BY INGREDIENT //////
function getDrinkByIngredient ( e: any ) {
    e.preventDefault();
    const ingredient = e.target.value;

    axios
        .get( `/drinks/ingredient/${ ingredient }` )
        .then( response => {
            populateIngredientsDropDown( response.data );
        } )
        .catch( err => console.log( err ) );
}

/////// POPULATE INGREDIENTS DRINKS DROPDOWN ////////
function populateIngredientsDropDown ( cocktails: any ) {
    $( '.option' ).detach(); //remove old options before repopulating

    for ( let i = 0; i < cocktails.drinks.length; i++ ) {
        const select = document.querySelector( '.ingredients-dropdown' ) as HTMLSelectElement;
        const option = document.createElement( 'option' );
        option.classList.add( 'option' );
        option.text = cocktails.drinks[ i ].strDrink;
        option.value = cocktails.drinks[ i ].idDrink;
        select.appendChild( option );
    }

    const ingredientsForm = document.querySelector( '.ingredients-form' );
    ingredientsForm?.addEventListener( 'submit', e => {
        e.preventDefault();
        const select = ( e.target as HTMLSelectElement )?.[ 1 ];
        //@ts-ignore
        const id = select?.options[ select.selectedIndex ].value;

        getDrinkById( id );
    } );
}

////// POPULATE DRINK DROPDOWN ////////
function populateDrinkDropdown ( cocktails: any, letter: string ) {
    $( '.option' ).detach(); //remove old options before repopulating

    for ( let i = 0; i < cocktails.drinks.length; i++ ) {
        const select = document.querySelector( '.drink-dropdown' ) as HTMLSelectElement;
        const option = document.createElement( 'option' );
        option.classList.add( 'option' );
        option.text = cocktails.drinks[ i ].strDrink;
        option.value = cocktails.drinks[ i ].idDrink;
        select.appendChild( option );
    }

    const form = document.querySelector( '.drinks-form' ) as HTMLFormElement;
    form.addEventListener( 'submit', e => {
        e.preventDefault();
        const select = ( e.target as HTMLFormElement )?.[ 1 ] as HTMLSelectElement;
        const opt = select.options[ select.selectedIndex ]?.value;

        const index = cocktails.drinks.findIndex( ( object: any ) => object.idDrink == opt );

        axios
            .get( `/drinks/letter/${ letter }` )
            .then( response => displayCocktail( response.data, index ) )
            .catch( err => console.log( err ) );
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
        axios.get( `/drinks/letter/${ letter }` ).then( response => {
            console.log( response );
            populateDrinkDropdown( response.data, letter );
        } );
    } );
}

/////// ADD FAVORITE TO DB///////
function addFavorite ( e: any ) {
    const listItemLength
		= e.target.parentNode.parentNode.children[ 7 ].children.length;
    console.log( listItemLength );
    const id = $( '.id-holder' ).attr( 'id' ) as string;

    for ( let i = 0; i < favoritesBox?.children.length!; i++ ) {
        if ( Number( favoritesBox?.children[ i ]?.getAttribute( 'id' ) ) === +id )
            return alertUser( 'You\'ve already added that drink!' );
    }

    if ( listItemLength >= 10 )
        return alertUser( 'You have reached the max amount of favorites!' );

    const drinkId
		= e.target.parentNode.parentNode.parentNode.children[ 1 ].children[ 2 ].id;
    const drinkLetter
		= e.target.parentNode.parentNode.parentNode.children[ 1 ].children[ 0 ].innerHTML
		    .charAt( 0 )
		    .toLowerCase();
    const drinkName
		= e.target.parentNode.parentNode.parentNode.children[ 1 ].children[ 0 ]
		    .innerHTML;

    const drinkObj = {
        id: drinkId
        , name: drinkName
        , letter: drinkLetter
    };

    axios
        .post( '/drinks/favorites', drinkObj )
        .then( response => {
            const { data } = response;
            addFavoriteItem( data );
        } )
        .catch( error => {
            console.log( error );
        } );
}

/// LOAD THE FAVORITE TO DOM /////
function addFavoriteItem ( drinkObj: any ) {
    const {
        id
        , name
        , letter
    } = drinkObj;
    const favoriteLi = document.createElement( 'li' );
    favoriteLi.classList.add( 'favorite' );
    favoriteLi.setAttribute( 'id', id );

    favoriteLi.innerHTML = `
							<h3 class="fave-name">${ name }</h3>
							<div class="button-container">
								<button class="button" onClick="getDrinkById(${ id })">Load</button>
								<button onClick='deleteFavorite(${ id })' class="delete-btn button"><strong>✘</strong></button>
							</div>`;
    favoritesBox?.appendChild( favoriteLi );
}

/////// DELETE FAVORITE ///////
function deleteFavorite ( drinkId: any ) {
    axios
        .delete( `/drinks/favorites/${ drinkId }` )
        .then( response => {
            const drink = response.data;

            for ( let i = 0; i < favoritesBox?.children.length!; i++ ) {
                const drinkToDelete = favoritesBox?.children[ i ];
                if (
                    drinkToDelete?.getAttribute( 'id' ) === String( drink.drinkId )
                ) {
                    favoritesBox?.children[ i ]?.classList.add( 'fall' );
                    favoritesBox?.children[ i ]?.addEventListener(
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
function getDrinkById ( id: any ) {
    axios
        .get( `/drinks/id/${ id }` )
        .then( response => {
            displayCocktail( response.data );
        } )
        .catch( err => console.log( err ) );
}

///// ALERT FUNCTION /////
function alertUser ( message: string ) {
    alertMessage.innerText = message;
    alertModal.classList.remove( 'hide' );
}

////// GLOBAL LISTENERS ///////
addFavoriteButton.addEventListener( 'click', addFavorite );
searchForm.addEventListener( 'submit', getDrinkByName );
ingredientInput.addEventListener( 'keyup', getDrinkByIngredient );
closeButton.addEventListener( 'click', () => {
    alertMessage.innerText = '';
    alertModal.classList.add( 'hide' );
} );
