var bigram = nGram(2);

/* Factory returning a function that converts a given string
 * to n-grams. */
function nGram(n) {
  if (typeof n !== 'number' || isNaN(n) || n < 1 || n === Infinity) {
    throw new Error('`' + n + '` is not a valid argument for n-gram');
  }

  return grams;

  /* Create n-grams from a given value. */
  function grams(value) {
    var nGrams = [];
    var index;

    if (value === null || value === undefined) {
      return nGrams;
    }

    value = String(value);
    index = value.length - n + 1;

    if (index < 1) {
      return nGrams;
    }

    while (index--) {
      nGrams[index] = value.substr(index, n);
    }

    return nGrams;
  }
}

/* Get the edit-distance according to Dice between two values. */
function diceCoefficient(value, alternative) {
  var left = bigram(String(value).toLowerCase());
  var right = bigram(String(alternative).toLowerCase());
  var rightLength = right.length;
  var length = left.length;
  var index = -1;
  var intersections = 0;
  var rightPair;
  var leftPair;
  var offset;

  while (++index < length) {
    leftPair = left[index];
    offset = -1;

    while (++offset < rightLength) {
      rightPair = right[offset];

      if (leftPair === rightPair) {
        intersections++;

        /* Make sure this pair never matches again */
        right[offset] = '';
        break;
      }
    }
  }

  return 2 * intersections / (left.length + rightLength);
}