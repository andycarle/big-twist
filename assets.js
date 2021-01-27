const LIGHT_COLOR = "white";
const DARK_COLOR = "black";

const BackgroundSkin = Skin.template({ fill: DARK_COLOR })

const BigStyle = Style.template({ font:"80px Verdana", color: [LIGHT_COLOR, DARK_COLOR], top: -8 });
const SmallStyle = Style.template({ font:"35px Verdana", color: [LIGHT_COLOR, DARK_COLOR], top: -8 });
const NumberStyle = Style.template({ font:"52px Open Sans", color: [LIGHT_COLOR, DARK_COLOR], top: -8, horizontal: "left"});

export default {
	LIGHT_COLOR,
	DARK_COLOR,
	BackgroundSkin,
	BigStyle,
	SmallStyle,
	NumberStyle
}