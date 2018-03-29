import {orderBy} from "lodash";
import Log from "loglevel";
import {ActionType, IHand, IPlayer, Power, PowerAction} from "../../poker";

export interface ITrackedPowers {
  chance: number;
  powers: string;
}
const ALL_POWERS: ReadonlyArray<Power> =
  Object.keys(Power).map((p) => parseInt(p, 10) as Power).filter((p) => !isNaN(p));
const STARTING_POWERS = 2;
const STARTING_POINTS = 10;

interface IDrawPower {
  type: "draw";
  numCardsBefore: number;
  from: ReadonlyArray<Power>;
}
interface IUsePower {
  type: "use";
  power: Power;
}
interface IClone {
  type: "clone";
  own: boolean;
  power: Power;
}
type PowerRecord = IDrawPower | IUsePower | IClone;

function normalize(input: ITrackedPowers[], targetSum: number) {
  const fixedIndexes = input
    .filter(({chance}) => chance >= 1)
    .map((track) => input.indexOf(track));
  const inputSum = input.reduce((result, {chance}) => result += chance, 0);
  const fixedSum = fixedIndexes.length;
  const dynamicSum = inputSum - fixedSum;
  const dynamicTargetSum = targetSum - fixedSum;
  const ratio = dynamicSum / dynamicTargetSum;
  return input.map(({chance, powers}, i) => ({
    chance: fixedIndexes.includes(i)
      ? 1 + ((chance - 1) / ratio)
      : chance / ratio,
    powers,
  }));
}

export function trackPowers(hands: ReadonlyArray<IHand>, player: IPlayer) {
  if (!hands.length || !hands[hands.length - 1].seats.find((s) => s.player === player)) {
    return;
  }
  let powerHistory: PowerRecord[] = [{
    from: ALL_POWERS,
    numCardsBefore: 0,
    type: "draw",
  }, {
    from: ALL_POWERS,
    numCardsBefore: 1,
    type: "draw",
  }];
  let numPowers = STARTING_POWERS;
  let points = STARTING_POINTS;
  let drawAgo = 0;
  hands.forEach((hand) => {
    const powerActions = (hand.actions as PowerAction[]).filter((action) => action.type === ActionType.Power);
    powerActions.forEach((action) => {
      if (action.player !== player.name) {
        return;
      }
      numPowers -= 1;
      if (numPowers === 0) {
        powerHistory = [];
      } else {
        for (let i = powerHistory.length - 1; i >= 0; i--) {
          const record = powerHistory[i];
          if (record.type === "clone" && record.power === action.power && !record.own) {
            // if you cloned this power from somenone else we can't know if it's a duplicate or not
            break;
          }
          if (record.type === "draw" && record.from.includes(action.power)) {
            // Assume it was drawn at last draw where it was possible to draw it
            record.from = [action.power];
            // If you draw a power, it means you didn't have it before;
            for (let j = i - 1; j >= 0; j--) {
              const prevRecord = powerHistory[j];
              if (prevRecord.type === "use") {
                if (prevRecord.power === action.power) {
                  // Don't backtrack anymore, we didn't have it because we used it
                  break;
                }
              } else if (prevRecord.type === "draw") {
                // We know he couldn't have picked this card
                prevRecord.from = prevRecord.from.filter((power) => power !== action.power);
              } else if (prevRecord.type === "clone" && prevRecord.power === action.power) {
                Log.warn("There's something wrong with our power counting logic...");
              }
            }
            break;
          }
        }
        points -= action.cost;
        powerHistory.push({
          power: action.power,
          type: "use",
        });
      }
      if (action.power === Power.Clone) {
        const prevIdx = powerActions.indexOf(action) - 1;
        const prev = prevIdx >= 0 && powerActions[prevIdx];
        const own = prev ? prev.player === player.name && prev.power === action.which : false;
        powerHistory.push({
          own,
          power: action.which,
          type: "clone",
        });
        numPowers += 1;
      }
    });
    if (numPowers < 3) {
      const from = ALL_POWERS.filter((power) => powerHistory.reduce((count, entry) => {
        switch (entry.type) {
          case "clone":
            if (entry.power === power) {
              return false;
            }
            break;
          case "use":
            if (entry.power === power) {
              return true;
            }
        }
        return count;
      }, true));
      powerHistory.push({
        from,
        numCardsBefore: numPowers,
        type: "draw",
      });
      drawAgo = 0;
      numPowers += 1;
    } else {
      drawAgo += 1;
      if (points > 13 && drawAgo > 5) {
        // Would have probably used clone by now if had one
        for (let i = powerHistory.length - 1; i >= 0; i--) {
          const record = powerHistory[i];
          if (record.type === "use" && record.power === Power.Clone) {
            break;
          }
          if (record.type === "draw" && record.from.length > 1) {
            record.from = record.from.filter((power) => power !== Power.Clone);
          }
        }
      }
    }
    points = Math.min(points + 2, 15);
  });
  const sorted = (entries: ITrackedPowers[]) => orderBy(entries, ["chance"], ["desc"]);
  const getChances = (selections: Power[][]) => sorted(selections.map((powers) => ({
    chance: powerHistory.reduce((chance, entry, entryIndex) => {
      switch (entry.type) {
        case "clone":
          if (powers.includes(entry.power)) {
            return entry.own ? 1 : chance + 1;
          }
          break;
        case "use": {
          if (powers.includes(entry.power)) {
            return Math.max(chance - 1, 0);
          }
          break;
        }
        case "draw": {
          const matches = powers.filter(((power) => entry.from.includes(power)));
          if (matches.length && entry.from.length === 1) {
            return chance + 1;
          }
          const chances = powers.map((power) => {
            if (!entry.from.includes(power)) {
              return 0;
            }
            let minNumCardsAfterLastUse = entry.numCardsBefore;
            let foundLastUse = false;
            for (let i = entryIndex - 1; i >= 0; i--) {
              const prevEntry = powerHistory[i];
              if (prevEntry.type === "use" && prevEntry.power === power) {
                foundLastUse = true;
                break;
              }
              if (prevEntry.type === "draw" && prevEntry.numCardsBefore < minNumCardsAfterLastUse) {
                minNumCardsAfterLastUse = prevEntry.numCardsBefore;
              }
            }
            if (!foundLastUse) {
              return 1 / entry.from.length;
            }
            return 1 / (entry.from.length - minNumCardsAfterLastUse);
          });
          const chanceOfAny = (each: number[]) => {
            if (each.length === 0) {
              return 0;
            }
            return each.reduce((sum, c, i) => {
              const sumOfOthers: number = [
                ...each.slice(0, i),
                ...each.slice(i + 1),
              ].reduce((otherSum, other) => otherSum + other, 0);
              return sum + (c * (1 - sumOfOthers));
            }, 0);
          };
          return chance + chanceOfAny(chances);
        }
      }
      return chance;
    }, 0),
    powers: powers.map((power) => Power[power]).join("/"),
  })));
  const cards = normalize(getChances(ALL_POWERS.map((p) => [p])), numPowers);
  const groups = getChances([
    [Power.Engineer, Power.Scanner],
    [Power.Upgrade, Power.Reload],
  ]);
  const upgradeReload = groups.find((c) => c.powers === "Upgrade/Reload");
  const engiScanner = groups.find((c) => c.powers === "Engineer/Scanner");
  const disintagrate = cards.find((c) => c.powers === "Disintegrate");
  const xray = cards.find((c) => c.powers === "XRay");
  const emp = cards.find((c) => c.powers === "EMP");
  const intel = cards.find((c) => c.powers === "Intel");
  if (!upgradeReload || !intel || !engiScanner || !xray || !disintagrate || !emp) {
    throw Log.warn("Something went wrong, can't find chance");
  }
  const upgradeReloadChance = Math.min(upgradeReload.chance, 1);
  const intelChance = Math.min(intel.chance, 1);
  const engiScannerChance = Math.min(engiScanner.chance, 1);
  const disintagrateChance = Math.min(disintagrate.chance, 1);
  const xrayChance = Math.min(xray.chance, 1);
  const empChance = Math.min(emp.chance, 1);
  const combos = numPowers >= 2 ? sorted([{
    chance: upgradeReloadChance * intelChance,
    powers: "Intel + Upgrade/Reload",
  }, {
    chance: upgradeReloadChance * engiScannerChance,
    powers: "Engineer/Scanner + Upgrade/Reload",
  }, {
    chance: disintagrateChance * xrayChance,
    powers: "X-Ray + Disintegrate",
  }, {
    chance: engiScannerChance * empChance,
    powers: "Enginner/Scanner + EMP",
  }]) : [];
  return {cards, combos, groups, points};
}
