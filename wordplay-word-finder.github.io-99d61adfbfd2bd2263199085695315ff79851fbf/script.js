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

function calculatePoints(word, usedWildcards) {
  return word.split('').reduce((sum, letter, i) => {
    return sum + (usedWildcards[i] ? 0 : pointsMap[letter] || 0);
  }, 0);
}

function getBonus(length) {
  return lengthBonuses[length] || 0;
}

function findMatches(letters) {
  const letterCounts = {};
  let wildcards = 0;

  for (const char of letters.toUpperCase()) {
    if (char === '*') wildcards++;
    else letterCounts[char] = (letterCounts[char] || 0) + 1;
  }

  const matches = [];

  for (const word of wordList) {
    const wordUpper = word.toUpperCase();
    const wordCounts = {};
    let usedWildcards = [];
    let tempWildcards = wildcards;
    let match = true;

    for (const char of wordUpper) {
      wordCounts[char] = (wordCounts[char] || 0) + 1;
    }

    const tempLetterCounts = { ...letterCounts };

    for (let i = 0; i < wordUpper.length; i++) {
      const char = wordUpper[i];
      if (tempLetterCounts[char]) {
        tempLetterCounts[char]--;
        usedWildcards[i] = false;
      } else if (tempWildcards > 0) {
        tempWildcards--;
        usedWildcards[i] = true;
      } else {
        match = false;
        break;
      }
    }

    if (match) {
      const base = calculatePoints(wordUpper, usedWildcards);
      const bonus = getBonus(wordUpper.length);
      matches.push({
        word: word,
        points: base + bonus,
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
    const key = sortBy === 'length' ? word.length : word.points;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(word);
  }

  const sortedGroups = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  for (const group of sortedGroups) {
    const section = document.createElement('div');
    section.className = 'word-section';

    const header = document.createElement('h3');
    header.textContent = sortBy === 'length' 
      ? `${group} Letters` 
      : `${group} Points`;
    header.className = 'collapsible';

    const list = document.createElement('ul');
    list.className = 'word-list';

    grouped[group].forEach(word => {
      const li = document.createElement('li');
      li.textContent = `${word.word} (${word.points} pts)`;
      list.appendChild(li);
    });

    header.addEventListener('click', () => {
      const isCollapsed = list.style.display === 'none';
      list.style.display = isCollapsed ? 'block' : 'none';
      header.classList.toggle('collapsed', !isCollapsed);
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
  const sorted = matches.sort((a, b) => sortBy === 'length' ? b.length - a.length : b.points - a.points);
  displayWords(sorted, sortBy);
});

document.getElementById('lettersInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('findWords').click();
  }
});
