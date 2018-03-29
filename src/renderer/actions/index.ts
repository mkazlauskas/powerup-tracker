import {createAction} from "typesafe-actions";
import {$call} from "utility-types";
import {IConfig} from "../config";
import {IHandHistory, ITournSummary} from "../poker";
import {Page} from "../state";

export const PLAIN = createAction("PLAIN");
export const INIT = createAction("INIT", (payload: IConfig) => ({
  payload, type: "INIT",
}));
export const ADD_TOURN_SUMMARY = createAction("ADD_TOURN_SUMMARY", (payload: ITournSummary) => ({
  payload, type: "ADD_TOURN_SUMMARY",
}));
export const ADD_HAND_HISTORY = createAction("ADD_HAND_HISTORY", (payload: IHandHistory) => ({
  payload, type: "ADD_HAND_HISTORY",
}));
export const SET_PAGE = createAction("SET_PAGE", (payload: Page) => ({
  payload, type: "SET_PAGE",
}));
export const SET_INCLUDE_SELF = createAction("SET_INCLUDE_SELF", (payload: boolean) => ({
  payload, type: "SET_INCLUDE_SELF",
}));

const returnsOfActions = Object.values({
  ADD_HAND_HISTORY,
  ADD_TOURN_SUMMARY,
  INIT,
  PLAIN,
  SET_INCLUDE_SELF,
  SET_PAGE,
}).map($call);
export type RootAction = typeof returnsOfActions[number];
