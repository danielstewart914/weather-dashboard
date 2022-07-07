var openWeatherApiRootUrl = 'http://api.openweathermap.org';
var openWeatherApiKey = '1008cf8d4beec486e3a918845ef87da6';
var getWeatherButtonEl = $( '#getWeather' );
var toggleUnitsEl = $( '#toggleUnits' );
var citySearchFormEl = $( '#citySearch' );
var cityInputEl = $( '#cityInput' );
var mainEl = $( '#main' );
var currentWeatherDisplayEl = $( '#currentWeatherDisplay' );

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

// set units to imperial by default
 var units = imperial;


// toggle between imperial and metric units
function toggleUnits ( ) {

    if ( units.query === 'imperial' ) {

        units = metric;

    } else {

        units = imperial;

    }

    toggleUnitsEl.html( units.tempChar );

}

// returns class to color code UV index
function colorUVI ( uvi ) {

    if ( uvi <= 2 ) return 'UVlow';
    if ( uvi <= 5 ) return 'UVmoderate';
    if ( uvi <= 7 ) return 'UVhigh';
    if ( uvi <= 10 ) return 'UVveryHigh';
    return 'UVextreme';
}

function getUVIlevel ( uvi ) {

    if ( uvi <= 2 ) return 'Low';
    if ( uvi <= 5 ) return 'Moderate';
    if ( uvi <= 7 ) return 'High';
    if ( uvi <= 10 ) return 'Very High';
    return 'Extreme';
}

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
        listItem3.text( 'Seek shade, cover up, wear a het and sunglasses, and use sunscreen.' );
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

// generates a compass to display wind direction
function generateCompass ( direction ) {

    var compassEl = $( '<div>' );
    var ringEl = $( '<div>' );
    var northEl = $( '<div>' );
    var eastEl = $( '<div>' );
    var southEl = $( '<div>' );
    var westEl = $( '<div>' );
    var pointerEl = $( '<div>' );
    var pointerBottomEl = $( '<div>' );

    compassEl.addClass( 'compass' );
    ringEl.addClass( 'ring' );
    northEl.addClass( 'north direction' );
    eastEl.addClass( 'east direction' );
    southEl.addClass( 'south direction' );
    westEl.addClass( 'west direction' );
    pointerEl.addClass( 'pointer' );
    pointerBottomEl.addClass( 'pointer-bottom' );

    pointerEl.append( pointerBottomEl );
    compassEl.append( ringEl, northEl, eastEl, southEl, westEl, pointerEl );
    
    pointerEl.css( 'transform', 'rotate( ' + direction + 'deg )' );

    return compassEl;
}

// displays current weather on the screen
function displayCurrentWeather ( cityName, currentWeatherData, timezone ) {

    // document fragment for current weather
    var currentWeatherFrag = $( document.createDocumentFragment() );

    // city header
    var cityNameEl = $( '<h2>' ).addClass( 'card-header text-center bg-dark text-light' );
    var largeWeatherIconUrl = `http://openweathermap.org/img/wn/${ currentWeatherData.weather[0].icon }@2x.png`;
    var largeWeatherIconEl = $( '<img>' ).attr( 'src', largeWeatherIconUrl );

    cityNameEl.append( cityName, largeWeatherIconEl );

    // Current conditions banner
    var bannerRowEl = $( '<div>' ).addClass( 'row m-1 text-center' );
    var currentConditionsBannerEl = $( '<h2>' ).addClass( 'header bg-navy text-light p-3' );
    var updatedEl = $( '<footer>' ).addClass( 'small' );
    var fetchDateTime = luxon.DateTime.fromSeconds( currentWeatherData.dt, { zone: timezone } );

    // Add date of weather fetch to banner
    currentConditionsBannerEl.append( 'Current Conditions - ', fetchDateTime.toLocaleString( luxon.DateTime.DATE_FULL ) );

    // Add time of weather fetch to banner footer
    updatedEl.append( 'As of ', fetchDateTime.toLocaleString( luxon.DateTime.TIME_SIMPLE ), ' local time' );

    // append elements to banner
    bannerRowEl.append( currentConditionsBannerEl, updatedEl );

    // conditions card
    var conditionsRowEl = $( '<div>' ).addClass( 'row m-3' );
    var conditionsColEl = $( '<div>' ).addClass( 'col-md-6' );
    var conditionsCardEl = $( '<div>' ).addClass( 'card my-2 h-100' );

    // sunrise / sunset times converted to human readable format
    var sunrise = luxon.DateTime.fromSeconds( currentWeatherData.sunrise, { zone: timezone } ).toLocaleString( luxon.DateTime.TIME_SIMPLE );
    var sunset = luxon.DateTime.fromSeconds( currentWeatherData.sunset, { zone: timezone } ).toLocaleString( luxon.DateTime.TIME_SIMPLE );

    // conditions card to display information
    conditionsCardEl.html( `
        <h4 class="card-header bg-dark text-light text-center">${ currentWeatherData.weather[0].main } <img src="http://openweathermap.org/img/wn/${ currentWeatherData.weather[0].icon }.png" alt="${ currentWeatherData.weather[0].main } Icon"></h4>
        <div class="row justify-content-center">
            <div class="col-sm-5">
                <div class="card text-center my-2 mx-3 mx-sm-0">
                    <h6 class="card-header bg-navy text-light"><i class="bi bi-thermometer-half"></i> Temperature</h6>
                    <span class="fw-bold p-1">${ currentWeatherData.temp } ${ units.tempChar }</span>
                </div>
                <div class="card text-center my-2 mx-3 mx-sm-0">
                    <h6 class="card-header bg-navy text-light"><i class="bi bi-droplet"></i> Dew Point</h6>
                    <span class="fw-bold p-1">${ currentWeatherData.dew_point } ${ units.tempChar }</span>
                </div>
                <div class="card text-center my-2 mx-3 mx-sm-0">
                    <h6 class="card-header bg-navy text-light"><i class="bi bi-sunrise"></i> Sunrise</h6>
                    <span class="fw-bold p-1">${ sunrise }</span>
                </div>
            </div>
            <div class="col-sm-5">
                <div class="card text-center my-2 mx-3 mx-sm-0">
                    <h6 class="card-header bg-navy text-light"><i class="bi bi-moisture"></i> Humidity</h6>
                    <span class="fw-bold p-1">${ currentWeatherData.humidity }%</span>
                </div>
                <div class="card text-center my-2 mx-3 mx-sm-0">
                    <h6 class="card-header bg-navy text-light"><i class="bi bi-cloud-sun"></i> Cloud Cover</h6>
                    <span class="fw-bold p-1">${ currentWeatherData.clouds }%</span>
                </div>
                <div class="card text-center my-2 mx-3 mx-sm-0">
                    <h6 class="card-header bg-navy text-light"><i class="bi bi-sunset"></i> Sunset</h6>
                    <span class="fw-bold p-1">${ sunset }</span>
                </div>
            </div>
        </div>
    ` );

    // Append card to column and column to row
    conditionsColEl.append( conditionsCardEl );
    conditionsRowEl.append( conditionsColEl );


    var windColEl =  $( '<div>' ).addClass( 'col-md-6' );
    var windCardEl = $( '<div>' ).addClass( 'card my-2 text-center h-100' );
    var windGusts;

    if( currentWeatherData.wind_gust ) {

        windGusts = currentWeatherData.wind_gust + ' ' + units.speed;

    } else {

        windGusts = 'N/A'

    }

    windCardEl.html( `
        <h5 class="card-header bg-dark text-light">
            <i class="bi bi-wind"></i> Wind
        </h5>
        <div class="row justify-content-center">
            <div class="col-sm-5 d-flex flex-column">
                <div class="card my-2 mx-3 mx-sm-0">
                    <h6 class="card-header bg-navy text-light">Speed</h6>
                    <span class="fw-bold p-1">${ currentWeatherData.wind_speed } ${ units.speed }</span> 
                </div>
                <div class="card my-2 mx-3 mx-sm-0">
                    <h6 class="card-header bg-navy text-light">Gusts</h6>
                    <span class=" fw-bold p-1">${ windGusts }</span> 
                </div>
            </div>
            <div class="col-sm-5">
                <div class="card my-2 mx-3 mx-sm-0 text-center h-100">
                    <h6 class="card-header bg-navy text-light">Direction</h6>
                    <span class="fw-bold">${ degToCardinal( currentWeatherData.wind_deg ) }</span> 
                    <div class="compass mx-auto">
                        <div class="ring"></div>
                        <div class="north direction"></div>
                        <div class="east direction"></div>
                        <div class="south direction"></div>
                        <div class="west direction"></div>
                        <div class="pointer" style="transform: rotate(${ currentWeatherData.wind_deg }deg);">
                            <div class="pointer-bottom"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ` );

    windColEl.append( windCardEl );
    conditionsRowEl.append( windColEl );

    var UVIrowEl = $( '<div>' ).addClass( 'row m-3 justify-content-center' );
    var UVIcolEl = $( '<div>' ).addClass( 'col-12' );
    var UVICard = $( '<div>' ).addClass( 'card my-2' );

    UVICard.html( `
    <div class="card-header text-center fw-bold UVtag ${ colorUVI( currentWeatherData.uvi ) }">
    <i class="bi bi-sun"></i> UV Index: ${ currentWeatherData.uvi } - ${ getUVIlevel( currentWeatherData.uvi ) }
    </div>
    ` );

    UVICard.append( getUVImessageCard( currentWeatherData.uvi ) )

    UVIcolEl.append( UVICard );
    UVIrowEl.append( UVIcolEl );

    currentWeatherFrag.append( cityNameEl, bannerRowEl, conditionsRowEl, UVIrowEl );
    currentWeatherDisplayEl.html( currentWeatherFrag )
    console.log( cityName );
    console.log( currentWeatherData );

}

// displays 5 day forecast
function display5DayForecast ( weatherForecast ) {

    for ( var i = 0; i < weatherForecast.length; i++ ) {

        console.log( weatherForecast[i] );

    }

}

// displays weather on the screen
function displayWeather ( cityName, weatherData ) {

    displayCurrentWeather( cityName, weatherData.current, weatherData.timezone );
    display5DayForecast( weatherData.daily );

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

                alert ( 'Not a Valid Location!' );

            } else {

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

            displayWeather(  cityName, weatherData );
        
        } )
        .catch ( function ( error ) {

            console.error( error );

        } );

}

// test form
citySearchFormEl.submit( function ( event ) {

    event.preventDefault();
    if( cityInputEl.val() ) {

        getLatLong( cityInputEl.val() ); 

    }
    
} );


toggleUnitsEl.on( 'click', toggleUnits );