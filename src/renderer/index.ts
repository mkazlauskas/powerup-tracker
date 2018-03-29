import {bind} from "hyperhtml";
import log from "loglevel";
import "materialize-css/sass/materialize.scss";
import "../sass/index.scss";
import {INIT} from "./actions";
import {config} from "./config";
import configureStore from "./configure-store";
import render from "./render";

// TODO: for production set to something else
log.setLevel(log.levels.DEBUG);

const appElement = document.getElementById("app");
if (appElement !== null) {
  // This renders <div>Hello Steve!</div> to the document body
  const html = bind(appElement);
  const store = configureStore();
  store.dispatch(INIT(config));
  html`${render(store)}`;
  store.subscribe(() => html`${render(store)}`);
  if (module.hot) {
    module.hot.accept("./render", () => {
      html`${render(store)}`;
    });
  }
} else {
  alert("#app not found");
}
