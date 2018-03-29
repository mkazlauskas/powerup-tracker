import {groupBy} from "lodash";
import {createSelector} from "reselect";
import {formatMoney, IPlayer} from "./poker";
import {Success} from "./render/model";
import {IRootState} from "./state";

export const includeSelfSelector = (state: IRootState) => state.ui.includeSelf;

const playerSelector = (_: IRootState, player: IPlayer) => player;
export const mainPlayerSelector = (state: IRootState) => state.config.player;
export const lastTournamentSelector = (state: IRootState) => state.tournaments.length > 0
  ? state.tournaments[state.tournaments.length - 1] : null;
export const lastTournamentHandsSelector = createSelector(
  lastTournamentSelector,
  (tournament) => {
    if (!tournament) {
      return null;
    }
    return tournament.hands;
  },
);
export const lastHandSelector = createSelector(
  lastTournamentHandsSelector,
  (hands) => {
    if (!hands) {
      return null;
    }
    return hands[hands.length - 1];
  },
);
export const lastHandPlayerSeatSelector = createSelector(
  lastHandSelector,
  playerSelector,
  (hand, player) => {
    if (!hand) {
      return null;
    }
    return hand.seats.find((seat) => seat.player === player);
  },
);

export const lastTournamentPlayersSelector = createSelector(
mainPlayerSelector, includeSelfSelector, lastTournamentSelector,
(mainPlayer, includeSelf, lastTournament) => {
  if (!lastTournament || !lastTournament.hands) {
    if (includeSelf) {
      return [mainPlayer];
    } else {
      return [];
    }
  }
  const players = lastTournament.hands[0].seats.map(({player}) => player);
  if (!includeSelf) {
    return players.filter((p) => p !== mainPlayer);
  }
  return players.sort((p1, p2) => {
    if (p1 === mainPlayer) {
      return -1;
    }
    if (p2 === mainPlayer) {
      return 1;
    }
    return 0;
  });
});

export const lastHandPlayersSelector = createSelector(
  lastTournamentPlayersSelector, lastHandSelector, includeSelfSelector, mainPlayerSelector,
  (tournamentPlayers, lastHand, includeSelf, mainPlayer) => {
    if (!lastHand) {
      return tournamentPlayers;
    }
    return tournamentPlayers.filter((p) => lastHand.seats.find((seat) => seat.player === p)
      || includeSelf && p === mainPlayer);
  },
);

const tournSummarySelector = (state: IRootState) => state.tournaments;
const tournSummaryByStakesSelector = (state: IRootState) =>
  Object.assign(groupBy(state.tournaments, (t) => formatMoney(t.info.stake.ticket)));
const tournSummaryGroupsSelector = createSelector(
  tournSummarySelector, tournSummaryByStakesSelector,
  (summaries, byStakes) => [{
    stake: "All stakes",
    summaries,
  }].concat(Object.keys(byStakes).map((key) => ({
    stake: key,
    summaries: byStakes[key],
  }))),
);

export const playerSuccessSelector = createSelector(
  tournSummaryGroupsSelector,
  playerSelector,
  (groups, player) => {
    const result = groups.map(({stake, summaries}) => ({
      stake, success: new Success(player, summaries),
    }))
    .filter(({success}) => success.games > 0);
    if (result.length === 2) {
      return [result[1]]; // 'All stakes' is useless
    }
    return result;
  },
);
