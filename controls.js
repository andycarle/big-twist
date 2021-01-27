import Timeline from "piu/Timeline";
import ASSETS from "assets";

const CircleTexture = Texture.template({ path: "circle.png" });
const CircleSkin = Skin.template({
	Texture: CircleTexture,
	color: ASSETS.LIGHT_COLOR,
	x: 0, y: 0, height: 90, width: 90
});

class CircleLetterBehavior extends Behavior {
	onCreate(circle, data) {
		this.data = data;
	}
	onDisplaying(circle) {
		if (!this.origX) {
			this.origX = circle.x;
			this.origY = circle.y;
		}
		// trace(`${this.origX}, ${this.origY}\n`)
	}
	onTouchBegan(circle) {
		// trace(`tapped ${circle.string}\n`);
		if (this.placed) {
			this.data["SQUARES"].delegate("removeLetter", circle, this.origX, this.origY);
			this.placed = false;
		} else {
			this.data["SQUARES"].delegate("addLetter", circle, this.origX, this.origY);
			this.placed = true;
		}
	}
	moveBack(circle) {
		circle.x = this.origX;
		circle.y = this.origY;
		this.placed = false;
	}
}

const CircleLetter = Label.template($ => ({
	height: 90, width: 90, top: 0, left: 0,
	Skin: CircleSkin, Style: ASSETS.BigStyle, state: 1,
	active: true, Behavior: CircleLetterBehavior
}));

const SmallCircleTexture = Texture.template({ path: "circle-sm.png" });
const SmallCircleSkin = Skin.template({
	Texture: SmallCircleTexture,
	color: ASSETS.LIGHT_COLOR,
	x: 0, y: 0, height: 45, width: 45
});

const CirclePlaceHolder = Content.template($ => ({ 
	Skin: SmallCircleSkin 
}));

const LargeSquareTexture = Texture.template({ path: "square-lg.png" });
const LargeSquareSkin = Skin.template({
	Texture: LargeSquareTexture,
	color: ASSETS.LIGHT_COLOR,
	x: 0, y: 0, height: 100, width: 100
});

const BigLetterSquare = Container.template($ => ({
	height: 100, width: 100, top: 0, Skin: LargeSquareSkin
})); 

class ControlsColBehavior extends Behavior {
	onCreate(column, data) {
		this.data = data;
	}
	onRoundBegin(column, word) {
		let data = this.data;
		word = word.toUpperCase();
		let squaresRow = data["SQUARES"];
		let circlesRow = data["CIRCLES"];
		squaresRow.delegate("onRoundBegin");
		squaresRow.empty();
		circlesRow.empty();
		for (let left=0; word.length; left+=110) {
			let randomLetterIndex = Math.round(Math.random() * (word.length-1));
			let letter = word[randomLetterIndex];
			word = word.replace(letter, "");
			squaresRow.add(new BigLetterSquare(data, { left }));
			circlesRow.add(new CirclePlaceHolder(data, { left: left+22 }));
			circlesRow.add(new CircleLetter(data, { string: letter, left }));
		}
	}
}

const ADDING = 0;
const REMOVING = 1;
const SQUISHING = 2;

class SquaresRowBehavior extends Behavior {
	onCreate(container, data) {
		this.data = data;
		this.word = "";
	}
	onRoundBegin(container) {
		this.word = "";
	}
	addLetter(container, letter, origX, origY) {
		this.state = ADDING;
		this.letter = letter;
		let index = this.word.length;
		let square = container.content(index);

		let timeline = this.timeline = new Timeline();
		timeline.on(letter, { x: [origX, square.x+5], y: [origY, square.y+5] }, 150, Math.quadEaseOut, 0);
		letter.container.remove(letter);
		square.add(letter);

		timeline.seekTo(0);
		container.duration = timeline.duration;
		container.time = 0;
		container.start();

		this.word += letter.string;
		trace(`word is: ${this.word}\n`);
	}
	removeLetter(container, letter, origX, origY) {
		this.state = REMOVING;
		this.letter = letter;
		let index = letter.container.index;
		trace(`index: ${index}\n`)
		let square = this.square = letter.container;

		let timeline = this.timeline = new Timeline();
		timeline.on(letter, { x: [letter.x, origX], y: [letter.y, origY] }, 150, Math.quadEaseOut, 0);
		square.remove(letter);
		this.data["CIRCLES"].add(letter);

		timeline.seekTo(0);
		container.duration = timeline.duration;
		container.time = 0;
		container.start();

		this.word = this.word.slice(0, index) + this.word.slice(index+1);
		trace(`word is: ${this.word}\n`)
	}
	squishLetters(container) {
		this.state = SQUISHING;

		let emptySquare = this.square;
		let nextSquare = emptySquare.next;
		if ((!nextSquare) || (nextSquare.length == 0))
			return;
		else {
			let timeline = this.timeline = new Timeline();
			let letter = nextSquare.first;
			timeline.on(letter, { x: [letter.x, emptySquare.x+5], y: [letter.y, emptySquare.y+5] }, 150, Math.quadEaseOut, 0);
			nextSquare.remove(letter);
			emptySquare.add(letter);
			emptySquare = nextSquare;
			nextSquare = nextSquare.next;
			while (nextSquare && nextSquare.length) {
				letter = nextSquare.first;
				timeline.on(letter, { x: [letter.x, emptySquare.x+5], y: [letter.y, emptySquare.y+5] }, 150, Math.quadEaseOut, -75);
				nextSquare.remove(letter);
				emptySquare.add(letter);
				emptySquare = nextSquare;
				nextSquare = nextSquare.next;
			}
			timeline.seekTo(0);
			container.duration = timeline.duration;
			container.time = 0;
			container.start();
		}
	}
	clearLetters(container) {
		let square = container.first;
		while (square && square.length) {
			let letter = square.first;
			square.remove(letter);
			this.data["CIRCLES"].add(letter);
			letter.delegate("moveBack");
			square = square.next;
		}
		this.word = "";
	}
	onTimeChanged(container) {
		this.timeline.seekTo(container.time);
	}
	onFinished(container) {
		switch (this.state) {
			case ADDING:
				break;
			case REMOVING:
				this.squishLetters(container);
				break;
			case SQUISHING:
				break;
		}
	}
	enterWord(container) {
		this.lastWord = this.word;
		// submit this.word;
	}
	getLastWord(container) {
		// TO DO
	}
	scrambleLetters(container) {
		// TO DO
	}
}

class NewRoundButtonBehavior extends Behavior {
	onCreate(content, data) {
		this.data = data;
	}
	onTouchBegan(content) {
		application.delegate("onRequestNewRound");
	}
}

class EnterButtonBehavior extends Behavior {
	onCreate(content, data) {
		this.data = data;
	}
	onTouchBegan(content) {
		// do stuff
	}
}

class ButtonBehavior extends Behavior {
	onCreate(button, data) {
		this.action = data.action;
	}
	onTouchBegan(button) {
		application.distribute(this.action);
	}
}

const Button = Label.template($ => ({
	height: 50, left: 10, right: 10, skin: { fill: ASSETS.LIGHT_COLOR },
	Style: ASSETS.SmallStyle, state: 1, string: $.string,
	active: true, Behavior: ButtonBehavior
}));

const ControlsCol = Column.template($ => ({
	anchor: "CONTROLS", left: 400, right: 0, top: 0, bottom: 0,
	Style: ASSETS.BigStyle,
	contents: [
		Content($, {top: 0, bottom: 0}),
		Container($, {
			anchor: "SQUARES", height: 100, left: 0, right: 0,
			Behavior: SquaresRowBehavior
		}),
		Container($, {
			anchor: "CIRCLES", top: 80, height: 100, left: 0, right: 0,
		}),
		Row($, {
			anchor: "BUTTONS", top: 80, height: 100, left: 0, right: 0,
			contents: [
				new Button({ string: "TWIST", action: "scrambleLetters" }),
				new Button({ string: "ENTER", action: "enterWord" }),
				new Button({ string: "LAST WORD", action: "getLastWord" }),
				new Button({ string: "CLEAR", action: "clearLetters" })
			]
		}),
		Label($, {
			top: 80, height: 50, width: 280, skin: { fill: ASSETS.LIGHT_COLOR },
			Style: ASSETS.SmallStyle, state: 1, string: "NEW ROUND",
			active: true, Behavior: NewRoundButtonBehavior
		}),
		Content($, {top: 0, bottom: 0})
	],
	Behavior: ControlsColBehavior
}));

export default ControlsCol;