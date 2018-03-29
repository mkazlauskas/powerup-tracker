import {sortedIndexBy} from "lodash";
import {getType} from "typesafe-actions";
import {ADD_TOURN_SUMMARY, RootAction} from "../../actions";
import {ITournament} from "../../state";

export default (state: ITournament[] = [], action: RootAction) => {
  switch (action.type) {
    case getType(ADD_TOURN_SUMMARY):
      const summary = action.payload;
      const idx = state.findIndex((t) => t.info.id === summary.meta.id);
      if (idx >= 0) {
        return [
          ...state.slice(0, idx), {
            ...state[idx],
            results: summary.results,
          },
          ...state.slice(idx + 1),
        ];
      }
      const newTournament: ITournament = {
        info: {
          ...summary.meta,
          date: summary.date,
          type: summary.results.length,
        },
        results: summary.results,
      };
      const insertIdx = sortedIndexBy<ITournament>(state, newTournament, (trn) => trn.info.date);
      return [...state.slice(0, insertIdx), newTournament, ...state.slice(insertIdx)];
  }
  return state;
};
