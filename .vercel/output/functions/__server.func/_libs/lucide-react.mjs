import { i as __toESM } from "../_runtime.mjs";
import { R as require_react } from "./@tanstack/react-router+[...].mjs";
//#region node_modules/lucide-react/dist/esm/shared/src/utils.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
var toCamelCase = (string) => string.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase());
var toPascalCase = (string) => {
	const camelCase = toCamelCase(string);
	return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
	return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
var hasA11yProp = (props) => {
	for (const prop in props) if (prop.startsWith("aria-") || prop === "role" || prop === "title") return true;
};
//#endregion
//#region node_modules/lucide-react/dist/esm/defaultAttributes.js
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var defaultAttributes = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
};
//#endregion
//#region node_modules/lucide-react/dist/esm/Icon.js
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Icon = (0, import_react.forwardRef)(({ color = "currentColor", size = 24, strokeWidth = 2, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => (0, import_react.createElement)("svg", {
	ref,
	...defaultAttributes,
	width: size,
	height: size,
	stroke: color,
	strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
	className: mergeClasses("lucide", className),
	...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
	...rest
}, [...iconNode.map(([tag, attrs]) => (0, import_react.createElement)(tag, attrs)), ...Array.isArray(children) ? children : [children]]));
//#endregion
//#region node_modules/lucide-react/dist/esm/createLucideIcon.js
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var createLucideIcon = (iconName, iconNode) => {
	const Component = (0, import_react.forwardRef)(({ className, ...props }, ref) => (0, import_react.createElement)(Icon, {
		ref,
		iconNode,
		className: mergeClasses(`lucide-${toKebabCase(toPascalCase(iconName))}`, `lucide-${iconName}`, className),
		...props
	}));
	Component.displayName = toPascalCase(iconName);
	return Component;
};
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Badge = createLucideIcon("badge", [["path", {
	d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
	key: "3c2336"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Bell = createLucideIcon("bell", [["path", {
	d: "M10.268 21a2 2 0 0 0 3.464 0",
	key: "vwvbt9"
}], ["path", {
	d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
	key: "11g9vi"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var BookOpen = createLucideIcon("book-open", [["path", {
	d: "M12 7v14",
	key: "1akyts"
}], ["path", {
	d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
	key: "ruj8y"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Bookmark = createLucideIcon("bookmark", [["path", {
	d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z",
	key: "1fy3hk"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Building2 = createLucideIcon("building-2", [
	["path", {
		d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",
		key: "1b4qmf"
	}],
	["path", {
		d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",
		key: "i71pzd"
	}],
	["path", {
		d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",
		key: "10jefs"
	}],
	["path", {
		d: "M10 6h4",
		key: "1itunk"
	}],
	["path", {
		d: "M10 10h4",
		key: "tcdvrf"
	}],
	["path", {
		d: "M10 14h4",
		key: "kelpxr"
	}],
	["path", {
		d: "M10 18h4",
		key: "1ulq68"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CalendarDays = createLucideIcon("calendar-days", [
	["path", {
		d: "M8 2v4",
		key: "1cmpym"
	}],
	["path", {
		d: "M16 2v4",
		key: "4m81vk"
	}],
	["rect", {
		width: "18",
		height: "18",
		x: "3",
		y: "4",
		rx: "2",
		key: "1hopcy"
	}],
	["path", {
		d: "M3 10h18",
		key: "8toen8"
	}],
	["path", {
		d: "M8 14h.01",
		key: "6423bh"
	}],
	["path", {
		d: "M12 14h.01",
		key: "1etili"
	}],
	["path", {
		d: "M16 14h.01",
		key: "1gbofw"
	}],
	["path", {
		d: "M8 18h.01",
		key: "lrp35t"
	}],
	["path", {
		d: "M12 18h.01",
		key: "mhygvu"
	}],
	["path", {
		d: "M16 18h.01",
		key: "kzsmim"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Check = createLucideIcon("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ChevronDown = createLucideIcon("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ChevronLeft = createLucideIcon("chevron-left", [["path", {
	d: "m15 18-6-6 6-6",
	key: "1wnfg3"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ChevronRight = createLucideIcon("chevron-right", [["path", {
	d: "m9 18 6-6-6-6",
	key: "mthhwq"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CircleHelp = createLucideIcon("circle-help", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",
		key: "1u773s"
	}],
	["path", {
		d: "M12 17h.01",
		key: "p32p05"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CirclePause = createLucideIcon("circle-pause", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["line", {
		x1: "10",
		x2: "10",
		y1: "15",
		y2: "9",
		key: "c1nkhi"
	}],
	["line", {
		x1: "14",
		x2: "14",
		y1: "15",
		y2: "9",
		key: "h65svq"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Download = createLucideIcon("download", [
	["path", {
		d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
		key: "ih7n3h"
	}],
	["polyline", {
		points: "7 10 12 15 17 10",
		key: "2ggqvy"
	}],
	["line", {
		x1: "12",
		x2: "12",
		y1: "15",
		y2: "3",
		key: "1vk2je"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var GraduationCap = createLucideIcon("graduation-cap", [
	["path", {
		d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",
		key: "j76jl0"
	}],
	["path", {
		d: "M22 10v6",
		key: "1lu8f3"
	}],
	["path", {
		d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5",
		key: "1r8lef"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Headphones = createLucideIcon("headphones", [["path", {
	d: "M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3",
	key: "1xhozi"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Heart = createLucideIcon("heart", [["path", {
	d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
	key: "c3ymky"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Highlighter = createLucideIcon("highlighter", [["path", {
	d: "m9 11-6 6v3h9l3-3",
	key: "1a3l36"
}], ["path", {
	d: "m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4",
	key: "14a9rk"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var House = createLucideIcon("house", [["path", {
	d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",
	key: "5wwlr5"
}], ["path", {
	d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
	key: "1d0kgt"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Landmark = createLucideIcon("landmark", [
	["line", {
		x1: "3",
		x2: "21",
		y1: "22",
		y2: "22",
		key: "j8o0r"
	}],
	["line", {
		x1: "6",
		x2: "6",
		y1: "18",
		y2: "11",
		key: "10tf0k"
	}],
	["line", {
		x1: "10",
		x2: "10",
		y1: "18",
		y2: "11",
		key: "54lgf6"
	}],
	["line", {
		x1: "14",
		x2: "14",
		y1: "18",
		y2: "11",
		key: "380y"
	}],
	["line", {
		x1: "18",
		x2: "18",
		y1: "18",
		y2: "11",
		key: "1kevvc"
	}],
	["polygon", {
		points: "12 2 20 7 4 7",
		key: "jkujk7"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Languages = createLucideIcon("languages", [
	["path", {
		d: "m5 8 6 6",
		key: "1wu5hv"
	}],
	["path", {
		d: "m4 14 6-6 2-3",
		key: "1k1g8d"
	}],
	["path", {
		d: "M2 5h12",
		key: "or177f"
	}],
	["path", {
		d: "M7 2h1",
		key: "1t2jsx"
	}],
	["path", {
		d: "m22 22-5-10-5 10",
		key: "don7ne"
	}],
	["path", {
		d: "M14 18h6",
		key: "1m8k6r"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Library = createLucideIcon("library", [
	["path", {
		d: "m16 6 4 14",
		key: "ji33uf"
	}],
	["path", {
		d: "M12 6v14",
		key: "1n7gus"
	}],
	["path", {
		d: "M8 8v12",
		key: "1gg7y9"
	}],
	["path", {
		d: "M4 4v16",
		key: "6qkkli"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Lightbulb = createLucideIcon("lightbulb", [
	["path", {
		d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
		key: "1gvzjb"
	}],
	["path", {
		d: "M9 18h6",
		key: "x1upvd"
	}],
	["path", {
		d: "M10 22h4",
		key: "ceow96"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var MessagesSquare = createLucideIcon("messages-square", [["path", {
	d: "M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z",
	key: "p1xzt8"
}], ["path", {
	d: "M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1",
	key: "1cx29u"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Mic = createLucideIcon("mic", [
	["path", {
		d: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z",
		key: "131961"
	}],
	["path", {
		d: "M19 10v2a7 7 0 0 1-14 0v-2",
		key: "1vc78b"
	}],
	["line", {
		x1: "12",
		x2: "12",
		y1: "19",
		y2: "22",
		key: "x3vr5v"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Pause = createLucideIcon("pause", [["rect", {
	x: "14",
	y: "4",
	width: "4",
	height: "16",
	rx: "1",
	key: "zuxfzm"
}], ["rect", {
	x: "6",
	y: "4",
	width: "4",
	height: "16",
	rx: "1",
	key: "1okwgv"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Play = createLucideIcon("play", [["polygon", {
	points: "6 3 20 12 6 21 6 3",
	key: "1oa8hb"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Plus = createLucideIcon("plus", [["path", {
	d: "M5 12h14",
	key: "1ays0h"
}], ["path", {
	d: "M12 5v14",
	key: "s699le"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Printer = createLucideIcon("printer", [
	["path", {
		d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
		key: "143wyd"
	}],
	["path", {
		d: "M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",
		key: "1itne7"
	}],
	["rect", {
		x: "6",
		y: "14",
		width: "12",
		height: "8",
		rx: "1",
		key: "1ue0tg"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Repeat1 = createLucideIcon("repeat-1", [
	["path", {
		d: "m17 2 4 4-4 4",
		key: "nntrym"
	}],
	["path", {
		d: "M3 11v-1a4 4 0 0 1 4-4h14",
		key: "84bu3i"
	}],
	["path", {
		d: "m7 22-4-4 4-4",
		key: "1wqhfi"
	}],
	["path", {
		d: "M21 13v1a4 4 0 0 1-4 4H3",
		key: "1rx37r"
	}],
	["path", {
		d: "M11 10h1v4",
		key: "70cz1p"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Repeat = createLucideIcon("repeat", [
	["path", {
		d: "m17 2 4 4-4 4",
		key: "nntrym"
	}],
	["path", {
		d: "M3 11v-1a4 4 0 0 1 4-4h14",
		key: "84bu3i"
	}],
	["path", {
		d: "m7 22-4-4 4-4",
		key: "1wqhfi"
	}],
	["path", {
		d: "M21 13v1a4 4 0 0 1-4 4H3",
		key: "1rx37r"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var RotateCcw = createLucideIcon("rotate-ccw", [["path", {
	d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
	key: "1357e3"
}], ["path", {
	d: "M3 3v5h5",
	key: "1xhq8a"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Scale = createLucideIcon("scale", [
	["path", {
		d: "m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",
		key: "7g6ntu"
	}],
	["path", {
		d: "m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",
		key: "ijws7r"
	}],
	["path", {
		d: "M7 21h10",
		key: "1b0cd5"
	}],
	["path", {
		d: "M12 3v18",
		key: "108xh3"
	}],
	["path", {
		d: "M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2",
		key: "3gwbw2"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ScrollText = createLucideIcon("scroll-text", [
	["path", {
		d: "M15 12h-5",
		key: "r7krc0"
	}],
	["path", {
		d: "M15 8h-5",
		key: "1khuty"
	}],
	["path", {
		d: "M19 17V5a2 2 0 0 0-2-2H4",
		key: "zz82l3"
	}],
	["path", {
		d: "M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3",
		key: "1ph1d7"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Search = createLucideIcon("search", [["path", {
	d: "m21 21-4.34-4.34",
	key: "14j7rj"
}], ["circle", {
	cx: "11",
	cy: "11",
	r: "8",
	key: "4ej97u"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Send = createLucideIcon("send", [["path", {
	d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
	key: "1ffxy3"
}], ["path", {
	d: "m21.854 2.147-10.94 10.939",
	key: "12cjpa"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Settings = createLucideIcon("settings", [["path", {
	d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
	key: "1qme2f"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "3",
	key: "1v7zrd"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Shield = createLucideIcon("shield", [["path", {
	d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
	key: "oel41y"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Signpost = createLucideIcon("signpost", [
	["path", {
		d: "M12 13v8",
		key: "1l5pq0"
	}],
	["path", {
		d: "M12 3v3",
		key: "1n5kay"
	}],
	["path", {
		d: "M18 6a2 2 0 0 1 1.387.56l2.307 2.22a1 1 0 0 1 0 1.44l-2.307 2.22A2 2 0 0 1 18 13H6a2 2 0 0 1-1.387-.56l-2.306-2.22a1 1 0 0 1 0-1.44l2.306-2.22A2 2 0 0 1 6 6z",
		key: "gqqp9m"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var SkipBack = createLucideIcon("skip-back", [["polygon", {
	points: "19 20 9 12 19 4 19 20",
	key: "o2sva"
}], ["line", {
	x1: "5",
	x2: "5",
	y1: "19",
	y2: "5",
	key: "1ocqjk"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var SkipForward = createLucideIcon("skip-forward", [["polygon", {
	points: "5 4 15 12 5 20 5 4",
	key: "16p6eg"
}], ["line", {
	x1: "19",
	x2: "19",
	y1: "5",
	y2: "19",
	key: "futhcm"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Sparkles = createLucideIcon("sparkles", [
	["path", {
		d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
		key: "4pj2yx"
	}],
	["path", {
		d: "M20 3v4",
		key: "1olli1"
	}],
	["path", {
		d: "M22 5h-4",
		key: "1gvqau"
	}],
	["path", {
		d: "M4 17v2",
		key: "vumght"
	}],
	["path", {
		d: "M5 18H3",
		key: "zchphs"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Table2 = createLucideIcon("table-2", [["path", {
	d: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
	key: "gugj83"
}]]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Trash2 = createLucideIcon("trash-2", [
	["path", {
		d: "M3 6h18",
		key: "d0wm0j"
	}],
	["path", {
		d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",
		key: "4alrt4"
	}],
	["path", {
		d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
		key: "v07s0e"
	}],
	["line", {
		x1: "10",
		x2: "10",
		y1: "11",
		y2: "17",
		key: "1uufr5"
	}],
	["line", {
		x1: "14",
		x2: "14",
		y1: "11",
		y2: "17",
		key: "xtxkd"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var TriangleAlert = createLucideIcon("triangle-alert", [
	["path", {
		d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
		key: "wmoenq"
	}],
	["path", {
		d: "M12 9v4",
		key: "juzpu7"
	}],
	["path", {
		d: "M12 17h.01",
		key: "p32p05"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Type = createLucideIcon("type", [
	["polyline", {
		points: "4 7 4 4 20 4 20 7",
		key: "1nosan"
	}],
	["line", {
		x1: "9",
		x2: "15",
		y1: "20",
		y2: "20",
		key: "swin9y"
	}],
	["line", {
		x1: "12",
		x2: "12",
		y1: "4",
		y2: "20",
		key: "1tx1rr"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Volume2 = createLucideIcon("volume-2", [
	["path", {
		d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
		key: "uqj9uw"
	}],
	["path", {
		d: "M16 9a5 5 0 0 1 0 6",
		key: "1q6k2b"
	}],
	["path", {
		d: "M19.364 18.364a9 9 0 0 0 0-12.728",
		key: "ijwkga"
	}]
]);
/**
* @license lucide-react v0.510.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var X = createLucideIcon("x", [["path", {
	d: "M18 6 6 18",
	key: "1bl5f8"
}], ["path", {
	d: "m6 6 12 12",
	key: "d8bk6v"
}]]);
//#endregion
export { House as A, ChevronDown as B, Pause as C, Library as D, Lightbulb as E, Download as F, BookOpen as G, CalendarDays as H, CirclePause as I, Bell as K, CircleHelp as L, Heart as M, Headphones as N, Languages as O, GraduationCap as P, ChevronRight as R, Play as S, MessagesSquare as T, Building2 as U, Check as V, Bookmark as W, RotateCcw as _, Trash2 as a, Printer as b, SkipForward as c, Shield as d, Settings as f, Scale as g, ScrollText as h, TriangleAlert as i, Highlighter as j, Landmark as k, SkipBack as l, Search as m, Volume2 as n, Table2 as o, Send as p, Badge as q, Type as r, Sparkles as s, X as t, Signpost as u, Repeat as v, Mic as w, Plus as x, Repeat1 as y, ChevronLeft as z };
