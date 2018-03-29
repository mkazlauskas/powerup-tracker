import Log from "loglevel";
import {Action, parseActions} from "./actions";
import {IBlindLevel, parseBlindLevel} from "./blind-level";
import {parsePokerStarsDate} from "./helpers";
import {ISeat, parseSeats} from "./seat";
import {ITournMeta, parseMeta} from "./tourn-meta";

const cache: {[id: string]: IHandHistory|null} = {};

export interface IHand {
  readonly id: number;
  readonly blindLevel: IBlindLevel;
  readonly seats: ISeat[];
  readonly date: Date;
  readonly actions: ReadonlyArray<Action>;
}

export interface IHandHistory {
  readonly tournament: ITournMeta;
  readonly hand: IHand;
}
export function parseHandHistory(hand: string): IHandHistory|null {
  if (!hand.trim()) {
    return null;
  }
  const headerMatches =
    /PokerStars Hand #(\d+): Tournament #(\d+), ([^\s]+).+- Level.+\(([\d\/]+)\) - (.+) ET/.exec(hand);
  if (!headerMatches) {
    Log.warn("Failed to parse tournament header", hand);
    return null;
  }
  const handId = parseInt(headerMatches[1], 10);
  if (cache[handId]) {
    return cache[handId];
  }
  const date = parsePokerStarsDate(headerMatches[5]);
  const tournament = parseMeta(headerMatches[2], headerMatches[3]);
  const blindLevel = parseBlindLevel(headerMatches[4]);
  if (!date || !tournament || !blindLevel) {
    Log.warn("Failed to parse meta or blind level", hand);
    return null;
  }
  const seats = parseSeats(hand);
  if (!seats) {
    Log.warn("Failed to parse tournament seats", hand);
    return null;
  }
  const actions = parseActions(hand);
  if (!actions) {
    Log.warn("Failed to parse actions", hand);
    return null;
  }
  const h = {id: handId, date, blindLevel, seats, actions};
  return cache[handId] = {tournament, hand: h};
}
