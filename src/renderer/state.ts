import {IConfig} from "./config";
import {IFinish, IHand, ITournMeta} from "./poker";

export enum TourneyType {
  HeadsUp = 2,
  Threesome = 3,
  Foursome = 4,
  Sixsome = 6,
  Ninesome = 9,
  Tensome = 10,
}

export enum Page {
  Success,
  Stats,
}

export interface ITournInfo extends ITournMeta {
  readonly date: Date;
  readonly type: TourneyType;
}

export interface ITournament {
  readonly info: ITournInfo;
  readonly hands?: ReadonlyArray<IHand>;
  readonly results?: ReadonlyArray<IFinish>;
}

export interface IConfigUI {
  readonly page: Page;
  readonly includeSelf: boolean;
}

export interface IRootState {
  readonly config: IConfig;
  readonly tournaments: ReadonlyArray<ITournament>;
  readonly ui: IConfigUI;
}
