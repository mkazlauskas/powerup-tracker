import {IMoney} from "./money";

export interface IPrize {
  readonly money: IMoney;
  readonly percentage: number;
  readonly speculation?: boolean;
}
