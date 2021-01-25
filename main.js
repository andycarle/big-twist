import Round from "Words";

let round = new Round({bigWord: 6, minimumWord: 3 });
round.startRound((word, list) => {
    trace(`Word is: ${word}\n`);
    trace(`List is: ${JSON.stringify(list)}\n`);
});