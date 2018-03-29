const cache: {[id: string]: IBlindLevel|null} = {};

export interface IBlindLevel {
  readonly smallBlind: number;
  readonly bigBlind: number;
}

export function parseBlindLevel(blindLevel: string): IBlindLevel|null {
  if (cache[blindLevel]) {
    return cache[blindLevel];
  }
  const blinds = blindLevel.split("/");
  if (blinds.length !== 2) {
    return null;
  }
  const [smallBlind, bigBlind] = [parseInt(blinds[0], 10), parseInt(blinds[1], 10)];
  return cache[blindLevel] = {smallBlind, bigBlind};
}
