import Round from "Words";
import ASSETS from "assets";
import LeftCol from "guessed-words";
import RightCol from "controls";

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
		let round = new Round({bigWord: 6, minimumWord: 3 });
		round.startRound((word, list) => {
			application.delegate("onRoundBegin", word, list);
		    // trace(`Word is: ${word}\n`);
		    // trace(`List is: ${JSON.stringify(list)}\n`);
		});
	}
	onRoundBegin(application, word, roundData) {
		let data = this.data;
		data["CONTROLS"].delegate("onRoundBegin", word);
		data["GUESSED_WORDS"].delegate("onRoundBegin", roundData);
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