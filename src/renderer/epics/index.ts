import {combineEpics} from "redux-observable";
import {init} from "./init";

export const rootEpic = combineEpics(
   init,
);
