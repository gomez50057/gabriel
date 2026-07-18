export function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function editDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, index) => [index]);

  for (let column = 0; column <= b.length; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost
      );

      if (
        row > 1 &&
        column > 1 &&
        a[row - 1] === b[column - 2] &&
        a[row - 2] === b[column - 1]
      ) {
        matrix[row][column] = Math.min(
          matrix[row][column],
          matrix[row - 2][column - 2] + 1
        );
      }
    }
  }

  return matrix[a.length][b.length];
}

function allowedErrors(length) {
  if (length < 4) return 0;
  if (length < 8) return 1;
  return 2;
}

function getMatchScore(value, query) {
  if (value.startsWith(query)) return 0;
  if (value.includes(query)) return 1;

  const compactValue = value.replaceAll(" ", "");
  const compactQuery = query.replaceAll(" ", "");

  if (compactValue.includes(compactQuery)) return 2;

  const valueWords = value.split(" ");
  const queryWords = query.split(" ");
  let score = 10;

  for (const queryWord of queryWords) {
    const distances = valueWords.map((word) =>
      word.includes(queryWord) ? 0 : editDistance(word, queryWord)
    );
    const distance = Math.min(...distances);

    if (distance > allowedErrors(queryWord.length)) return Number.POSITIVE_INFINITY;
    score += distance;
  }

  return score;
}

export function fuzzyFilter(options, query, getSearchValues, limit = 12) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) return [];

  return options
    .map((option, index) => {
      const values = getSearchValues(option).map(normalizeText).filter(Boolean);
      const score = Math.min(
        ...values.map((value) => getMatchScore(value, normalizedQuery))
      );

      return { option, index, score };
    })
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, limit)
    .map(({ option }) => option);
}
