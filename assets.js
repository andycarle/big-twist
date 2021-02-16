const LIGHT_COLOR = "white";
const INACTIVE_COLOR = "#FFFFFF77";
const DARK_COLOR = "black";
const BAD_COLOR = "red";

const BackgroundSkin = Skin.template({ fill: DARK_COLOR });
const ButtonSkin = Skin.template({ fill: [LIGHT_COLOR, INACTIVE_COLOR] });
const BigStyle = Style.template({ font:"80px Verdana", color: [LIGHT_COLOR, DARK_COLOR], top: -8 });
const SmallStyle = Style.template({ font:"35px Verdana", color: [DARK_COLOR, DARK_COLOR, BAD_COLOR, LIGHT_COLOR], top: -8 });
const NumberStyle = Style.template({ font:"52px Open Sans", color: [LIGHT_COLOR, DARK_COLOR], top: -8, horizontal: "left"});

class ButtonBehavior extends Behavior {
	onCreate(button, data) {
		this.action = data.action;
		this.value = data.value;
	}
	onTouchBegan(button) {
		application.distribute(this.action, this.value);
	}
	disable(button) {
		button.state = 1;
		button.active = false;
	}
	enable(button) {
		button.state = 0;
		button.active = true;
	}
}

export default {
	LIGHT_COLOR,
	INACTIVE_COLOR,
	DARK_COLOR,
	BAD_COLOR,
	BackgroundSkin,
	ButtonSkin,
	BigStyle,
	SmallStyle,
	NumberStyle,
	ButtonBehavior
}