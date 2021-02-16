import ASSETS from "assets";
import {VerticalScrollerBehavior} from "scroller"

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
		this.numberOfLetters = data.letters;
		for (let i = 0; i < this.numberOfLetters; i++) {
			row.add(new SmallLetterSquare)
		}
	}
	onWordFound(row, word, numberOfLetters, index, state){
		if (!(this.index == index && this.numberOfLetters == numberOfLetters))
			return;

		for (let i = 0; i < word.length; i++){
			let char = word.charAt(i);
			row.content(i).state = state;
			row.content(i).string = char;
		}
	}
}

const Word = Row.template($ => ({
	left: 10, top: 0, bottom: 10,
	Behavior: WordBehavior
}));

class GuessedWordsContainerBehavior extends Behavior {
	onCreate(column, data) {
		this.data = data;
	}
	onRoundBegin(column, roundData) {
		column.empty();
		let threeCols = [3];
		let twoCols = [4, 5];
		let oneCol = [6, 7, 8];

		for (let i of threeCols) {
			if (roundData[i]) {
				let numberOfWords = roundData[i];
				let container = new Row({ numberofLetters: i }, { top: 0, width: 500, Behavior: ThreeColumnBehavior });
				column.add(container);
				container.delegate("onFill", numberOfWords);	
			}
		}

		for (let i of twoCols) {
			if (roundData[i]) {
				let numberOfWords = roundData[i];
				let container = new Row({ numberofLetters: i }, { top: 0, width: 500, Behavior: TwoColumnBehavior });
				column.add(container);
				container.delegate("onFill", numberOfWords);	
			}
		}

		for (let i of oneCol) {
			if (roundData[i]) {
				let numberOfWords = roundData[i];
				let container = new Column({}, { top: 0, width: 500 });
				column.add(container);
				let indices = [...Array(numberOfWords).keys()];
				for (let index of indices) {
					container.add(new Word({ index, letters: i }));
				}
			}
		}
	}
}

class ThreeColumnBehavior extends Behavior {
	onCreate(container, data) {
		this.numberofLetters = data.numberofLetters;
		container.add(new Column(null, {top: 0}));
		container.add(new Column(null, {top: 0}));
		container.add(new Column(null, {top: 0}));
	}
	onFill(container, numberOfWords) {
		let indices = [...Array(numberOfWords).keys()];
		while (indices.length) {
			container.first.add(new Word({ index: indices.shift(), letters: this.numberofLetters }));
			if (indices.length)
				container.first.next.add(new Word({ index: indices.shift(), letters: this.numberofLetters }));
			if (indices.length)
				container.last.add(new Word({ index: indices.shift(), letters: this.numberofLetters }))
		}
	}
}

class TwoColumnBehavior extends Behavior {
	onCreate(container, data) {
		this.numberofLetters = data.numberofLetters;
		container.add(new Column(null, {top: 0}));
		container.add(new Column(null, {top: 0, right: 0}));
	}
	onFill(container, numberOfWords) {
		let indices = [...Array(numberOfWords).keys()];
		while (indices.length) {
			container.first.add(new Word({ index: indices.shift(), letters: this.numberofLetters }));
			if (indices.length)
				container.last.add(new Word({ index: indices.shift(), letters: this.numberofLetters }))
		}
	}
}

const GuessedWordsContainer = Scroller.template($ => ({
	left: 0, width: 500, top: 0, bottom: 0, 
	active: true, Behavior: VerticalScrollerBehavior,
	contents:[
		Column($, {
			left: 0, right: 0, top: 0,
			anchor: "GUESSED_WORDS",
			Style: ASSETS.SmallStyle,
			Behavior: GuessedWordsContainerBehavior
		}),
	]
}));

export default GuessedWordsContainer;