import {createMoney, IMoney} from "./money";

const cache: {[id: string]: IStake|null} = {};

export interface IStake {
  readonly buyIn: IMoney;
  readonly rake: IMoney;
  readonly ticket: IMoney;
}

export function parseStake(stake: string): IStake|null {
  if (cache[stake]) {
    return cache[stake];
  }
  const stakeData = /\$([\d\.]+)(?:\/|\+)\$([\d\.]+)/.exec(stake);
  return (cache[stake] = stakeData
    ? (() => {
      const buyIn = createMoney(parseFloat(stakeData[1]));
      const rake = createMoney(parseFloat(stakeData[2]));
      // Parsing only dollars for now anyway
      return {buyIn, rake, ticket: createMoney(buyIn.amount + rake.amount)};
    })()
    : null);
}
