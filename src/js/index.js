import '../css/style.css';

import EventEmitter from "./helpers/eventEmitter";
import { ViewLocal, ModelLocal } from "./local";
import { ViewCities, ModelCities } from "./cities";
import Controller from "./controller";

const viewLocal = new ViewLocal();
const modelLocal = new ModelLocal(viewLocal);

const viewCities = new ViewCities();
const modelCities = new ModelCities(viewCities);

const controller = new Controller(
    {
        local: {
            view: viewLocal,
            model: modelLocal
        },
        cities: {
            view: viewCities,
            model: modelCities
        }
    }
);