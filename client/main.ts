import type {
    Drink
    , DrinkFavorite, DrinksRes
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
        const initialDrink = cocktailRes.data.drinks[ 15 ];

        if ( initialDrink ) {
            displayCocktail( initialDrink );
        }
    } catch ( err ) {
        console.log( err );
    }
}

////// DISPLAY COCKTAIL ////////
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

    $( '.ingredient' ).detach(); // remove prev. drink ingredients

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

        const ingredient = document.createElement( 'li' );

        ingredient.innerHTML
			= `${ drink[ [ currentMeasure ] as never ] } ${ drink[ [ `strIngredient${ i }` ] as never ] }`;

        ingredient.classList.add( 'ingredient' );
        $( '.ingredients-list' ).append( ingredient );
    }
}

////// GET RANDOM COCKTAIL /////////
function getRandomCocktail () {
    const randomButton = document.querySelector( '.random-cocktail' ) as HTMLButtonElement;

    randomButton.addEventListener( 'click', () => {
        axios
            .get<SingleDrinkRes>( 'https://www.thecocktaildb.com/api/json/v1/1/random.php' )
            .then( response => displayCocktail( response.data.drinks[ 0 ] ) )
            .catch( err => console.log( err ) );
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

////// GET DRINK BY INGREDIENT //////
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

/////// POPULATE INGREDIENTS DRINKS DROPDOWN ////////
function populateIngredientsDropDown ( drinks: Drink[] ) {
    $( '.option' ).detach(); //remove old options before repopulating

    for ( let i = 0; i < drinks.length; i++ ) {
        const select = document.querySelector( '.ingredients-dropdown' ) as HTMLSelectElement;
        const option = document.createElement( 'option' );

        option.classList.add( 'option' );

        option.text = drinks[ i ]?.strDrink as string;
        option.value = drinks[ i ]?.idDrink as string;

        select.appendChild( option );
    }

    const ingredientsForm = document.querySelector( '.ingredients-form' );

    ingredientsForm?.addEventListener( 'submit', e => {
        e.preventDefault();
        const select = ( e.target as HTMLFormElement )?.[ 1 ] as HTMLSelectElement;

        const id = select?.options[ select.selectedIndex ]?.value;

        getDrinkById( id );
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

    const favoriteLi = document.createElement( 'li' );
    favoriteLi.classList.add( 'favorite' );
    favoriteLi.setAttribute( 'id', id );

    favoriteLi.innerHTML = `
        <h3 class="fave-name">${ name }</h3>
        <div class="button-container">
            <button class="button load">Load</button>
            <button class="delete-btn button"><strong>✘</strong></button>
        </div>
    `;

    const loadButton = favoriteLi.querySelector('.load') as HTMLButtonElement;
    loadButton.addEventListener('click', () => {
        getDrinkById(id);
    });

    const deleteButton = favoriteLi.querySelector( '.delete-btn' ) as HTMLButtonElement;
    deleteButton.addEventListener( 'click', () => {
        deleteFavorite( id );
    } );


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
function getDrinkById ( id: string ) {
    axios
        .get<SingleDrinkRes>( `/drinks/id/${ id }` )
        .then( response => {
            displayCocktail( response.data.drinks[0] );
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
