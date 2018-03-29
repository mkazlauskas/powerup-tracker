import {getType} from "typesafe-actions";
import {RootAction, SET_INCLUDE_SELF, SET_PAGE} from "../actions";
import {IConfigUI, Page} from "../state";

export const ui = (state: IConfigUI = {page: Page.Success, includeSelf: true}, action: RootAction) => {
  switch (action.type) {
    case getType(SET_PAGE):
      return {
        ...state,
        page: action.payload,
      };
    case getType(SET_INCLUDE_SELF):
      return {
        ...state,
        includeSelf: action.payload,
      };
  }
  return state;
};
