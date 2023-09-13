export function parseNumbersList(
  list: string | undefined,
  parse: (input: string) => number,
) {
  if (!list) {
    return undefined;
  }
  const numbersList = list.split(',').map((value) => parse(value));
  if (numbersList.some(Number.isNaN)) {
    const error = `Cannot parse as list of numbers: ${list}`;
    alert(error);
    throw new Error(error);
  }
  return numbersList;
}
