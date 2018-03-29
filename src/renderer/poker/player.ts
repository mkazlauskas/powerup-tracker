const cache: {[name: string]: IPlayer} = {};

export interface IPlayer {
  readonly name: string;
  country?: string;
}

export function findPlayer(name: string, country?: string): Readonly<IPlayer> {
  if (cache[name]) {
    if (!cache[name].country && country) {
      cache[name].country = country;
    }
    return cache[name];
  }
  return cache[name] = {name, country};
}

export function formatPlayer(player: IPlayer) {
  if (player.country) {
    return `${player.name} (${player.country})`;
  }
  return player.name;
}
