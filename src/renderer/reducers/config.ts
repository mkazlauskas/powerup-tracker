import {getType} from "typesafe-actions";
import {INIT, RootAction} from "../actions";
import {IConfig} from "../config";

export const config = (state: IConfig|null = null, action: RootAction) => {
  switch (action.type) {
    case getType(INIT):
      return action.payload;
  }
  return state;
};
