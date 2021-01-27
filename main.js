import Round from "Words";
import ASSETS from "assets";
import LeftCol from "guessed-words";
import RightCol from "controls";

const GAME_TIME = 180;

class GameBehavior extends Behavior {
	onCreate(application, data) {
		this.data = data;
    }
	onRequestNewRound(application) {
		// this.onRoundBegin(application, "testing", {
		// 	3: 2,
		// 	4: 2,
		// 	5: 1,
		// 	6: 1,
		// 	7: 1,
		// 	8: 2
		// });
		this.round = new Round({bigWord: 6, minimumWord: 3 });
		this.round.startRound();
	}
	onRoundBegin(application, word, roundData) {
		let data = this.data;
		data["CONTROLS"].delegate("onRoundBegin", word);
        data["GUESSED_WORDS"].delegate("onRoundBegin", roundData);
        application.distribute("onRoundStart", GAME_TIME);
    }
    onSubmitButton(application, word){
        if (word === undefined || word.length === 0) return;
        let result = this.round.checkWord(word);
        trace(`${JSON.stringify(result)}`);
        if (result.newCorrect){
            application.distribute("onScoreUpdate", result.totalScore);
            application.distribute("onWordFound", word, result.newCorrect.length, result.newCorrect.spot, 1);
        }
    }
    onTimeExpired(application) {
        let remaining = this.round.getRest();
        for (let i of remaining){
            application.distribute("onWordFound", i.word.toUpperCase(), i.length, i.spot, 2);
        }
    }
    onError(error){
        trace(`Error fetching words.\n`);
    }
}

const Game = Application.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0,
    Skin: ASSETS.BackgroundSkin,
	contents: [
		new LeftCol($),
		new RightCol($)
	],  
	Behavior: GameBehavior
}));

export default new Game({}, {
	commandListLength: 50000,
	displayListLength: 50000 
});