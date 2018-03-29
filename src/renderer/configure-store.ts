import {applyMiddleware, compose, createStore} from "redux";
import {createEpicMiddleware} from "redux-observable";
import {rootEpic} from "./epics";
import {rootReducer} from "./reducers";
import {IRootState} from "./state";

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const epicMiddleware = createEpicMiddleware(rootEpic);

export default function() {
  const store = createStore<IRootState>(rootReducer, composeEnhancers(applyMiddleware(epicMiddleware)));

  if (module.hot) {
    module.hot.accept("./reducers", () => {
      store.replaceReducer(rootReducer);
    });
  }

  return store;
}
