import {findPlayer, IPlayer} from "./player";
import {Power} from "./power";

export interface ISeat {
  readonly player: IPlayer;
  readonly stack: number;
  readonly energy: number;
  readonly powers?: ReadonlyArray<Power>;
  readonly holecards?: ReadonlyArray<string>;
}

export function parseSeats(hand: string): ISeat[]|null {
  const cards = /Dealt to (.+) \[([A-Z0-9][a-z]) ([A-Z0-9][a-z])\]/.exec(hand);
  if (!cards) {
    return null;
  }
  const re = /Seat (\d{1,2}): (.+?) \((\d+) in chips, (-?\d{1,2}) energy(?:, ([^\)]+))?/gi;
  const result: ISeat[] = [];
  let match: RegExpExecArray|null;
  while ((match = re.exec(hand)) !== null) {
    const player = findPlayer(match[2]);
    const stack = parseInt(match[3], 10);
    const energy = parseInt(match[4], 10);
    const holecards = cards[1] === match[2] ? [cards[2], cards[3]] : undefined;
    const powers = match[5]
      ? match[5].split(", ")
        .map((power) => power.replace("-", ""))
        .map((power) => Power[power as keyof typeof Power])
      : undefined;
    result.push({player, stack, energy, powers, holecards});
  }
  if (result.length === 0) {
    return null;
  }
  return result;
}
