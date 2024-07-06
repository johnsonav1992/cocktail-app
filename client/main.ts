import type {
    DeleteFavoriteRes
    , Drink
    , DrinkDropdownFormData
    , DrinkFavorite
    , DrinksRes
    , SingleDrinkRes
} from '../types/types.ts';
declare const axios: import( 'axios' ).AxiosStatic;

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

searchForm.on( { submit: getDrinkByName } );
ingredientsForm.on( { submit: submitDrinkForm } );
drinksForm.on( { submit: submitDrinkForm } );

ingredientInput.on( { keyup: getDrinkByIngredient } );
ingredientsDropdown.on( { change: () => ingredientsForm.trigger( 'submit' ) } );
drinkDropdown.on( { change: () => drinksForm.trigger( 'submit' ) } );
lettersDropdown.on( 'change', e => {
    const letter = e.target.value;

    getDrinksByLetter( letter )
        .then( drinks => populateDrinkDropdown( '.drink-dropdown', drinks ) );
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
                .then( res => displayCocktail( res.data.drinks[ 0 ] ) )
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
        .then( res => {
            if ( res.data.drinks == null ) {
                return alertUser(
                    'That drink does not exist or was spelled incorrectly. Please try again!'
                );
            }
            displayCocktail( res.data.drinks[ 0 ] );
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
        .then( res => {
            populateDrinkDropdown(
                '.ingredients-dropdown'
                , res.data.drinks
            );
        } )
        .catch( err => console.log( err ) )
    , 500 );

function getDrinksByLetter ( letter: string ) {
    return axios
        .get<DrinksRes>( `/drinks/letter/${ letter }` )
        .then( res => res.data.drinks );
}

function populateDrinkDropdown ( selector: string, drinks: Drink[] | undefined ) {
    if ( !drinks ) return;

    $( '.option' ).detach(); //remove old options before repopulating

    appendDrinkSelectOptions(
        $<HTMLSelectElement>( selector )
        , drinks
    );

    const firstDrink = drinks[ 0 ];

    firstDrink && displayCocktail( firstDrink );
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

    axios
        .post<DrinkFavorite>( '/drinks/favorites', drinkFavorite )
        .then( res => appendFavorite( res.data ) )
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
        .on( { click: () => getDrinkById( id ) } );

    favoriteLi
        .find<HTMLButtonElement>( '.delete-btn' )
        .on( { click: () => deleteFavorite( id ) } );

    favoritesBox?.append( favoriteLi );
}

function deleteFavorite ( drinkId: string ) {
    axios
        .delete<DeleteFavoriteRes>( `/drinks/favorites/${ drinkId }` )
        .then( res => {
            const { id } = res.data;

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
        .get<DrinkFavorite[]>( '/drinks' )
        .then( res => res.data.forEach( drink => appendFavorite( drink ) ) )
        .catch( err => console.error( err ) );
}

function getDrinkById ( id: string ) {
    axios
        .get<SingleDrinkRes>( `/drinks/id/${ id }` )
        .then( res => displayCocktail( res.data.drinks[ 0 ] ) )
        .catch( err => console.log( err ) );
}

function submitDrinkForm ( e: SubmitEvent ) {
    e.preventDefault();
    const data = getFormData<DrinkDropdownFormData>( e.target as HTMLFormElement );

    if ( data.drink ) getDrinkById( data.drink );
}

function alertUser ( message: string ) {
    alertMessage.text( message );
    alertModal.removeClass( 'hide' );
}

//// UTILS ////
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
