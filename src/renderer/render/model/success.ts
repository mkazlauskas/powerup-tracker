import {createMoney, IFinish, IMoney, IPlayer, IPrize, minusMoney, sumMoney, ZeroMoney} from "../../poker";
import {ITournament} from "../../state";

export class Success {
  public readonly games: number;
  public readonly spent: IMoney;
  public readonly gain: IMoney;
  public readonly rake: IMoney;
  public readonly net: IMoney;
  public readonly npg: IMoney;
  public readonly itm: number;
  public readonly streakWin: number;
  public readonly streakLose: number;
  public readonly speculation: boolean = false;
  constructor(player: IPlayer, summaries: ReadonlyArray<ITournament> = []) {
    const results = summaries.map((summary) => {
      const result = (summary.results && summary.results.find((r) => r.player === player)) as IFinish;
      return {stake: summary.info.stake, result};
    }).filter((r) => !!r.result);
    this.games = results.length;
    if (results.some(({result}) => !!result.prize && !!result.prize.speculation)) {
      this.speculation = true;
    }
    this.itm = results.reduce((wins, {result}) => {
      if (result.prize) {
        return wins + (result.prize.speculation ? 0.5 : 1);
      }
      return wins;
    }, 0) * 100 / this.games;
    this.gain = results.reduce((gain, {result}) => {
      if (!result.prize) {
        return gain;
      }
      return sumMoney(gain, result.prize.money);
    }, ZeroMoney);
    this.spent = results.reduce((spent, {stake}) => sumMoney(spent, stake.ticket), ZeroMoney);
    this.rake = results.reduce((rake, {stake}) => sumMoney(rake, stake.rake), ZeroMoney);
    this.net = sumMoney(this.gain, minusMoney(this.spent));
    this.npg = createMoney(this.net.amount / this.games, this.net.currency);
    const calcStreak = (f: (curr: number, prize?: IPrize) => number) => results.reduce((streak, {result}) => {
      const curr = f(streak.curr, result.prize);
      const max = curr > streak.max ? curr : streak.max;
      return {curr, max};
    }, {curr: 0, max: 0}).max;
    this.streakWin = calcStreak((curr: number, prize?: IPrize) => prize ? curr + (prize.speculation ? 0.5 : 1) : 0);
    this.streakLose = calcStreak((curr: number, prize?: IPrize) => prize ? 0 : curr + 1);
  }
  get streak() {
    return `+${this.streakWin}/-${this.streakLose}`;
  }
  get roi() {
    if (!this.spent) {
      return 0;
    }
    return this.net.amount / this.spent.amount;
  }
}
