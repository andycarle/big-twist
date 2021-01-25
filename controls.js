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
	onTouchBegan(circle) {
		trace(`tapped ${circle.string}\n`);
		this.data["SQUARES"].delegate("addLetter", circle);
	}
}

const CircleLetter = Label.template($ => ({
	height: 90, width: 90, top: 0,
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

const BigLetterSquare = Content.template($ => ({
	height: 100, width: 100, top: 0,Skin: LargeSquareSkin
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

class SquaresRowBehavior extends Behavior {
	onCreate(container, data) {
		this.data = data;
		this.word = "";
	}
	onRoundBegin(container) {
		this.word = "";
	}
	addLetter(container, letter) {
		let index = this.word.length;
		let x = container.content(index).x + 5;
		let y = container.content(index).y + 5;
		let timeline = this.timeline = new Timeline();
		timeline.to(letter, { x, y }, 150, Math.quadEaseOut, 0);
		timeline.seekTo(0);
		container.duration = timeline.duration;
		container.time = 0;
		container.start();

		this.word += letter.string;
		trace(`word is: ${this.word}\n`)
	}
	onTimeChanged(container) {
		this.timeline.seekTo(container.time);
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