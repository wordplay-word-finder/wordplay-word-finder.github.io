const pointsMap = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2,
  H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1,
  O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
  '*': 0
};

const lengthBonuses = {
  5: 5, 6: 10, 7: 15, 8: 25, 9: 35, 10: 50,
  11: 65, 12: 85, 13: 105, 14: 125, 15: 150,
  16: 175, 17: 200, 18: 230, 19: 270, 20: 320
};

let wordList = [];

fetch('words.txt')
  .then(res => res.text())
  .then(text => {
    wordList = text.split(/\r?\n/).filter(word => word.length >= 4);
  });

function isVowel(letter, yAsVowel = false) {
  return ['A', 'E', 'I', 'O', 'U'].includes(letter) ||
    (yAsVowel && letter === 'Y');
}

function getBonus(length) {
  return lengthBonuses[length] || 0;
}

function getModifiers() {
  return {
    fourthTile: document.getElementById('modFourthTile').checked,
    secondTile: document.getElementById('modSecondTile').checked,
    qu: document.getElementById('modQu').checked,
    firstVowel5x: document.getElementById('modFirstVowel5x').checked,

    startsWith: document.getElementById('modStartsWith').checked,
    startsWithLetter: document.getElementById('startsWithLetter').value.toUpperCase(),

    endsWith: document.getElementById('modEndsWith').checked,
    endsWithLetter: document.getElementById('endsWithLetter').value.toUpperCase(),

    oddEven: document.getElementById('modOddEven').checked,

    exactTiles: document.getElementById('modExactTiles').checked,
    exactTilesCount: Number(document.getElementById('exactTilesCount').value),

    fiveTiles: document.getElementById('modFiveTiles').checked,
    sz: document.getElementById('modSZ').checked,
    lowestConsonant: document.getElementById('modLowestConsonant').checked,
    yVowel: document.getElementById('modYVowel').checked,

    refreshes: document.getElementById('modRefreshes').checked,
    refreshCount: Number(document.getElementById('refreshCount').value),

    sellPrices: document.getElementById('modSellPrices').checked,
    sellPricesAmount: Number(document.getElementById('sellPricesAmount').value),

    doubleLongBonus: document.getElementById('modDoubleLongBonus').checked,
    uniqueLetters: document.getElementById('modUniqueLetters').checked,
    firstLastVowel: document.getElementById('modFirstLastVowel').checked,
    firstLastSame: document.getElementById('modFirstLastSame').checked,
    firstVowelFinal: document.getElementById('modFirstVowelFinal').checked,

    beginsMultiplier: document.getElementById('modBeginsMultiplier').checked,
    beginsMultiplierLetter: document.getElementById('beginsMultiplierLetter').value.toUpperCase(),

    doubleLetters: document.getElementById('modDoubleLetters').checked,
    noDoubleConsonants: document.getElementById('modNoDoubleConsonants').checked,

    endsMultiplier: document.getElementById('modEndsMultiplier').checked,
    endsMultiplierLetter: document.getElementById('endsMultiplierLetter').value.toUpperCase(),

    threeVowels: document.getElementById('modThreeVowels').checked,
    moreVowels: document.getElementById('modMoreVowels').checked,
    noE: document.getElementById('modNoE').checked,

    letterMultiplier: document.getElementById('modLetterMultiplier').checked,
    letterMultiplierLetter: document.getElementById('letterMultiplierLetter').value.toUpperCase(),

    re: document.getElementById('modRe').checked
  };
}

function calculatePoints(word, usedWildcards, modifiers) {
  let letters = word.split('');
  let total = 0;
  let bonus = getBonus(word.length);
  let finalMultiplier = 1;

  if (modifiers.qu) {
    letters = letters.map(l => l === 'Q' ? 'QU' : l);
  }

  const scores = letters.map((letter, i) => {
    const baseLetter = letter[0];
    return usedWildcards[i] ? 0 : (pointsMap[baseLetter] || 0);
  });

  if (modifiers.secondTile && scores[1] !== undefined) {
    scores[1] *= 3;
  }

  if (modifiers.fourthTile && scores[3] !== undefined) {
    scores[3] *= 3;
  }

  if (modifiers.firstVowel5x) {
    const first = letters[0][0];

    if (isVowel(first, modifiers.yVowel)) {
      scores[0] *= 5;
    }
  }

  if (modifiers.fiveTiles && letters.length === 5) {
    scores[0] *= 3;
    scores[scores.length - 1] *= 3;
  }

  if (modifiers.lowestConsonant) {
    let lowest = Infinity;
    let idx = -1;

    scores.forEach((score, i) => {
      const l = letters[i][0];

      if (!isVowel(l, modifiers.yVowel) && score < lowest) {
        lowest = score;
        idx = i;
      }
    });

    if (idx >= 0) {
      scores[idx] *= 5;
    }
  }

  total = scores.reduce((a, b) => a + b, 0);

  if (
    modifiers.startsWith &&
    word.startsWith(modifiers.startsWithLetter)
  ) {
    bonus += 20;
  }

  if (
    modifiers.endsWith &&
    word.endsWith(modifiers.endsWithLetter)
  ) {
    bonus += 20;
  }

  if (modifiers.oddEven) {
    bonus += word.length % 2 === 1 ? 10 : -5;
  }

  if (
    modifiers.exactTiles &&
    word.length === modifiers.exactTilesCount
  ) {
    bonus += 10;
  }

  if (modifiers.refreshes) {
    bonus += modifiers.refreshCount;
  }

  if (modifiers.sellPrices) {
    bonus += modifiers.sellPricesAmount;
  }

  if (modifiers.doubleLongBonus) {
    if (word.length > 5) {
      bonus *= 2;
    } else {
      total = 0;
    }
  }

  const uniqueLetters = new Set(word).size === word.length;

  if (modifiers.uniqueLetters && uniqueLetters) {
    finalMultiplier *= 1.5;
  }

  if (
    modifiers.firstLastVowel &&
    isVowel(word[0], modifiers.yVowel) &&
    isVowel(word[word.length - 1], modifiers.yVowel)
  ) {
    finalMultiplier *= 2;
  }

  if (
    modifiers.firstLastSame &&
    word[0] === word[word.length - 1]
  ) {
    finalMultiplier *= 2;
  }

  if (
    modifiers.firstVowelFinal &&
    isVowel(word[0], modifiers.yVowel)
  ) {
    finalMultiplier *= 1.5;
  }

  if (
    modifiers.beginsMultiplier &&
    word.startsWith(modifiers.beginsMultiplierLetter)
  ) {
    finalMultiplier *= 2;
  }

  if (
    modifiers.doubleLetters &&
    /(.)\1/.test(word)
  ) {
    finalMultiplier *= 1.5;
  }

  if (
    modifiers.noDoubleConsonants &&
    !/[BCDFGHJKLMNPQRSTVWXZ]{2}/.test(word)
  ) {
    finalMultiplier *= 2;
  }

  if (
    modifiers.endsMultiplier &&
    word.endsWith(modifiers.endsMultiplierLetter)
  ) {
    finalMultiplier *= 2;
  }

  const vowels = [
    ...new Set(
      word.split('').filter(l =>
        isVowel(l, modifiers.yVowel)
      )
    )
  ];

  if (modifiers.threeVowels && vowels.length >= 3) {
    finalMultiplier *= 2;
  }

  const vowelCount = word
    .split('')
    .filter(l => isVowel(l, modifiers.yVowel)).length;

  const consonantCount = word.length - vowelCount;

  if (
    modifiers.moreVowels &&
    vowelCount > consonantCount
  ) {
    finalMultiplier *= 2;
  }

  if (
    modifiers.noE &&
    !word.includes('E')
  ) {
    finalMultiplier *= 2;
  }

  if (modifiers.letterMultiplier) {
    const count = word
      .split('')
      .filter(l => l === modifiers.letterMultiplierLetter)
      .length;

    if (count > 0) {
      finalMultiplier *= count;
    }
  }

  return Math.floor((total + bonus) * finalMultiplier);
}

function canMakeWord(wordUpper, letters, modifiers) {
  const letterCounts = {};
  let wildcards = 0;

  for (const char of letters.toUpperCase()) {
    if (char === '*') {
      wildcards++;
    } else {
      letterCounts[char] = (letterCounts[char] || 0) + 1;
    }
  }

  if (modifiers.re && wordUpper.startsWith('RE')) {
    wordUpper = wordUpper.slice(2);
  }

  const tempLetterCounts = { ...letterCounts };
  const usedWildcards = [];

  for (let i = 0; i < wordUpper.length; i++) {
    let char = wordUpper[i];

    if (modifiers.sz) {
      if (char === 'S' && tempLetterCounts['Z']) {
        char = 'Z';
      } else if (char === 'Z' && tempLetterCounts['S']) {
        char = 'S';
      }
    }

    if (tempLetterCounts[char]) {
      tempLetterCounts[char]--;
      usedWildcards[i] = false;
    } else if (wildcards > 0) {
      wildcards--;
      usedWildcards[i] = true;
    } else {
      return null;
    }
  }

  return usedWildcards;
}

function findMatches(letters) {
  const modifiers = getModifiers();
  const matches = [];

  for (const word of wordList) {
    const wordUpper = word.toUpperCase();

    const usedWildcards = canMakeWord(
      wordUpper,
      letters,
      modifiers
    );

    if (usedWildcards) {
      const totalPoints = calculatePoints(
        wordUpper,
        usedWildcards,
        modifiers
      );

      matches.push({
        word,
        points: totalPoints,
        length: word.length
      });
    }
  }

  return matches;
}

function displayWords(words, sortBy) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

  const grouped = {};

  for (const word of words) {
    const key = sortBy === 'length'
      ? word.length
      : word.points;

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(word);
  }

  const sortedGroups = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  for (const group of sortedGroups) {
    const section = document.createElement('div');
    section.className = 'word-section';

    const header = document.createElement('h3');
    header.className = 'collapsible';

    header.textContent = sortBy === 'length'
      ? `${group} Letters`
      : `${group} Points`;

    const list = document.createElement('ul');
    list.className = 'word-list';

    grouped[group].forEach(word => {
      const li = document.createElement('li');
      li.textContent = `${word.word} (${word.points} pts)`;
      list.appendChild(li);
    });

    header.addEventListener('click', () => {
      const isCollapsed = list.style.display === 'none';

      list.style.display = isCollapsed
        ? 'block'
        : 'none';

      header.classList.toggle(
        'collapsed',
        !isCollapsed
      );
    });

    section.appendChild(header);
    section.appendChild(list);

    resultsContainer.appendChild(section);
  }
}

document.getElementById('findWords').addEventListener('click', () => {
  const letters = document.getElementById('lettersInput').value;
  const sortBy = document.getElementById('sortSelect').value;

  const matches = findMatches(letters);

  const sorted = matches.sort((a, b) => {
    return sortBy === 'length'
      ? b.length - a.length
      : b.points - a.points;
  });

  displayWords(sorted, sortBy);
});

document.getElementById('lettersInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('findWords').click();
  }
});
