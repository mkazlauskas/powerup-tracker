import {wire} from "hyperhtml";
import {Store} from "redux";
import {formatPlayer, IPlayer} from "../poker";
import {lastTournamentSelector} from "../selectors";
import {IRootState} from "../state";
import {ITrackedPowers, trackPowers} from "./model/power-tracker";

interface IClassRange {
  low: number;
  high: number;
}

const powerClass = (chance: number, classRange: IClassRange) => {
  if (chance > classRange.high) {
    return "green lighten-4";
  }
  if (chance < classRange.low) {
    return "red lighten-4";
  }
  return "orange lighten-4";
};

const format = (group: ITrackedPowers[], classRange: IClassRange) => group.length <= 0 ? "" : wire()`
  ${group.map((p) => `
    <div class="row concise ${powerClass(p.chance, classRange)}">
      <div class="col s4">${p.powers}</div>
      <div class="col s1">${(p.chance * 100).toFixed(0)}%</div>
    </div>
  `)}
`;

export default function(store: Store<IRootState>, player: IPlayer) {
  const state = store.getState();
  const trn = lastTournamentSelector(state);
  const hands = trn && trn.hands;
  if (!hands) {
    return wire()`No hands available`;
  }
  const track = trackPowers(hands, player);
  if (!track) {
    return wire()`<h5>${formatPlayer(player)}</h5>`;
  }
  const tableCards = format(track.cards, {low: 0.34, high: 0.65});
  const tableCombos = format(track.combos, {low: 0.17, high: 0.49});
  const tableGroups = format(track.groups, {low: 0.40, high: 0.74});
  return wire()`
  <h5>${formatPlayer(player)} (${track.points})</h5>
  ${tableCombos}
  <br />
  ${tableGroups}
  <br />
  ${tableCards}
  `;
}
