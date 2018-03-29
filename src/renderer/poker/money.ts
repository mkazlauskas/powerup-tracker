export enum Currency {
  $ = "$",
}

export const ZeroMoney = createMoney(0);

export interface IMoney {
  readonly amount: number;
  readonly currency: Currency;
}

export function createMoney(amount: number, currency: Currency = Currency.$) {
  return {amount, currency};
}

export function minusMoney(money: IMoney) {
  return createMoney(-money.amount, money.currency);
}

export function sumMoney(...moneys: IMoney[]) {
  if (moneys.length === 0) {
    return ZeroMoney;
  }
  const currency = moneys[0].currency;
  if (!moneys.every((m) => m.currency === currency)) {
    throw new Error("Don't know how to sum money of different currencies");
  }
  return createMoney(moneys.reduce((sum, {amount}) => sum + amount, 0), currency);
}

export function formatMoney(money: IMoney) {
  return `${money.currency}${money.amount.toFixed(2)}`;
}
