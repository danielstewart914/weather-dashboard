var openWeatherApiRootUrl = 'http://api.openweathermap.org';
var openWeatherApiKey = '1008cf8d4beec486e3a918845ef87da6';
var units = 'imperial';


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
    var weatherUrl = `${ openWeatherApiRootUrl }/data/2.5/onecall?lat=${ lat }&lon=${ lon }&units=${ units }&exclude=minutely,hourly&appid=${ openWeatherApiKey }`;

    console.log( lat );
    console.log( lon );
    console.log( cityName );

    fetch ( weatherUrl )

        .then ( function ( response ) {

            if ( response.ok ) {

                return response.json();

            }
            else {

                alert ( 'Error: ' + response.statusText );

            }

        } )
        .then ( function ( data ) {

            console.log( data );

        } )
        .catch ( function ( error ) {

            console.error( error );

        } );

}

getLatLong( 'Seattle' );