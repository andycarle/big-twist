const LIGHT_COLOR = "white";
const INACTIVE_COLOR = "#FFFFFF77";
const DARK_COLOR = "black";
const BAD_COLOR = "red";

const BackgroundSkin = Skin.template({ fill: DARK_COLOR })

const BigStyle = Style.template({ font:"80px Verdana", color: [LIGHT_COLOR, DARK_COLOR], top: -8 });
const SmallStyle = Style.template({ font:"35px Verdana", color: [DARK_COLOR, DARK_COLOR, BAD_COLOR], top: -8 });
const NumberStyle = Style.template({ font:"52px Open Sans", color: [LIGHT_COLOR, DARK_COLOR], top: -8, horizontal: "left"});

export default {
	LIGHT_COLOR,
	INACTIVE_COLOR,
	DARK_COLOR,
	BAD_COLOR,
	BackgroundSkin,
	BigStyle,
	SmallStyle,
	NumberStyle
}