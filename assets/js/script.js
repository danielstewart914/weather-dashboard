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

 var units = imperial;

function toggleUnits ( ) {

    if ( units.query === 'imperial' ) {

        units = metric;

    } else {

        units = imperial;

    }

    toggleUnitsEl.html( units.tempChar );

}

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

function displayCurrentWeather ( cityName, currentWeatherData ) {

    var currentWeatherFrag = $( document.createDocumentFragment() );

    var cityNameEl = $( '<h2>' );
    var weatherDescEl = $( '<p>' );
    var tempEl = $( '<p>' );
    var windSpeedEl = $( '<p>' );
    var humidityEl = $( '<p>' );
    var uviEl = $( '<p>' );
    var compassEl = $( '<div>' );


    cityNameEl.text( cityName );
    weatherDescEl.text( currentWeatherData.weather[0].main );
    tempEl.html( 'Temp: ' + currentWeatherData.temp + ' ' + units.tempChar);

    compassEl.addClass( 'compass' );
    compassEl.html( '&#8593;' );
    compassEl.css( 'transform', 'rotate( ' + currentWeatherData.wind_deg + 'deg )' );

    windSpeedEl.append( `Wind: ${ currentWeatherData.wind_speed } ${ units.speed }`);
    windSpeedEl.append( compassEl );
    windSpeedEl.append( degToCardinal( currentWeatherData.wind_deg ) );
    humidityEl.text( 'Humidity: ' + currentWeatherData.humidity + '%' );
    uviEl.text( 'UV: ' + currentWeatherData.uvi );

    currentWeatherFrag.append( cityNameEl );
    currentWeatherFrag.append( weatherDescEl );
    currentWeatherFrag.append( tempEl );
    currentWeatherFrag.append( windSpeedEl );
    currentWeatherFrag.append( humidityEl );
    currentWeatherFrag.append( uviEl );

    currentWeatherDisplayEl.html( currentWeatherFrag );

    console.log( cityName );
    console.log( currentWeatherData );

}

function display5DayForecast ( weatherForecast ) {

    for ( var i = 0; i < weatherForecast.length; i++ ) {

        console.log( weatherForecast[i] );

    }

}

function displayWeather ( cityName, weatherData ) {

    displayCurrentWeather( cityName, weatherData.current );
    display5DayForecast( weatherData.daily );

}

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

citySearchFormEl.submit( function ( event ) {

    event.preventDefault();
    getLatLong( cityInputEl.val() ); 
    
} );


toggleUnitsEl.on( 'click', toggleUnits );