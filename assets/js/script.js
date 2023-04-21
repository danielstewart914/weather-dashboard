// open weather map api variables
const openWeatherApiRootUrl = 'https://api.openweathermap.org';
const openWeatherImageRootUrl = 'https://openweathermap.org/img/wn';
const openWeatherApiKey = '1008cf8d4beec486e3a918845ef87da6';

// toggle for switching between imperial and metric
const toggleUnitsEl = $( '#toggleUnits' );

// search form
const citySearchFormEl = $( '#citySearch' );
const cityInputEl = $( '#cityInput' );
const searchErrorEl = $( '#searchError' );

// search history
const searchHistoryEl = $( '#searchHistory' );

// For dynamic title
const pageTitleEl = $( '#pageTitle' );

// display elements
const currentWeatherDisplayEl = $( '#currentWeatherDisplay' );
const fiveDayForecastDisplayEl = $( '#fiveDayForecast' );
const fullWeatherEl = $( '#fullWeather' );

let locationHistory = [];
let forecastFragments = [];

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
const closeIcon = $( '<i>' ).addClass( 'bi bi-x-lg' );

 let units;

// initialize search history and unit selection from local storage
const initializeSettings = () => {
	if ( localStorage.getItem( 'units' ) === 'metric' ) { 
		units = metric;
		toggleUnitsEl.prop( 'checked', true );
	} else units = imperial;

	if ( localStorage.getItem( 'search-history' ) ) 
		locationHistory = JSON.parse( localStorage.getItem( 'search-history' ) );

		searchHistoryEl.html( renderHistory() );
 }

// toggle between imperial and metric units
const toggleUnits = () => {
	if ( units.query === 'imperial' ) {
		units = metric;
		localStorage.setItem( 'units', 'metric' );
	} else {
		units = imperial;
		localStorage.setItem( 'units', 'imperial' );
	}

	toggleUnitsEl.html( units.tempChar );

	// if there is weather currently displayed on screen fetch and refresh data with new unit selection
	if( currentWeatherDisplayEl.children().length )
		fetchLatLong( locationHistory[ locationHistory.length - 1 ] );
}

const getFlagImageUrl = (country) => {
	return `https://flagsapi.com/${country}/flat/64.png`;
}

// returns class to color code UV index
const colorUVI = uvi => {
	if ( uvi <= 2 ) return 'UVlow';
	if ( uvi <= 5 ) return 'UVmoderate';
	if ( uvi <= 7 ) return 'UVhigh';
	if ( uvi <= 10 ) return 'UVveryHigh';
	return 'UVextreme';
}

// returns Name of current UV conditions
const getUVIlevel = uvi => {
	if ( uvi <= 2 ) return 'Low';
	if ( uvi <= 5 ) return 'Moderate';
	if ( uvi <= 7 ) return 'High';
	if ( uvi <= 10 ) return 'Very High';
	return 'Extreme';
}

// returns UV message base on level
const getUVImessageCard = uvi => {
	const listEL = $( '<ul>' );
	const listItem1 = $( '<li>' );
	const listItem2 = $( '<li>' );
	const listItem3 = $( '<li>' );

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
const degToCardinal = degrees => {
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
const generateCompass = direction => {
	const compassEl = $( '<div>' ).addClass( 'compass mx-auto' );
	const ringEl = $( '<div>' ).addClass( 'ring' );
	const northEl = $( '<div>' ).addClass( 'north direction' );
	const eastEl = $( '<div>' ).addClass( 'east direction' );
	const southEl = $( '<div>' ).addClass( 'south direction' );
	const westEl = $( '<div>' ).addClass( 'west direction' );
	const pointerEl = $( '<div>' ).addClass( 'pointer' );
	const pointerBottomEl = $( '<div>' ).addClass( 'pointer-bottom' );

	pointerEl.append( pointerBottomEl );
	pointerEl.css( 'transform', 'rotate( ' + direction + 'deg )' );
	compassEl.append( ringEl, northEl, eastEl, southEl, westEl, pointerEl );

	return compassEl;
}

// generates small cards with weather info
const generateSmallCard = ( title, icon, info, cardClasses, childEl ) => {
	const cardEl = $( '<div>' ).addClass( cardClasses );
	const cardHeaderEl = $( '<h6>' ).addClass( 'card-header bg-navy text-light' );
	const cardBodyEl = $( '<span>' ).addClass( 'fw-bold p-1' );

	cardHeaderEl.append( icon, ' ', title );
	cardBodyEl.html( info );
	cardEl.append( cardHeaderEl, cardBodyEl, childEl );

	return cardEl;
}

// generates large cards with 2 columns of weather info
const generateLargeCard = ( classes, title, icon, column1, column2 ) => {
	const cardEl = $( '<div>' ).addClass( classes );
	const headerEl = $( '<h4>' ).addClass( 'card-header bg-dark text-light text-center' );
	const rowEl = $( '<div>' ).addClass( 'row justify-content-center' );

	headerEl.append( icon, ' ', title );
	rowEl.append( column1, column2 );
	cardEl.append( headerEl, rowEl );

	return cardEl;
}

// generates and returns a bootstrap column and with up to 3 elements appended to it
const generateCardColumn = ( element1, element2, element3 ) => {
	const columnEl = $( '<div>' ).addClass( 'col-lg-5' );
	columnEl.append( element1, element2, element3 );

	return columnEl;
}

// renders full weather onto document fragment and returns that fragment
const renderWeather = ( cityName, weatherData, timezone, fetchDateTime, country, state ) => {
	// document fragment for current weather
	const currentWeatherFrag = $( document.createDocumentFragment() );

	// city header
	const cityNameEl = $( '<h2>' ).addClass( 'card-header text-center bg-dark text-light d-flex justify-content-evenly flex-wrap flex-sm-no-wrap align-items-center p-2' );

	// Large weather conditions icon
	const largeWeatherIconUrl = `${ openWeatherImageRootUrl }/${ weatherData.weather[0].icon }@2x.png`;
	const largeWeatherIconEl = $( '<img>' ).attr( { src: largeWeatherIconUrl, alt: weatherData.weather[0].main + ' weather Icon' } );

	// location country flag
	const countryFlagEl = $( '<img>' ).attr( { src: getFlagImageUrl(country), alt: 'The flag of ' + countryCodes[ country ] } ).addClass( 'm-3 flag' );

	// Add elements to city header
	cityNameEl.append( countryFlagEl, ' ', cityName );
	if ( state ) cityNameEl.append( ' - ', state );
	cityNameEl.append( ', ', countryCodes[ country ], largeWeatherIconEl );

	// Current conditions banner
	const bannerRowEl = $( '<div>' ).addClass( 'row m-1 text-center ' );
	const currentConditionsBannerEl = $( '<h2>' ).addClass( 'header bg-navy text-light p-3' );
	const updatedEl = $( '<footer>' ).addClass( 'small float-end fw-normal mt-1' );

	// dates and times
	const displayDate = luxon.DateTime.fromSeconds( weatherData.dt, { zone: timezone } );
	const fetchDateTimeDisplay = luxon.DateTime.fromSeconds( fetchDateTime, { zone: timezone } );
	let preface;

	// if displaying current weather conditions add 'Current' to the display else add 'upcoming'
	if ( fetchDateTime === weatherData.dt ) preface = 'Current ';
	else preface = 'Upcoming ';

	// Add date of weather fetch to banner
	currentConditionsBannerEl.append( preface, 'Conditions for - ', displayDate.toLocaleString( luxon.DateTime.DATE_HUGE ), '<br>', updatedEl );

	// Add time of weather fetch to banner footer
	updatedEl.append( 'Data Current as of ', fetchDateTimeDisplay.toLocaleString( luxon.DateTime.DATE_HUGE ), ' at ', fetchDateTimeDisplay.toLocaleString( luxon.DateTime.TIME_SIMPLE ), ' local time' );

	// append elements to banner
	bannerRowEl.append( currentConditionsBannerEl );

	// current weather conditions
	const primaryRowEl = $( '<div>' ).addClass( 'row m-3 mt-0' );
	const conditionsColEl = $( '<div>' ).addClass( 'col-md-6' );

	// small weather conditions icon
	const weatherIconUrl = `${ openWeatherImageRootUrl }/${ weatherData.weather[0].icon }.png`;
	const weatherIconEl = $( '<img>' ).attr( { src: weatherIconUrl, alt: weatherData.weather[0].main + ' weather Icon' } );

	// change page title
	pageTitleEl.text( 'Weather Conditions - ' + cityName );
	if ( state ) pageTitleEl.append( ' - ', state );
	pageTitleEl.append( ', ', countryCodes[ country ], weatherIconEl );

	// sunrise / sunset times converted to human readable format        
	const sunrise = luxon.DateTime.fromSeconds( weatherData.sunrise, { zone: timezone } ).toLocaleString( luxon.DateTime.TIME_SIMPLE );
	const sunset = luxon.DateTime.fromSeconds( weatherData.sunset, { zone: timezone } ).toLocaleString( luxon.DateTime.TIME_SIMPLE );

	// 
	let temperature;
	if( weatherData.temp.day ) temperature = weatherData.temp.day;
	else temperature = weatherData.temp;

	// create large card with the following data: Temperature, Humidity, Dew Point, Cloud Cover, Sunrise, Sunset
	const conditionsCardEl = generateLargeCard(
		'card my-2 h-100',                      // Classes to add to card
		weatherData.weather[0].main,            // Title ( Weather Conditions )
		weatherIconEl,                          // Icon ( Weather Conditions Icon )
		generateCardColumn(
			generateSmallCard(
				'Temperature',
				thermometerIcon.clone(),
				temperature + ' ' + units.tempChar,
				'card text-center my-2 mx-3 mx-lg-0'
			),
			generateSmallCard(
				'Humidity',
				moistureIcon.clone(),
				weatherData.humidity + '%',
				'card text-center my-2 mx-3 mx-lg-0'
			),
			generateSmallCard(
				'Dew Point',
				dropletIcon.clone(),
				weatherData.dew_point + ' ' + units.tempChar,
				'card text-center my-2 mx-3 mx-lg-0'
			)
		),
		generateCardColumn(
			generateSmallCard(
				'Cloud Cover',
				cloudSunIcon.clone(),
				weatherData.clouds + '%',
				'card text-center my-2 mx-3 mx-lg-0'
			),
			generateSmallCard(
				'Sunrise',
				sunriseIcon.clone(),
				sunrise,
				'card text-center my-2 mx-3 mx-lg-0'
			),
			generateSmallCard(
				'Sunset',
				sunsetIcon.clone(),
				sunset,
				'card text-center my-2 mx-3 mx-lg-0'
			)
		)
	);

	// Append card to column and column to primary row
	conditionsColEl.append( conditionsCardEl );
	primaryRowEl.append( conditionsColEl );

	// elements for wind card
	const windColEl =  $( '<div>' ).addClass( 'col-md-6' );
	let windGusts;

	// if wind gust data is available
	if( weatherData.wind_gust ) { windGusts = weatherData.wind_gust + ' ' + units.speed;  } 
	else { windGusts = 'N/A' }

	// generate large card with wind data
	const windCardEl = generateLargeCard(
		'card my-2 text-center h-100 mt-4 mt-md-2', // Classes to add to card
		'Wind',                                     // Title
		windIcon.clone(),                                   // Icon
		generateCardColumn(
			generateSmallCard(
				'Speed',
				'',
				weatherData.wind_speed + ' ' + units.speed,
				'card text-center my-2 mx-3 mx-lg-0'
			),
			generateSmallCard(
				'Gusts',
				'',
				windGusts,
				'card text-center my-2 mx-3 mx-lg-0'
			)
		),
		generateCardColumn(
			generateSmallCard(
				'Direction',
				'',
				degToCardinal( weatherData.wind_deg ),
				'card text-center my-2 mx-3 mx-lg-0 h-100',
				generateCompass( weatherData.wind_deg )
			)
		)
	);

	// Append card to column and column to primary row
	windColEl.append( windCardEl );
	primaryRowEl.append( windColEl );


	// elements for UVI
	const UVIrowEl = $( '<div>' ).addClass( 'row mx-3 justify-content-center' );
	const UVIcolEl = $( '<div>' ).addClass( 'col-12' );
	const UVICard = $( '<div>' ).addClass( 'card my-2' );

	UVICard.html( `
	<div class="card-header text-center fw-bold UVtag ${ colorUVI( weatherData.uvi ) }">
	<i class="bi bi-sun"></i> UV Index: ${ weatherData.uvi } - ${ getUVIlevel( weatherData.uvi ) }
	</div>
	` );

	UVICard.append( getUVImessageCard( weatherData.uvi ) );

	// Append card to column and column to UVI row
	UVIcolEl.append( UVICard );
	UVIrowEl.append( UVIcolEl );

	// append all rows to fragment and return fragment
	currentWeatherFrag.append( cityNameEl, bannerRowEl, primaryRowEl, UVIrowEl );
	return currentWeatherFrag;
}

// generates and returns a card for the 5 day forecast
const generate5DayCard = ( weatherForecast, timezone, index ) => {
	const cardEl = $( '<div>' ).addClass( 'card text-center my-2 mx-3 p-0' );
	const cardHeaderEl = $( '<h5>' ).addClass( 'card-header bg-dark text-light' );
	const date = luxon.DateTime.fromSeconds( weatherForecast.dt, { zone: timezone } ).toLocaleString( luxon.DateTime.DATE_HUGE );
	const moreButtonEl = $( '<button>' ).addClass( 'btn btn-success text-light m-3' ).text( 'See More' ).data( 'index', index );

	const weatherIconUrl = `${ openWeatherImageRootUrl }/${ weatherForecast.weather[0].icon }.png`;
	const weatherIconEl = $( '<img>' ).attr( { src: weatherIconUrl, alt: weatherForecast.weather[0].main + ' weather Icon' } );

	cardHeaderEl.append( date, '<br>', weatherIconEl, weatherForecast.weather[0].main );
	cardEl.append( 
		cardHeaderEl,
		generateSmallCard(
			'Temperature',
			thermometerIcon.clone(),
			weatherForecast.temp.day + ' ' + units.tempChar,
			'card text-center my-2 mx-3'
		),
		generateSmallCard(
			'Humidity',
			moistureIcon.clone(),
			weatherForecast.humidity + '%',
			'card text-center my-2 mx-3'
		),
		generateSmallCard(
			'Wind Speed',
			windIcon.clone(),
			weatherForecast.wind_speed + ' ' + units.speed,
			'card text-center my-2 mx-3'
		),
		moreButtonEl
	)

	return cardEl;
}

// displays 5 day forecast
const render5DayForecast = ( weatherForecast, timezone, fetchDateTime, cityName, country, state ) => {
	const fiveDayForecastFrag = $( document.createDocumentFragment() );

	const startDate = luxon.DateTime.now().setZone( timezone ).plus( { days: 1 } ).startOf( 'day' );
	const endDate = luxon.DateTime.now().setZone( timezone ).plus( { days: 6 } ).startOf( 'day' );

	const headerEl = $( '<h3>' ).addClass( 'card-header bg-dark text-light m-0 text-center' ).text( 'Five Day Forecast' );
	const rowEl = $( '<div>' ).addClass( 'row justify-content-center mx-2' );
	const rowColEl = $( '<div>' ).addClass( 'row row-cols-md-3 row-cols-lg-4 row-cols-xxl-6 gap-2 justify-content-center' );

	let forecastIndex = 0;

	for ( let i = 0; i < weatherForecast.length; i++ ) {
		const day = luxon.DateTime.fromSeconds( weatherForecast[i].dt, { zone: timezone } );
		if ( day >= startDate && day < endDate ) {
			rowColEl.append( generate5DayCard( weatherForecast[i], timezone, forecastIndex ) );
			forecastFragments.push( renderWeather( cityName, weatherForecast[i], timezone, fetchDateTime, country, state ) );
			forecastIndex++;
		}
	}

	fiveDayForecastFrag.append( headerEl, rowEl );
	rowEl.append( rowColEl );

	return fiveDayForecastFrag;
}

// displays weather on the screen
const displayWeather = ( cityName, weatherData, country, state ) => {
	// reset weather fragments
	forecastFragments = [];
	
	// render weather
	currentWeatherDisplayEl.html( renderWeather( cityName, weatherData.current, weatherData.timezone, weatherData.current.dt, country, state ) );
	fiveDayForecastDisplayEl.html( render5DayForecast( weatherData.daily, weatherData.timezone, weatherData.current.dt, cityName, country, state ) );
}

// fetches the latitude and longitude for a given search query
const fetchLatLong = async searchTerm => {
	const locationUrl = `${ openWeatherApiRootUrl }/geo/1.0/direct?q=${ searchTerm }&appid=${ openWeatherApiKey }`;

	try {
		const response = await fetch ( locationUrl );

		if( !response.ok ) {
			alert( 'Error: ' + response.statusText );
			return;
		}

		const data = await response.json();

		if ( !data[0] ) 
			searchErrorEl.text( searchTerm + ' - Is Not a Valid Location!' );
		else {
			saveLocationToHistory( data[0].name );
			searchErrorEl.text( '' );
			fetchWeather( data[0] );
		}        
	} catch ( err ) {
		console.error( err );
	}
}

// fetches weather data for a given location
const fetchWeather = async location => {
	const lat = location.lat;
	const lon = location.lon;
	const cityName = location.name;
	const weatherUrl = `${ openWeatherApiRootUrl }/data/2.5/onecall?lat=${ lat }&lon=${ lon }&units=${ units.query }&exclude=minutely,hourly&appid=${ openWeatherApiKey }`;

	try {
		const response = await fetch ( weatherUrl );

		if( !response.ok ) {
			alert( 'Error: ' + response.statusText );
			return;
		}

		const weatherData = await response.json();
		displayWeather(  cityName, weatherData, location.country, location.state );
	} catch ( err ) {
		console.error( err );
	}
}

// saves location to local storage
const saveLocationToHistory = locationName => {
	const index = locationHistory.indexOf( locationName );
	// if city is found splice it out of array
	if ( index != -1 ) locationHistory.splice( index, 1 );

	// push location to array
	locationHistory.push( locationName );

	// if array is too long remove first item
	if ( locationHistory.length > 10 ) locationHistory.shift();

	// store in local storage
	localStorage.setItem( 'search-history', JSON.stringify( locationHistory ) );

	// render history to the screen
	searchHistoryEl.html( renderHistory() );
}

// renders user search history
const renderHistory = () => {
	const historyFrag = $( document.createDocumentFragment() );

	for ( let i = locationHistory.length -1; i >= 0; i--  ) { 
		historyFrag.append( renderHistoryButton( locationHistory[i] ) ); 
	}

	return historyFrag;
}

// creates a button with city name stored in data
const renderHistoryButton = buttonTitle => {
	const buttonEl = $( '<button>' ).addClass( 'btn btn-dark bg-navy text-light' );

	buttonEl.text( buttonTitle );
	buttonEl.data( 'city', buttonTitle );

	return buttonEl;
}

initializeSettings();

// change unit selection
toggleUnitsEl.change( toggleUnits );

// city search form submission
citySearchFormEl.submit( event => {
	event.preventDefault();

	if( cityInputEl.val() ) {
		fetchLatLong( cityInputEl.val() );
		cityInputEl.val( '' );
	}
} );

// search for city from search history when button is clicked
searchHistoryEl.on( 'click', 'button', event => fetchLatLong( $( event.target).data( 'city' ) ) );

// set contents of modal with full weather for corresponding 'show more' button is clicked on any forecast card
// and show modal
fiveDayForecastDisplayEl.on( 'click', 'button', event => {
	// clone document fragment at index of button clicked and store in variable
	const frag = forecastFragments[$( event.target ).data( 'index' )].clone();
	const footerEl = $( '<div>' ).addClass( 'row justify-content-center' );
	const XCloseButtonEl = $( '<button>' ).addClass( 'btn btn-danger position-absolute top-0 end-0 m-2' ).html( closeIcon );
	const closeButtonEl = $( '<button>' ).addClass( 'btn btn-danger text-light m-3 col-10 col-md-6 col-lg-4' ).text( 'close' );

	// render to modal
	fullWeatherEl.html( frag );
	footerEl.append( closeButtonEl );
	fullWeatherEl.append( footerEl, XCloseButtonEl );
	fullWeatherEl.children( 'h2' ).addClass( 'pt-5' );

	// show modal
	$('#weatherModal').modal( 'show' );
} );

// close modal when one of the close buttons are clicked
fullWeatherEl.on( 'click', 'button', () => $('#weatherModal').modal( 'hide' ) );