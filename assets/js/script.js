// open weather map api variables
var openWeatherApiRootUrl = 'https://api.openweathermap.org';
var openWeatherImageRootUrl = 'https://openweathermap.org/img/wn';
var openWeatherApiKey = '1008cf8d4beec486e3a918845ef87da6';

// country flag api
var countryFlagApiUrl = 'https://countryflagsapi.com/svg/';

// toggle for switching between imperial and metric
var toggleUnitsEl = $( '#toggleUnits' );

// search form
var citySearchFormEl = $( '#citySearch' );
var cityInputEl = $( '#cityInput' );
var searchErrorEl = $( '#searchError' );

// search history
var searchHistoryEl = $( '#searchHistory' );

// main display area
var mainEl = $( '#main' );
var currentWeatherDisplayEl = $( '#currentWeatherDisplay' );
var fiveDayForecastDisplayEl = $( '#fiveDayForecast' );

var locationHistory = [];

const metric = { 
    query: 'metric',
    speed: 'm/s',
    tempChar: '&#8451;'
 };

const imperial = { 
    query: 'imperial',
    speed: 'mph',
    tempChar: '&#8457;'
 };

 // Icons for display
 const dropletIcon = $( '<i>' ).addClass( 'bi bi-droplet' );
 const thermometerIcon = $( '<i>' ).addClass( 'bi bi-thermometer-half' );
 const windIcon = $( '<i>' ).addClass( 'bi bi-wind' );
 const sunIcon = $( '<i>' ).addClass( 'bi bi-sun' );
 const sunriseIcon = $( '<i>' ).addClass( 'bi bi-sunrise' );
 const sunsetIcon = $( '<i>' ).addClass( 'bi bi-sunset' );
 const cloudSunIcon = $( '<i>' ).addClass( 'bi bi-cloud-sun' );
 const moistureIcon = $( '<i>' ).addClass( 'bi bi-moisture' );

// checks local storage for user preference for metric otherwise sets units to imperial by default
 var units;


// initialize search history and unit selection from local storage
function initializeSettings() {

    if ( localStorage.getItem( 'units' ) === 'metric' ) { 

        units = metric;
        toggleUnitsEl.prop( 'checked', true );
     }
    
     else units = imperial;

     if ( localStorage.getItem( 'search-history' ) ) {

        locationHistory = JSON.parse( localStorage.getItem( 'search-history' ) );
     }

     searchHistoryEl.html( renderHistory() );

 }

// toggle between imperial and metric units
function toggleUnits ( ) {

    if ( units.query === 'imperial' ) {

        units = metric;
        localStorage.setItem( 'units', 'metric' );

    } else {

        units = imperial;
        localStorage.setItem( 'units', 'imperial' );

    }

    toggleUnitsEl.html( units.tempChar );

    // if there is weather currently displayed on screen fetch and refresh data with new unit selection
    if( currentWeatherDisplayEl.children().length ) {

        getLatLong( locationHistory[ locationHistory.length - 1 ] );

    }

}

// returns class to color code UV index
function colorUVI ( uvi ) {

    if ( uvi <= 2 ) return 'UVlow';
    if ( uvi <= 5 ) return 'UVmoderate';
    if ( uvi <= 7 ) return 'UVhigh';
    if ( uvi <= 10 ) return 'UVveryHigh';
    return 'UVextreme';
}

// returns Name of current UV conditions
function getUVIlevel ( uvi ) {

    if ( uvi <= 2 ) return 'Low';
    if ( uvi <= 5 ) return 'Moderate';
    if ( uvi <= 7 ) return 'High';
    if ( uvi <= 10 ) return 'Very High';
    return 'Extreme';
}

// returns UV message base on level
function getUVImessageCard ( uvi ) {

    var listEL = $( '<ul>' );
    var listItem1 = $( '<li>' );
    var listItem2 = $( '<li>' );
    var listItem3 = $( '<li>' );

    if ( uvi <= 2 ) {

        listItem1.text( 'Wear sunglasses on bright days. In winter, reflection off snow can nearly double UV strength.' );
        listItem2.text( 'If you burn easily, cover up and use sunscreen' );
        listEL.append( listItem1, listItem2 );

        return listEL;

    }
    if ( uvi <= 5 ) {

        listItem1.text( 'Take precautions, such as covering up and using sunscreen, if you will be outside.' );
        listItem2.text( 'Stay in shade near midday when the sun is strongest.' );
        listEL.append( listItem1, listItem2 );

        return listEL;
    }
    if ( uvi <= 7 ) {
        
        listItem1.text( 'Protection against sunburn is needed.' );
        listItem2.text( 'Reduce time in the sun between 11am and 4pm.' );
        listItem3.text( 'Cover up, wear a hat and sunglasses, use sunscreen.' );
        listEL.append( listItem1, listItem2, listItem3 );

        return listEL;

    }
    if ( uvi <= 10 ) {
        
        listItem1.text( 'Take extra precautions. Unprotected skin will be damaged and can burn quickly.' );
        listItem2.text( 'Try to avoid the sun between 11am and 4pm.' );
        listEL.append( listItem1, listItem2 );

        return listEL;

    }
    if ( uvi > 10 ) {

        listItem1.text( 'Take all precautions. Unprotected skin can burn in minutes. Beachgoers should know that white sand and other bright surfaces reflect UV and will increase UV exposure.' );
        listItem2.text( 'Avoid the sun between 11am and 4pm.' );
        listItem3.text( 'Seek shade, cover up, wear a hat and sunglasses, and use sunscreen.' );
        listEL.append( listItem1, listItem2, listItem3 );

        return listEL;

    }
}

// takes direction in degrees and returns the corresponding cardinal direction
function degToCardinal ( degrees ) {

    if ( degrees < 22.5 ) return 'N';
    if ( degrees < 67.5 ) return 'NE';
    if ( degrees < 112.5 ) return 'E';
    if ( degrees < 157.5 ) return 'SE';
    if ( degrees < 202.5 ) return 'S';
    if ( degrees < 247.5 ) return 'SW';
    if ( degrees < 292.5 ) return 'W';
    if ( degrees < 337.5 ) return 'NW';
    return 'N';
}

// generates and returns compass to display wind direction
function generateCompass ( direction ) {

    var compassEl = $( '<div>' ).addClass( 'compass mx-auto' );
    var ringEl = $( '<div>' ).addClass( 'ring' );
    var northEl = $( '<div>' ).addClass( 'north direction' );
    var eastEl = $( '<div>' ).addClass( 'east direction' );
    var southEl = $( '<div>' ).addClass( 'south direction' );
    var westEl = $( '<div>' ).addClass( 'west direction' );
    var pointerEl = $( '<div>' ).addClass( 'pointer' );
    var pointerBottomEl = $( '<div>' ).addClass( 'pointer-bottom' );

    pointerEl.append( pointerBottomEl );
    compassEl.append( ringEl, northEl, eastEl, southEl, westEl, pointerEl );
    
    pointerEl.css( 'transform', 'rotate( ' + direction + 'deg )' );

    return compassEl;
}

// generates small cards with weather info
function generateSmallCard ( title, icon, info, additionalClasses, childEl ) {

    var cardEl = $( '<div>' ).addClass( 'card text-center my-2 mx-3 mx-sm-0' + ' ' + additionalClasses );
    var cardHeaderEl = $( '<h6>' ).addClass( 'card-header bg-navy text-light' );
    var cardBodyEl = $( '<span>' ).addClass( 'fw-bold p-1' );

    cardHeaderEl.append( icon, ' ', title );
    cardBodyEl.html( info );

    cardEl.append( cardHeaderEl, cardBodyEl, childEl );

    return cardEl;

}

// generates large cards with 20 columns of weather info
function generateLargeCard( classes, title, icon, column1, column2 ) {


    var cardEl = $( '<div>' ).addClass( classes );
    var headerEl = $( '<h4>' ).addClass( 'card-header bg-dark text-light text-center' );
    var rowEl = $( '<div>' ).addClass( 'row justify-content-center' );

    headerEl.append( icon, title );
    rowEl.append( column1, column2 );
    cardEl.append( headerEl, rowEl );

    return cardEl;

}

function generateCardColumn ( element1, element2, element3 ) {

    var columnEl = $( '<div>' ).addClass( 'col-sm-5' );

    columnEl.append( element1, element2, element3 );

    return columnEl;

}

// displays current weather on the screen
function renderWeather ( cityName, weatherData, timezone, country, state ) {

    // document fragment for current weather
    var currentWeatherFrag = $( document.createDocumentFragment() );

    // city header
    var cityNameEl = $( '<h2>' ).addClass( 'card-header text-center bg-dark text-light d-flex justify-content-evenly flex-wrap flex-sm-no-wrap align-items-center' );

    // Large weather conditions icon
    var largeWeatherIconUrl = `${ openWeatherImageRootUrl }/${ weatherData.weather[0].icon }@2x.png`;
    var largeWeatherIconEl = $( '<img>' ).attr( { src: largeWeatherIconUrl, alt: weatherData.weather[0].main + ' weather Icon' } );

    // location country flag
    var countryFlagEl = $( '<img>' ).attr( { src: countryFlagApiUrl + country, alt: 'The flag of ' + countryCodes[ country ] } ).addClass( 'm-3 flag' );

    // Add elements to city header
    cityNameEl.append( countryFlagEl, ' ', cityName );
    if ( state ) cityNameEl.append( ' - ', state );
    cityNameEl.append( ', ', countryCodes[ country ], largeWeatherIconEl );

    // Current conditions banner
    var bannerRowEl = $( '<div>' ).addClass( 'row m-1 text-center' );
    var currentConditionsBannerEl = $( '<h2>' ).addClass( 'header bg-navy text-light p-3' );
    var updatedEl = $( '<footer>' ).addClass( 'small' );
    var fetchDateTime = luxon.DateTime.fromSeconds( weatherData.dt, { zone: timezone } );

    // Add date of weather fetch to banner
    currentConditionsBannerEl.append( 'Current Conditions - ', fetchDateTime.toLocaleString( luxon.DateTime.DATE_FULL ) );

    // Add time of weather fetch to banner footer
    updatedEl.append( 'As of ', fetchDateTime.toLocaleString( luxon.DateTime.TIME_SIMPLE ), ' local time' );

    // append elements to banner
    bannerRowEl.append( currentConditionsBannerEl, updatedEl );

    // current weather conditions
    var primaryRowEl = $( '<div>' ).addClass( 'row m-3' );
    var conditionsColEl = $( '<div>' ).addClass( 'col-md-6' );

    // small weather conditions icon
    var weatherIconUrl = `${ openWeatherImageRootUrl }/${ weatherData.weather[0].icon }.png`;
    var weatherIconEl = $( '<img>' ).attr( { src: weatherIconUrl, alt: weatherData.weather[0].main + ' weather Icon' } );

    // sunrise / sunset times converted to human readable format        
    var sunrise = luxon.DateTime.fromSeconds( weatherData.sunrise, { zone: timezone } ).toLocaleString( luxon.DateTime.TIME_SIMPLE );
    var sunset = luxon.DateTime.fromSeconds( weatherData.sunset, { zone: timezone } ).toLocaleString( luxon.DateTime.TIME_SIMPLE );

    // create large card with the following data: Temperature, Humidity, Dew Point, Cloud Cover, Sunrise, Sunset
    var conditionsCardEl = generateLargeCard(
        'card my-2 h-100',                      // Classes to add to card
        weatherData.weather[0].main,            // Title ( Weather Conditions )
        weatherIconEl,                          // Icon ( Weather Conditions Icon )
        generateCardColumn(
            generateSmallCard(
                'Temperature',
                thermometerIcon,
                weatherData.temp + ' ' + units.tempChar,
                ''
            ),
            generateSmallCard(
                'Humidity',
                moistureIcon,
                weatherData.humidity + '%',
                ''
            ),
            generateSmallCard(
                'Dew Point',
                dropletIcon,
                weatherData.dew_point + ' ' + units.tempChar,
                ''
            )
        ),
        generateCardColumn(
            generateSmallCard(
                'Cloud Cover',
                cloudSunIcon,
                weatherData.clouds + '%',
                ''
            ),
            generateSmallCard(
                'Sunrise',
                sunriseIcon,
                sunrise,
                ''
            ),
            generateSmallCard(
                'Sunset',
                sunriseIcon,
                sunset,
                ''
            )
        )
    );

    // Append card to column and column to row
    conditionsColEl.append( conditionsCardEl );
    primaryRowEl.append( conditionsColEl );

    // elements for wind card
    var windColEl =  $( '<div>' ).addClass( 'col-md-6' );
    var windGusts;

    // if wind gust data is available
    if( weatherData.wind_gust ) { windGusts = weatherData.wind_gust + ' ' + units.speed;  } 
    else { windGusts = 'N/A' }

    // generate large card with wind data
    var windCardEl = generateLargeCard(
        'card my-2 text-center h-100 mt-4 mt-md-2', // Classes to add to card
        'Wind',                                     // Title
        windIcon,                                   // Icon
        generateCardColumn(
            generateSmallCard(
                'Speed',
                '',
                weatherData.wind_speed + ' ' + units.speed,
                ''
            ),
            generateSmallCard(
                'Gusts',
                '',
                windGusts,
                ''
            )
        ),
        generateCardColumn(
            generateSmallCard(
                'Direction',
                '',
                degToCardinal( weatherData.wind_deg ),
                'h-100',
                generateCompass( weatherData.wind_deg )
            )
        )
    );

    // Append card to column and column to row
    windColEl.append( windCardEl );
    primaryRowEl.append( windColEl );


    // elements for UVI
    var UVIrowEl = $( '<div>' ).addClass( 'row m-3 justify-content-center' );
    var UVIcolEl = $( '<div>' ).addClass( 'col-12' );
    var UVICard = $( '<div>' ).addClass( 'card my-2' );

    UVICard.html( `
    <div class="card-header text-center fw-bold UVtag ${ colorUVI( weatherData.uvi ) }">
    <i class="bi bi-sun"></i> UV Index: ${ weatherData.uvi } - ${ getUVIlevel( weatherData.uvi ) }
    </div>
    ` );

    UVICard.append( getUVImessageCard( weatherData.uvi ) );

    // Append card to column and column to row
    UVIcolEl.append( UVICard );
    UVIrowEl.append( UVIcolEl );

    // append all rows to fragment and return fragment
    currentWeatherFrag.append( cityNameEl, bannerRowEl, primaryRowEl, UVIrowEl );
    return currentWeatherFrag;

}

// displays 5 day forecast
function render5DayForecast ( weatherForecast ) {

    for ( var i = 0; i < weatherForecast.length; i++ ) {

        // temp console log until function is written
        console.log( weatherForecast[i] );

    }

}

// displays weather on the screen
function displayWeather ( cityName, weatherData, country, state ) {

    currentWeatherDisplayEl.html( renderWeather( cityName, weatherData.current, weatherData.timezone, country, state ) );
    render5DayForecast( weatherData.daily );

}

// fetches the latitude and longitude for a given search query
function getLatLong ( searchTerm ) {

    var locationUrl = `${ openWeatherApiRootUrl }/geo/1.0/direct?q=${ searchTerm }&appid=${ openWeatherApiKey }`;

    fetch ( locationUrl )

        .then ( function ( response ) {

            if ( response.ok ) {

                return response.json();

            } else {

                alert( 'Error: ' + response.statusText );

            }

        } )
        .then ( function ( data ) {

            if ( !data[0] ) {

                searchErrorEl.text( searchTerm + ' - Is Not a Valid Location!' );

            } else {

                saveLocationToHistory( data[0].name );
                searchErrorEl.text( '' );
                getWeather( data[0] );

            }

        } )
        .catch ( function ( error ) {

            console.error( error );
        
        } );

}

// fetches weather data for a given location
function getWeather ( location ) {

    var lat = location.lat;
    var lon = location.lon;
    var cityName = location.name;
    var weatherUrl = `${ openWeatherApiRootUrl }/data/2.5/onecall?lat=${ lat }&lon=${ lon }&units=${ units.query }&exclude=minutely,hourly&appid=${ openWeatherApiKey }`;

    fetch ( weatherUrl )

        .then ( function ( response ) {

            if ( response.ok ) {

                return response.json();

            }
            else {

                alert ( 'Error: ' + response.statusText );

            }

        } )
        .then ( function ( weatherData ) {

            displayWeather(  cityName, weatherData, location.country, location.state );
        
        } )
        .catch ( function ( error ) {

            console.error( error );

        } );

}

function saveLocationToHistory ( locationName ) {

    var index = locationHistory.indexOf( locationName );

    // if city is found in array
    if ( index != -1 ) {

        // splice it out of array
        locationHistory.splice( index, 1 );

    }

    // push location to array
    locationHistory.push( locationName );

    // if array is too long remove first item
    if ( locationHistory.length > 10 ) { locationHistory.shift(); }

    // store in local storage
    localStorage.setItem( 'search-history', JSON.stringify( locationHistory ) );

    // render history to the screen
    searchHistoryEl.html( renderHistory() );
    
}

function renderHistory () {

    var historyFrag = $( document.createDocumentFragment() );

    for ( var i = locationHistory.length -1; i >= 0; i--  ) { 
        
        historyFrag.append( renderHistoryButton( locationHistory[i] ) ); 
    
    }

    return historyFrag;

}

function renderHistoryButton ( buttonTitle ) {

    var buttonEl = $( '<button>' ).addClass( 'btn btn-dark bg-navy text-light' );

    buttonEl.text( buttonTitle );
    buttonEl.data( 'city', buttonTitle );

    return buttonEl;
}

initializeSettings();

// change unit selection
toggleUnitsEl.change( toggleUnits );

// city search form submission
citySearchFormEl.submit( function ( event ) {

    event.preventDefault();
    if( cityInputEl.val() ) {

        getLatLong( cityInputEl.val() );
        cityInputEl.val( '' );

    }
    
} );

// search for city from search history when button is clicked
searchHistoryEl.on( 'click', 'button', function ( event ) {

    getLatLong( $( event.target).data( 'city' ) );

} );
