import log from "loglevel";
import {createMoney, Currency} from "./money";
import {findPlayer, IPlayer} from "./player";
import {IPrize} from "./prize";
import {IStake} from "./stake";

export interface IFinish {
  readonly player: IPlayer;
  readonly place: number;
  readonly prize?: IPrize;
}

export function parseFinishes(stake: IStake, hand: string): IFinish[]|null {
  const re = /\s+(\d+):\s+(.+?)\s+\(([^\)]+)\),(?:\s+([^\d\s])([\d\.]+)\s+\(([\d\.]+)%\)|\s+(still playing))?/gi;
  const result: IFinish[] = [];
  const unknowns: any[] = [];
  let match: RegExpExecArray|null;
  while ((match = re.exec(hand)) !== null) {
    const player = findPlayer(match[2], match[3]);
    const place = parseInt(match[1], 10);
    const stillPlaying = match[7] === "still playing";
    if (stillPlaying) {
      unknowns.push({player, place});
    } else {
      const amount = match[4];
      if (amount) {
        const prize = {
          money: createMoney(parseFloat(match[5]), Currency[match[4] as keyof typeof Currency]),
          percentage: parseFloat(match[6]) / 100,
        };
        result.push({player, place, prize});
      } else {
        result.push({player, place});
      }
    }
  }
  if (unknowns.length > 0) {
    const numPlayers = result.length + unknowns.length;
    const prizePool = createMoney(numPlayers * stake.buyIn.amount, stake.buyIn.currency);
    const prize = {
      money: createMoney(prizePool.amount / unknowns.length, prizePool.currency),
      percentage: 1 / unknowns.length, speculation: true};
    unknowns.forEach(({player, place}) => {
      result.push({player, place, prize});
    });
  }
  if (result.length === 0) {
    log.warn("Couldn't parse tournament results", hand);
    return null;
  }
  return result;
}
