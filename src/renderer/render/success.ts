import {wire} from "hyperhtml";
import {Store} from "redux";
import {formatMoney, formatPlayer, IPlayer} from "../poker";
import {playerSuccessSelector} from "../selectors";
import {IRootState} from "../state";
import {Success} from "./model";

const successClass = (success: Success) => {
  if (success.speculation) {
    return "orange lighten-4";
  }
  if (success.net.amount > 0) {
    return "green lighten-4";
  }
  return "red lighten-4";
};

export default function(store: Store<IRootState>, player: IPlayer) {
  const state = store.getState();
  const groups = playerSuccessSelector(state, player);
  return wire()`
    <table>
      <thead>
        <tr>
          <th>${formatPlayer(player)}</th>
          <th>Games</th>
          <th>Net</th>
          <th>Net/game</th>
          <th>ITM</th>
          <th>ROI</th>
          <th>Streak</th>
          <th>Gain</th>
          <th>Spent</th>
          <th>Rake</th>
        </tr>
      </thead>
      <tbody>
        ${groups.map(({stake, success}) => `
          <tr class="${successClass(success)}">
            <td>${stake}</td>
            <td>${success.games}</td>
            <td>${formatMoney(success.net)}</td>
            <td>${formatMoney(success.npg)}</td>
            <td>${success.itm.toFixed(2)}%</td>
            <td>${(success.roi * 100).toFixed(2)}%</td>
            <td>${success.streak}</td>
            <td>${formatMoney(success.gain)}</td>
            <td>${formatMoney(success.spent)}</td>
            <td>${formatMoney(success.rake)}</td>
          </tr>
        `)}
      </tbody>
    </table>
  `;
}
