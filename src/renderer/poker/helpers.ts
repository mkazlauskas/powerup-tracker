export const parsePokerStarsDate = (date: string) => new Date(Date.parse(`${date} GMT -4`));
