import {findPlayer, IPlayer} from "./poker";

export interface IConfig {
  player: IPlayer;
  dir: {
    HandHistory: string;
    TournSummary: string;
  };
}

// TODO
export const config: IConfig = {
  dir: {
    HandHistory: "ABSOLUTE_PATH_TO_HandHistory_DIRECTORY",
    TournSummary: "ABSOLUTE_PATH_TO_TournSummary_DIRECTORY",
  },
  player: findPlayer("YOUR_POKERSTARS_NAME", "YOUR_COUNTRY"),
};
