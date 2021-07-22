import EventEmitter from "./helpers/eventEmitter";

export class ViewCities extends EventEmitter {
    constructor() {
        super();
        this.container = document.getElementById('appCities');
        this.input = document.getElementById('appInputCity');
        this.addBtn = document.getElementById('appAddCity');
        this.error = document.getElementById('appInputError');
        this.result = document.getElementById('appResult');

        this.addBtn.addEventListener('click', this.getWeatherData);
        this.result.addEventListener('click', this.onResultClick);
        this.input.addEventListener('focus', this.hideError);

        this.subscribe('show-weather', this.showCityData);
        this.subscribe('change-weather', this.changeCityData);
        this.subscribe('show-error', this.showError);
        this.subscribe('change-error', this.changeError);
        this.subscribe('add-cities', this.addCities);
    }

    getWeatherData = () => {
        if (this.input.value === '') {
            this.showError('Please enter city name.');
            return;
        }

        this.emit('get-weather-data', this.input.value);
    }

    addCities = (cities) => {
        if (!cities.length) {
            return;
        }

        cities.forEach(city => {
            this.showCityData(city, false);
        });
    }

    showCityData = (data, check = true) => {
        let isAdded = false;

        if (check) {
            JSON.parse(localStorage.cities).forEach(city => {
                if (city.name.toLowerCase() === data.name.toLowerCase()) {
                    isAdded = true;
                }
            });
        }

        if (isAdded) {
            this.showError('This city already added');
            return;
        }

        this.input.value = '';

        const block = document.createElement('div');
        block.classList.add('city-weather', data.weather[0].main.toLowerCase());

        const title = document.createElement('input');
        title.classList.add('city-weather-title');
        title.value = `${data.name}, ${data.sys.country}`;

        const removeButton = document.createElement('button');
        removeButton.classList.add('city-weather-remove');
        removeButton.innerText = 'Remove city';

        const details = document.createElement('div');
        details.classList.add('city-weather-details');

        const temp = document.createElement('div');
        temp.classList.add('city-weather-row');

        const tempLabel = document.createElement('span');
        tempLabel.classList.add('city-weather-label');
        tempLabel.innerText = 'Temperature';

        const tempValue = document.createElement('span');
        tempValue.classList.add('city-weather-value');
        tempValue.innerHTML = data.main.temp + '&#xb0;C';

        temp.append(tempLabel, tempValue);
        details.append(temp);
        block.append(title, details, removeButton);

        title.addEventListener('focus', this.saveCityName);
        title.addEventListener('blur', this.changeCityName);

        this.result.append(block);

        this.emit('update-local-storage', data)
    }

    saveCityName = (e) => {
        this.prevCityName = e.target.value.slice(0, e.target.value.indexOf(',')).toLowerCase();
    }

    changeCityName = (e) => {
        let arr = [];
        let isInStorage = false;

        e.target.parentElement.classList.remove('m-error');

        JSON.parse(localStorage.cities).forEach((city) => {
            if (city.name.toLowerCase() !== this.prevCityName) {
                arr.push(city)
            }

            if (city.name.toLowerCase() === e.target.value.toLowerCase()) {
                isInStorage = true;
            }
        });

        localStorage.cities = JSON.stringify(arr);

        if (isInStorage) {
            this.changeError({
                element: e.target.parentElement
            });
            return;
        }

        this.emit('change-weather-data', {
            element: e.target.parentElement,
            name: e.target.value.toLowerCase()
        });
    }

    changeCityData = (data) => {
        const title = data.city.element.getElementsByClassName('city-weather-title')[0];
        title.value = `${data.weather.name}, ${data.weather.sys.country}`;

        const tempValue = data.city.element.getElementsByClassName('city-weather-value')[0];
        tempValue.innerHTML = data.weather.main.temp + '&#xb0;C';
    }

    showError = (msg = 'Wrong city name.') => {
        this.input.classList.add('m-error');
        this.error.innerText = msg;
    }

    hideError = () => {
        this.input.classList.remove('m-error');
        this.error.innerText = '';
    }

    changeError = (item) => {
        item.element.classList.add('m-error')
    }

    onResultClick = (e) => {
        if (e.target.classList.contains('city-weather-remove')) {
            var parent = e.target.parentElement;
            var itemTitle = parent.getElementsByClassName('city-weather-title')[0];
            var cityName = itemTitle.value.slice(0, itemTitle.value.indexOf(',')).toLowerCase();

            let arr = [];
            JSON.parse(localStorage.cities).forEach((city) => {
                if (city.name.toLowerCase() !== cityName) {
                    arr.push(city);
                }
            })

            localStorage.cities = JSON.stringify(arr);

            parent.remove();
            itemTitle.removeEventListener('blur', this.changeCity);
        }
    }
}

export class ModelCities extends EventEmitter {
    constructor(view) {
        super();
        this.view = view;
        this.xhttp = new XMLHttpRequest();

        this.subscribe('get-weather-data', this.getCityWeather);
        this.subscribe('change-weather-data', this.changeCityWeather);
        this.subscribe('update-local-storage', this.updateLocalStorage);

        if (!localStorage.cities) {
            localStorage.cities = JSON.stringify([]);
        } else {
            console.log(JSON.parse(localStorage.cities));
            this.view.emit('add-cities', JSON.parse(localStorage.cities));
        }
    }

    getCityWeather = (city) => {
        this.xhttp.open('GET', `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=fd10a9cfa19753e531f6a29aedd843c9`);
        this.xhttp.send();

        this.xhttp.onreadystatechange = () => {
            if (this.xhttp.readyState === XMLHttpRequest.DONE) {
                if (this.xhttp.status === 200) {
                    const weather = JSON.parse(this.xhttp.responseText);
                    this.view.emit('show-weather', weather);
                } else if (this.xhttp.status === 404) {
                    this.view.emit('show-error');
                }
            }
        }
    }

    changeCityWeather = (city) => {
        this.xhttp.open('GET', `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&units=metric&appid=fd10a9cfa19753e531f6a29aedd843c9`);
        this.xhttp.send();

        this.xhttp.onreadystatechange = () => {
            if (this.xhttp.readyState === XMLHttpRequest.DONE) {
                if (this.xhttp.status === 200) {
                    const weather = JSON.parse(this.xhttp.responseText);
                    this.view.emit('change-weather', {
                        city: city,
                        weather: weather
                    });
                    this.updateLocalStorage(weather);
                } else if (this.xhttp.status === 404) {
                    this.view.emit('change-error', city);
                }
            }
        }
    }

    updateLocalStorage = (data) => {
        let arr = JSON.parse(localStorage.cities);
        arr.push(data);
        localStorage.cities = JSON.stringify(arr);
    }
}