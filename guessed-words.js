import ASSETS from "assets";

const SquareTexture = Texture.template({ path: "square.png" });
const SquareSkin = Skin.template({
	Texture: SquareTexture,
	color: ASSETS.LIGHT_COLOR,
	x: 0, y: 0, height: 45, width: 45,
	tiles: { left: 10, right: 10, top: 10, bottom: 10 }
});

const SmallLetterSquare = Label.template($ => ({
	height: 45, width: 45, right: 3, Skin: SquareSkin, 
	state: 1, string: ""
}));

class WordBehavior extends Behavior {
	onCreate(row, data) {
		this.index = data.index;
		let numberOfLetters = data.letters;
		for (let i=0; i<numberOfLetters; i++) {
			row.add(new SmallLetterSquare)
		}
	}
}

const Word = Row.template($ => ({
	left: 10, top: 0, bottom: 10,
	Behavior: WordBehavior
}));

class GuessedWordsColBehavior extends Behavior {
	onCreate(column, data) {

	}
	onRoundBegin(column, roundData) {
		column.empty();
		/*
			keys are number of letters, value is number of words with `key` letters. For example:
				{
					3: 11,
					4: 10
					5: 8
					6: 6
					7: 3
					8: 1

				}
		*/
		let keys = Object.keys(roundData);
		for (let numberofLetters of keys) {
			numberofLetters = numberofLetters;
			let numberOfWords = roundData[numberofLetters];
			let indices = [...Array(numberOfWords).keys()];
			for (let index of indices) {
				column.add(new Word({ index, letters: numberofLetters }));
			}
		}
	}
}

const GuessedWordsCol = Column.template($ => ({
	anchor: "GUESSED_WORDS",
	left: 0, width: 400, top: 0,
	Style: ASSETS.SmallStyle,
	Behavior: GuessedWordsColBehavior
}));

export default GuessedWordsCol;