import * as chokidar from "chokidar";
import * as fs from "fs";
import {sortBy} from "lodash";
import {Epic} from "redux-observable";
import {bindNodeCallback} from "rxjs/observable/bindNodeCallback";
import {from} from "rxjs/observable/from";
import {fromEvent} from "rxjs/observable/fromEvent";
import {bufferTime, concatMap, distinct, filter, map, merge, mergeMap} from "rxjs/operators";
import {isActionOf} from "typesafe-actions";
import {ADD_HAND_HISTORY, ADD_TOURN_SUMMARY, INIT, RootAction} from "../actions";
import {IConfig} from "../config";
import {IHandHistory, ITournSummary, parseHandHistory, parseTournSummary} from "../poker";
import {IRootState} from "../state";

const readFile = bindNodeCallback(fs.readFile);
const getSummaries = (config: IConfig) => {
  const watcher = chokidar.watch(config.dir.TournSummary);
  return fromEvent<string>(watcher as any, "add").pipe(
    bufferTime(100),
    mergeMap((paths) => from(sortBy(paths))),
    mergeMap((path) => readFile(path)),
    map((file) => file.toString()),
    mergeMap((file) => from(file.split("PokerStars Tournament "))),
    filter((trn) => !!trn),
    map((trn) => parseTournSummary(trn) as ITournSummary),
    filter((t) => !!t),
    distinct(),
  ).pipe(
    map((t) => ADD_TOURN_SUMMARY(t)),
  );
};
const getHands = (config: IConfig) => {
  const watcher = chokidar.watch(config.dir.HandHistory);
  const events = fromEvent<string>(watcher as any, "add").pipe(
    merge(fromEvent<string>(watcher as any, "change")));
  return events.pipe(
    bufferTime(100),
    mergeMap((paths) => from(sortBy(paths))),
    mergeMap((path) => readFile(path)),
    map((file) => file.toString()),
    mergeMap((file) => from(file.split(/(?:\r\n){3}/))),
    map((hand) => parseHandHistory(hand) as IHandHistory),
    filter((hh) => !!hh),
    distinct(),
  ).pipe(
    map((hh) => ADD_HAND_HISTORY(hh)),
  );
};

export const init: Epic<RootAction, IRootState> = (action$) => {
  return action$.pipe(
    filter(isActionOf(INIT)),
    // tap((action) => console.log("zdr", action)),
    concatMap(({payload}) => getSummaries(payload)
      .pipe(merge(getHands(payload)))),
  );
};
