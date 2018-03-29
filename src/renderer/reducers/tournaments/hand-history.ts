import {sortedIndexBy} from "lodash";
import {getType} from "typesafe-actions";
import {ADD_HAND_HISTORY, RootAction} from "../../actions";
import {ITournament} from "../../state";

export default (state: ITournament[] = [], action: RootAction) => {
  switch (action.type) {
    case getType(ADD_HAND_HISTORY):
      const hh = action.payload;
      const idx = state.findIndex((t) => t.info.id === hh.tournament.id);
      if (idx >= 0) {
        const hands = [...(state[idx].hands || []), hh.hand];
        return [
          ...state.slice(0, idx),
          {...state[idx], hands},
          ...state.slice(idx + 1),
        ];
      }
      const newTournament: ITournament = {
        hands: [hh.hand],
        info: {
          ...hh.tournament,
          date: hh.hand.date,
          type: hh.hand.seats.length,
        },
      };
      const insertIdx = sortedIndexBy<ITournament>(state, newTournament, (trn) => trn.info.date);
      return [...state.slice(0, insertIdx), newTournament, ...state.slice(insertIdx)];
  }
  return state;
};
