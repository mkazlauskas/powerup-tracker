import {wire} from "hyperhtml";
import {Store} from "redux";
import {SET_INCLUDE_SELF, SET_PAGE} from "../actions";
import {includeSelfSelector, lastHandPlayersSelector} from "../selectors";
import {IRootState, Page} from "../state";
import renderPlayerStats from "./stats";
import renderPlayerSuccess from "./success";

const pages = {
  [Page.Success]: renderPlayerSuccess,
  [Page.Stats]: renderPlayerStats,
};

export default function(store: Store<IRootState>) {
  const state = store.getState();
  const players = lastHandPlayersSelector(state);
  const menuButton = (page: Page) => wire()`
    <a  onclick=${(_: Event) => store.dispatch(SET_PAGE(page))}
        class="waves-light btn"
    >${Page[page]}</a>`;
  return wire()`
    <div class="row">
      ${Object.keys(pages)
        .map((page) => parseInt(page, 10))
        .filter((page) => page !== state.ui.page)
        .map(menuButton)}
      &nbsp;
      <label>
        <input
          type="checkbox"
          onchange=${(e: Event) => store.dispatch(SET_INCLUDE_SELF((e.target as HTMLInputElement).checked))}
          checked="${includeSelfSelector(state) ? "checked" : ""}" />
        <span>Include self?</span>
      </label>
    </div>
    ${players.map((player) => pages[state.ui.page](store, player))}
  `;
}
