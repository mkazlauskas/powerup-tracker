import {IStake, parseStake} from "./stake";

const cache: {[id: string]: ITournMeta|null} = {};

export interface ITournMeta {
  readonly id: number;
  readonly stake: IStake;
}

export function parseMeta(id: string, stakeLog: string) {
  if (cache[id]) {
    return cache[id];
  }
  const stake = parseStake(stakeLog);
  if (!stake) {
    return null;
  }
  return cache[id] = {id: parseInt(id, 10), stake};
}
