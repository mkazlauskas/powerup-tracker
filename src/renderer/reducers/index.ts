import {combineReducers} from "redux";
import {IRootState} from "../state";
import {config} from "./config";
import {tournaments} from "./tournaments";
import {ui} from "./ui";

export const rootReducer = combineReducers<IRootState>({
  config,
  tournaments,
  ui,
});
