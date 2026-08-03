export const getGuessStatuses = (solution, guess) => {
  const splitSolution = solution.toUpperCase().split("");
  const splitGuess = guess.toUpperCase().split("");

  const solutionCharsTaken = splitSolution.map(() => false);
  const solutionCharSet = new Set(splitSolution);

  const statuses = new Array(splitGuess.length);

  splitGuess.forEach((letter, i) => {
    if (letter === splitSolution[i]) {
      statuses[i] = "correct";
      solutionCharsTaken[i] = true;
    }
  });

  splitGuess.forEach((letter, i) => {
    if (statuses[i]) return;

    if (!solutionCharSet.has(letter)) {
      statuses[i] = "absent";
      return;
    }

    const indexOfPresentChar = splitSolution.findIndex(
      (x, index) => x === letter && !solutionCharsTaken[index]
    );

    if (indexOfPresentChar > -1) {
      statuses[i] = "present";
      solutionCharsTaken[indexOfPresentChar] = true;
    } else {
      statuses[i] = "absent";
    }
  });

  return statuses;
};
