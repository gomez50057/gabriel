export function shuffle(items, random = Math.random) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

export function sampleWithoutReplacement(items, count, random = Math.random) {
  return shuffle(items, random).slice(0, Math.min(count, items.length));
}

export function getMultipleChoiceOptions({ correct, items, count = 4, getGroup, random = Math.random }) {
  const candidates = items.filter((item) => item.id !== correct.id);
  const related = getGroup
    ? candidates.filter((item) => getGroup(item) === getGroup(correct))
    : [];
  const relatedIds = new Set(related.map((item) => item.id));
  const remaining = candidates.filter((item) => !relatedIds.has(item.id));
  const distractors = [
    ...sampleWithoutReplacement(related, count - 1, random),
    ...sampleWithoutReplacement(remaining, count - 1, random),
  ].slice(0, count - 1);

  return shuffle([correct, ...distractors], random);
}
