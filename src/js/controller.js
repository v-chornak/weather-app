export default class Controller {
    constructor(config) {
        this.viewLocal = config.local.view;
        this.modelLocal = config.local.model;

        this.viewCities = config.cities.view;
        this.modelCities = config.cities.model;

        this.viewLocal.subscribe('DOM-Loaded', this.onDomLoaded);
        this.viewCities.subscribe('get-weather-data', this.getWeatherData);
        this.viewCities.subscribe('change-weather-data', this.changeWeatherData);
        this.viewCities.subscribe('update-local-storage', this.updateLocalStorage);
    }

    onDomLoaded = () => {
        this.modelLocal.emit('DOM-Loaded');
    }

    getWeatherData = (data) => {
        this.modelCities.emit('get-weather-data', data)
    }

    changeWeatherData = (data) => {
        this.modelCities.emit('change-weather-data', data)
    }

    updateLocalStorage = (data) => {
        this.modelCities.emit('update-local-storage', data);
    }
}