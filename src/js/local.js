import EventEmitter from "./helpers/eventEmitter";

export class ViewLocal extends EventEmitter {
    constructor() {
        super();

        this.appContainer = document.getElementById('app');
        this.container = document.getElementById('appLocal');

        this.subscribe('show-local-weather', this.setLocalWeather)
        this.subscribe('show-error', this.showError)

        window.addEventListener('load', () => {
            this.emit('DOM-Loaded')
        });
    }

    setLocalWeather = (data) => {
        const block = document.createElement('div');
        block.classList.add('local-weather');

        const title = document.createElement('h3');
        title.classList.add('local-weather-title');
        title.innerText = `Your Local Weather (${data.name}, ${data.sys.country})`;

        const details = document.createElement('div');
        details.classList.add('local-weather-details');

        const temp = document.createElement('div');
        temp.classList.add('local-weather-row');

        const tempLabel = document.createElement('span');
        tempLabel.classList.add('local-weather-label');
        tempLabel.innerText = 'Temperature'

        const tempValue = document.createElement('span');
        tempValue.classList.add('local-weather-value');
        tempValue.innerHTML = data.main.temp + '&#xb0;C';

        temp.append(tempLabel, tempValue);
        details.append(temp);
        block.append(title, details);

        this.container.append(block);

        this.appContainer.classList.add(data.weather[0].main.toLowerCase());
    }

    showError = (msg) => {
        if (!msg) {
            return;
        }

        const errorMsg = document.createElement('p');
        errorMsg.innerText = msg;

        this.container.append(errorMsg);
    }
}

export class ModelLocal extends EventEmitter {
    constructor(view) {
        super();

        this.view = view;

        this.xhttp = new XMLHttpRequest();

        this.subscribe('DOM-Loaded', this.getLocation);
    }

    getLocationSuccess = (position) => {
        this.lat = position.coords.latitude;
        this.lon = position.coords.longitude;

        this.getLocalWeather();
    }

    getLocationError = () => {
        this.view.emit('show-error', 'Unable to retrieve your location');
    }

    getLocation = () => {
        if(!navigator.geolocation) {
            this.view.emit('show-error', 'Geolocation is not supported by your browser');
        } else {
            navigator.geolocation.getCurrentPosition(this.getLocationSuccess, this.getLocationError)
        }
    }

    getLocalWeather = () => {
        this.xhttp.open('GET', `https://api.openweathermap.org/data/2.5/weather?lat=${this.lat}&lon=${this.lon}&units=metric&appid=fd10a9cfa19753e531f6a29aedd843c9`);
        this.xhttp.send();

        this.xhttp.onreadystatechange = () => {
            if (this.xhttp.readyState === XMLHttpRequest.DONE && this.xhttp.status === 200) {
                this.localWeather = JSON.parse(this.xhttp.responseText);
                this.view.emit('show-local-weather', this.localWeather);
            } else {
                this.view.emit('show-error');
            }
        }
    }
}
