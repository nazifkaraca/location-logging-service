export function diffAreaSets(
  previousIds: Iterable<string>,
  containingIds: Iterable<string>,
): { entered: string[]; exited: string[] } {
  const previous = new Set(previousIds);
  const containing = new Set(containingIds);

  const entered: string[] = [];
  const exited: string[] = [];

  for (const id of containing) {
    if (!previous.has(id)) {
      entered.push(id);
    }
  }

  for (const id of previous) {
    if (!containing.has(id)) {
      exited.push(id);
    }
  }

  entered.sort();
  exited.sort();
  return { entered, exited };
}

export function sortedIds(ids: Iterable<string>): string[] {
  return [...new Set(ids)].sort();
}
