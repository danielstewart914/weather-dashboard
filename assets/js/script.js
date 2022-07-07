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

    var currentWeatherFrag = $( document.createDocumentFragment() );

    var cityNameEl = $( '<h2>' );
    var dataFetchDateTimeEl = $( '<p>' ).addClass( 'small' );
    var weatherIconUrl = `http://openweathermap.org/img/wn/${ currentWeatherData.weather[0].icon }@2x.png`;
    var weatherIconEl = $( '<img>' );
    var weatherDescEl = $( '<p>' );
    var tempEl = $( '<p>' );
    var windEl = $( '<p>' );
    var humidityEl = $( '<p>' );
    var dewPointEl = $( '<p>' );
    var uviEl = $( '<p>' );
    var uviColorEl = $( '<span>' );
    var compassEl = $( '<div>' );
    var sunriseEl = $( '<p>' );
    var sunsetEl = $( '<p>' );
    var cloudCoverEl = $( '<p>' );

    var fetchDateTime = luxon.DateTime.fromSeconds( currentWeatherData.dt, { zone: timezone } ).toLocaleString( luxon.DateTime.DATETIME_SHORT );

    cityNameEl.text( cityName );
    weatherIconEl.attr( 'src', weatherIconUrl );
    weatherDescEl.append( currentWeatherData.weather[0].main, ' ', weatherIconEl );
    tempEl.append( thermometerIcon,  ' Temp: ', currentWeatherData.temp, ' ', units.tempChar );
    compassEl = generateCompass( currentWeatherData.wind_deg );
    windEl.append( windIcon, ' ', currentWeatherData.wind_speed, ' ', units.speed, ' ', degToCardinal( currentWeatherData.wind_deg ), compassEl );
    humidityEl.append( moistureIcon, ' Humidity: ', currentWeatherData.humidity, '%' );
    dewPointEl.append( dropletIcon, ' Dew Point: ', currentWeatherData.dew_point, ' ', units.tempChar );
    uviColorEl.text( currentWeatherData.uvi );
    uviColorEl.addClass( [ colorUVI( currentWeatherData.uvi ), 'UVtag', 'px-2 py-1' ] );
    uviEl.append( sunIcon, ' UV Index: ', uviColorEl );
    dataFetchDateTimeEl.text( 'as of ' + fetchDateTime + ' local time' );

    var sunrise = luxon.DateTime.fromSeconds( currentWeatherData.sunrise, { zone: timezone } ).toLocaleString( luxon.DateTime.TIME_SIMPLE );
    var sunset = luxon.DateTime.fromSeconds( currentWeatherData.sunset, { zone: timezone } ).toLocaleString( luxon.DateTime.TIME_SIMPLE );

    sunriseEl.append( sunriseIcon, ' Sunrise: ', sunrise );
    sunsetEl.append( sunsetIcon, ' Sunset: ', sunset );

    cloudCoverEl.append( cloudSunIcon, ' Cloud Cover: ', currentWeatherData.clouds, '%' );

    currentWeatherFrag.append( cityNameEl, weatherDescEl, tempEl, windEl, humidityEl, dewPointEl, uviEl, sunriseEl, sunsetEl, cloudCoverEl, dataFetchDateTimeEl );

    currentWeatherDisplayEl.html( currentWeatherFrag );

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