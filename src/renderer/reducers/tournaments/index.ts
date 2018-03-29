import {RootAction} from "../../actions";
import {ITournament} from "../../state";
import hh from "./hand-history";
import tsummary from "./tourn-summary";

export const tournaments = (state: ITournament[] = [], action: RootAction) =>
  tsummary(hh(state, action), action);
