import Timeline from "piu/Timeline";
import ASSETS from "assets";
import Timer from "timer";

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
	}
	onTouchBegan(circle) {
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
		word = this.word = word.toUpperCase();
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
		this.resetButtons(column);
	}
	resetButtons(column) {
		let button = this.data["BUTTONS"].first; // twist
		button.delegate("enable");
		button = button.next; // enter
		button.delegate("disable");
		button = button.next; // last word
		button.delegate("disable");
		button = button.next; // clear
		button.delegate("disable");
	}
	scrambleLetters(column) {
		let data = this.data;
		let word = this.word;
		let squaresRow = data["SQUARES"];
		let circlesRow = data["CIRCLES"];
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
const REPLACING = 3;

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
		if (this.word.length == 1)
			this.data["BUTTONS"].last.delegate("enable");			// enable the clear button
		if (this.word.length == 3)
			this.data["BUTTONS"].first.next.delegate("enable");		// enable the enter button
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
		if (this.word.length == 0)
			this.data["BUTTONS"].last.delegate("disable");			// disable the clear button
		if (this.word.length < 3)
			this.data["BUTTONS"].first.next.delegate("disable");	// disable the enter button
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
		this.data["BUTTONS"].first.next.delegate("disable");	// disable the enter button
		this.data["BUTTONS"].last.delegate("disable");			// disable the clear button		
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
			case REPLACING:
				break;
		}
	}
	enterWord(container) {
		this.lastWord = this.word;
		Timer.set(()=>{
			container.delegate("clearLetters");
		}, 250);
		container.bubble("onSubmitButton", this.word);
		this.data["BUTTONS"].last.previous.delegate("enable");		// enable the last button
	}
	getLastWord(container) {
		this.clearLetters(container);
		this.state = REPLACING;

		let word = this.word = this.lastWord;
		let square = container.first;
		let letter = this.findLetter(word[0]);
		let timeline = this.timeline = new Timeline();
		timeline.on(letter, { x: [letter.x, square.x+5], y: [letter.y, square.y+5] }, 150, Math.quadEaseOut, 0);
		letter.container.remove(letter);
		square.add(letter);
		for (let i=1; i<word.length; i++) {
			square = square.next;
			letter = this.findLetter(word[i]);
			timeline.on(letter, { x: [letter.x, square.x+5], y: [letter.y, square.y+5] }, 150, Math.quadEaseOut, -75);
			letter.container.remove(letter);
			square.add(letter);
		}
		timeline.seekTo(0);
		container.duration = timeline.duration;
		container.time = 0;
		container.start();
		this.data["BUTTONS"].first.next.delegate("enable");	// enable the enter button
		this.data["BUTTONS"].last.delegate("enable");		// enable the clear button				
	}
	findLetter(letter) {
		let circle = this.data["CIRCLES"].first;
		let x = circle.string;x
		while (circle.string != letter) {
			circle = circle.next;
		}
		return circle;
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

const Button = Label.template($ => ({
	height: 50, Skin: ASSETS.ButtonSkin,
	Style: ASSETS.SmallStyle, state: 1, string: $.string,
	active: true, Behavior: ASSETS.ButtonBehavior
}));

const ControlsCol = Column.template($ => ({
	anchor: "CONTROLS", left: 500, right: 0, top: 0, bottom: 0,
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
		Container($, {
			anchor: "BUTTONS", top: 80, height: 110, width: 458,
			contents: [
				new Button({ string: "TWIST", action: "scrambleLetters" }, { width: 177, top: 0, left: 48 }),
				new Button({ string: "ENTER", action: "enterWord" }, { width: 175, top: 0, right: 48  }),
				new Button({ string: "LAST WORD", action: "getLastWord" }, { width: 274, bottom: 0, left: 0 }),
				new Button({ string: "CLEAR", action: "clearLetters" }, { width: 174, bottom: 0, right: 0 })
			]
		}),
		Row($, {
			top: 80, height: 50, left: 0, right: 0,
			contents: [
				Column($, {
					top: 0, bottom: 0, left: 0, right: 0,
					contents:[
						Label($, {
							anchor: "SCORE", top: 5, left: 5, height: 52, width: 400, skin: { fill: ASSETS.LIGHT_COLOR},
							Style: ASSETS.NumberStyle, state: 1, string: "Score: ",
							Behavior: class extends Behavior {
								onScoreUpdate(label, score){
									label.string = "Score: " + score;
								}
							}
						}),
						Label($, {
							anchor: "TIME", top: 5, left: 5, height: 52, width: 400, skin: { fill: ASSETS.LIGHT_COLOR },
							Style: ASSETS.NumberStyle, state: 1, string: "Time: ",
							Behavior: class extends Behavior {
								updateTimeString(label){
									let timeLeft = label.duration - label.time;
									timeLeft = Math.floor(timeLeft / 1000);
									const min = Math.floor(timeLeft / 60);
									const sec = (timeLeft % 60).toString().padStart(2,"0)");
									label.string = `Time: ${min}:${sec}`;
								}
								onRoundStart(label, duration) {
									this.maxTime = duration;
									label.duration = duration * 1000;
									label.time = 0;
									label.interval = 250;
									label.start();
									this.updateTimeString(label);
								}
								onTimeChanged(label) {
									this.updateTimeString(label);
								}
								onFinished(label) {
									label.bubble("onTimeExpired");
								}
							}
						})
					]
				}),
				Label($, {
					left: 5, top: 20, height: 50, width: 280, skin: { fill: ASSETS.LIGHT_COLOR },
					Style: ASSETS.SmallStyle, state: 1, string: "NEW ROUND",
					active: true, Behavior: NewRoundButtonBehavior
				})
			]	
		}),
		Content($, {top: 0, bottom: 0})
	],
	Behavior: ControlsColBehavior
}));

export default ControlsCol;