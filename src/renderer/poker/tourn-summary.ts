import Log from "loglevel";
import {IFinish, parseFinishes} from "./finish";
import {parsePokerStarsDate} from "./helpers";
import {ITournMeta, parseMeta} from "./tourn-meta";

const cache: {[id: string]: ITournSummary|null} = {};

export interface ITournSummary {
  readonly date: Date;
  readonly meta: ITournMeta;
  readonly results: IFinish[];
}

export function parseTournSummary(summary: string): ITournSummary|null {
  const line = summary.replace(/[\r\n]/g, "");
  // tslint:disable-next-line
  const data = /#([\d]+).+buy-in: ([^\s]+).+3 players.+Tournament started (\d+\/\d+\/\d+ \d+:\d+:\d+) ET/gi.exec(line);
  if (!data) {
    return null;
  }
  const cacheKey = data[1];
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }
  return (cache[cacheKey] = (() => {
    const meta = parseMeta(cacheKey, data[2]);
    if (!meta) {
      Log.warn("Couldn't parse tournament meta", summary);
      return null;
    }
    const date = parsePokerStarsDate(data[3]);
    const results = parseFinishes(meta.stake, summary);
    if (!results) {
      return null;
    }
    return {meta, date, results};
  })());
}
