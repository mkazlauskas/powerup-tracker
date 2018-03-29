import {Power} from "./power";
import {ISeat} from "./seat";

export interface IAction {
  readonly player: string;
  readonly type: ActionType;
}

export enum ActionType {
  Power,
  Poker,
}

export interface IPowerAction extends IAction {
  readonly type: ActionType.Power;
  readonly cost: number;
  readonly power: Power;
}

export interface IPowerClone extends IPowerAction {
  readonly power: Power.Clone;
  readonly which: Power;
}

export interface IPowerEMP extends IPowerAction {
  readonly power: Power.EMP;
}

export interface IPowerDisintagrate extends IPowerAction {
  readonly power: Power.Disintegrate;
  readonly card: string;
}

export interface IShowCard {
  readonly seat: number;
  readonly card: string;
}

export interface IPowerXRay extends IPowerAction {
  readonly power: Power.XRay;
  readonly show: ReadonlyArray<IShowCard>;
}

export interface IPowerIntel extends IPowerAction {
  readonly power: Power.Intel;
}

export interface IPowerEngineer extends IPowerAction {
  readonly power: Power.Engineer;
  readonly reveal: ReadonlyArray<string>;
  readonly select: string;
}

export interface IPowerScanner extends IPowerAction {
  readonly power: Power.Scanner;
  readonly keep: boolean;
}

export interface IPowerReload extends IPowerAction {
  readonly power: Power.Reload;
  readonly redraw: number;
}

export interface IPowerUpgrade extends IPowerAction {
  readonly power: Power.Upgrade;
}

export type PowerAction = IPowerClone | IPowerEMP | IPowerDisintagrate | IPowerXRay
  | IPowerIntel | IPowerEngineer | IPowerScanner | IPowerReload | IPowerUpgrade;

export enum PokerActionType {
  Blind,
  Fold,
  Check,
  Bet,
  Raise,
  Show,
}

export interface IPokerAction extends IAction {
  readonly type: ActionType.Poker;
}

export interface IFoldAction extends IPokerAction {
  readonly action: PokerActionType.Fold;
}

export interface ICheckAction extends IPokerAction {
  readonly action: PokerActionType.Check;
}

export interface IPutChips {
  readonly amount: number;
  readonly allIn?: boolean;
}

export interface IBlindAction extends IPokerAction, IPutChips {
  readonly action: PokerActionType.Blind;
}

export interface IBetAction extends IPokerAction, IPutChips {
  readonly action: PokerActionType.Bet;
}

export interface IRaiseAction extends IPokerAction, IPutChips {
  readonly action: PokerActionType.Bet;
}

export interface IShowAction extends IPokerAction {
  readonly holecards: ReadonlyArray<string>;
}

export type PokerAction = IFoldAction | ICheckAction | IBlindAction | IBetAction | IRaiseAction;

export type Action = PokerAction | PowerAction;

export interface IHandState {
  readonly pot: number;
  readonly seats: ReadonlyArray<ISeat>;
  readonly communityCards?: string[];
}

// const updatedSeat = {...seats[seat], stack: seats[seat].stack - amount};
// const seats = state ? state.seats : initialSeats;
// let state: IHandState|undefined = {
//   pot: (state ? state.pot : 0) + amount,
//   seats: [
//     ...seats.slice(0, seat),
//     updatedSeat,
//     ...seats.slice(seat + 1),
//   ],
// };

const parseBlinds = (log: string) => {
  const result: IBlindAction[] = [];
  const re = /(.+): posts (?:small|big) blind (\d+)( and is all-in)?/gi;
  let match: RegExpExecArray;
  while ((match = re.exec(log) as RegExpExecArray) !== null) {
    const amount = parseInt(match[2], 10);
    const action: IBlindAction = {
      action: PokerActionType.Blind,
      allIn: !!match[3],
      amount,
      player: match[1],
      type: ActionType.Poker,
    };
    result.push(action);
  }
  return result;
};

const parseAction = (line: string): Action => {
  const powerPlay = /(.+) plays (.+) \((\d)\)(?: and clones (.+))?/i.exec(line);
  if (powerPlay) {
    const player = powerPlay[1];
    const power = Power[powerPlay[2].replace("-", "") as keyof typeof Power];
    const cost = parseInt(powerPlay[3], 10);
    if (powerPlay[4]) {
      const which = Power[powerPlay[4].replace("-", "") as keyof typeof Power];
      return {which, player, power, cost, type: ActionType.Power} as IPowerClone;
    }
    return {player, power, cost, type: ActionType.Power} as PowerAction;
  }
  return {todo: true} as any;
};

export function parseActions(log: string): ReadonlyArray<Action> {
  const actionLines = log
    .split("*** SUMMARY ***")[0]
    .split("*** HOLE CARDS ***")[1]
    .split("\n")
    .filter((line) => !!line.trim() &&
      !["*** ", "Dealt to ", "collected", "finished the tournament",
      "wins the tournament", "returned to", "doesn't show hand"].some((bad) => line.includes(bad)));
  const blindActions: Action[] = parseBlinds(log);
  return blindActions.concat(actionLines.map(parseAction));
}
