"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sketch_core_assistant_1 = __importDefault(require("@sketch-hq/sketch-core-assistant"));
const lodash_1 = __importDefault(require("lodash"));
const token_utils_1 = require("./token-utils");
//reserved for design system versioning
const RELEASE = '1.0';
// parse rgba syntax and populate array
const parseColors = (rawTokens) => rawTokens.map((key) => {
    let split = key.split(',').map((attr) => parseFloat(attr
        .replace(/rgba|rgb/g, '')
        .replace(/\(/g, '')
        .replace(/\)/g, '')));
    // add alpha of 1
    if (split.length < 4)
        split.push(1);
    return split;
});
// parse shadow syntax and populate array
const parseShadows = (rawTokens) => rawTokens.map((key) => {
    let split = key.split(' ').map((attr) => attr);
    return split;
});
// turn rgba percentages into values
const getRgba = (colorObj) => {
    return [
        Math.round(255 * (colorObj === null || colorObj === void 0 ? void 0 : colorObj.red)),
        Math.round(255 * (colorObj === null || colorObj === void 0 ? void 0 : colorObj.green)),
        Math.round(255 * (colorObj === null || colorObj === void 0 ? void 0 : colorObj.blue)),
        colorObj === null || colorObj === void 0 ? void 0 : colorObj.alpha,
    ];
};
// global variables to make reporting hints with actual values possible
const fontFamilyValues = token_utils_1.getFontFamilies();
const fontLineHeightValues = token_utils_1.getLineHeights();
const fontSizeValues = token_utils_1.getFontSizes();
const borderColorValues = token_utils_1.getBorderColors();
const borderSizeValues = token_utils_1.getBorderSizes();
const fillColorValues = token_utils_1.getFillColors();
const shadowValues = token_utils_1.getShadows();
const opacityValues = token_utils_1.getOpacities();
const radiusValues = token_utils_1.getRadiuses();
const textColorValues = token_utils_1.getTextColors();
// given sketch layer, return true if this layer should be linted
const isValidLayer = (layer, _utils) => {
    return layer._class !== 'group' && layer._class !== 'page' && layer._class !== 'artboard';
};
const textFont = {
    rule: (context) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const { utils } = context;
        for (const layer of utils.objects.text) {
            const fontName = (_e = (_d = (_c = (_b = (_a = layer.style) === null || _a === void 0 ? void 0 : _a.textStyle) === null || _b === void 0 ? void 0 : _b.encodedAttributes) === null || _c === void 0 ? void 0 : _c.MSAttributedStringFontAttribute) === null || _d === void 0 ? void 0 : _d.attributes) === null || _e === void 0 ? void 0 : _e.name;
            if (typeof fontName !== 'string')
                throw Error();
            if (!fontFamilyValues.includes(fontName))
                utils.report(`'${fontName}' does not match a valid font name token`, layer);
        }
    }),
    name: 'ds/font',
    title: `Fonts used should match the defined token values`,
    description: `Reports a violation if a font is different than: \r\n${fontFamilyValues.join('\r\n')}`,
};
const textLineHeight = {
    rule: (context) => __awaiter(void 0, void 0, void 0, function* () {
        var _f, _g, _h;
        const { utils } = context;
        for (const layer of utils.objects.text) {
            const fontLineHeight = (_h = (_g = (_f = layer.style) === null || _f === void 0 ? void 0 : _f.textStyle) === null || _g === void 0 ? void 0 : _g.encodedAttributes.paragraphStyle) === null || _h === void 0 ? void 0 : _h.minimumLineHeight;
            if (fontLineHeight)
                if (!fontLineHeightValues.find((v) => parseInt(v) === fontLineHeight))
                    utils.report(`${fontLineHeight === null || fontLineHeight === void 0 ? void 0 : fontLineHeight.toString()} does not match a valid font line height token`, layer);
        }
    }),
    name: 'ds/lineheight',
    title: `Text line height should match the defined token values`,
    description: `Reports a violation if a line height is different than: \r\n${fontLineHeightValues.join('\r\n')}`,
};
const textSize = {
    rule: (context) => __awaiter(void 0, void 0, void 0, function* () {
        var _j, _k, _l, _m, _o;
        const { utils } = context;
        for (const layer of utils.objects.text) {
            const size = (_o = (_m = (_l = (_k = (_j = layer.style) === null || _j === void 0 ? void 0 : _j.textStyle) === null || _k === void 0 ? void 0 : _k.encodedAttributes) === null || _l === void 0 ? void 0 : _l.MSAttributedStringFontAttribute) === null || _m === void 0 ? void 0 : _m.attributes) === null || _o === void 0 ? void 0 : _o.size;
            if (isValidLayer(layer, utils) && !fontSizeValues.find((v) => parseInt(v) === size))
                utils.report(`${size} does not match a valid font size token`, layer);
        }
    }),
    name: 'ds/text-size',
    title: `Font sizes should match the defined token values ${RELEASE}`,
    description: `Reports a violation if a font size is different than: \r\n${fontSizeValues.join('\r\n')}`,
};
const borderColor = {
    rule: (context) => __awaiter(void 0, void 0, void 0, function* () {
        var _p;
        const { utils } = context;
        for (const layer of utils.objects.anyLayer) {
            const borders = (_p = layer.style) === null || _p === void 0 ? void 0 : _p.borders;
            if (isValidLayer(layer, utils) && borders && borders.length > 0) {
                borders.forEach((border) => {
                    const borderRgba = getRgba(border.color);
                    // Border must be enabled. Transparent borders are allowed.
                    if (border.isEnabled &&
                        borderRgba[3] !== 0 &&
                        !parseColors(borderColorValues).find((v) => lodash_1.default.isEqual(v, borderRgba)))
                        utils.report(`rgba(${borderRgba}) does not match a valid border or generic color token`, layer);
                });
            }
        }
    }),
    name: 'ds/border-color',
    title: `Border colors are not following ${RELEASE}`,
    description: `Reports a violation if a border color is different than: \r\n${borderColorValues.join('\r\n')}`,
};
const borderSize = {
    rule: (context) => __awaiter(void 0, void 0, void 0, function* () {
        var _q;
        const { utils } = context;
        for (const layer of utils.objects.anyLayer) {
            const borders = (_q = layer.style) === null || _q === void 0 ? void 0 : _q.borders;
            if (isValidLayer(layer, utils) && borders && borders.length > 0) {
                borders.forEach((border) => {
                    const borderPx = border.thickness;
                    // Border must be enabled. Transparent borders are allowed.
                    if (border.isEnabled && !borderSizeValues.includes(borderPx.toString()))
                        utils.report(`${borderPx} does not match a valid border size token`, layer);
                });
            }
        }
    }),
    name: 'ds/border-size',
    title: `Border sizes should match the defined token values ${RELEASE}`,
    description: `Reports a violation if a border size is different than: \r\n${borderSizeValues.join('\r\n')}`,
};
const fillColor = {
    rule: (context) => __awaiter(void 0, void 0, void 0, function* () {
        var _r;
        const { utils } = context;
        for (const layer of utils.objects.anyLayer) {
            const fills = (_r = layer.style) === null || _r === void 0 ? void 0 : _r.fills;
            if (isValidLayer(layer, utils) && fills && fills.length > 0) {
                fills.forEach((fill) => {
                    const fillRgba = getRgba(fill.color);
                    // check for token match or transparency
                    if (fill.isEnabled &&
                        fillRgba[3] !== 0 &&
                        !parseColors(fillColorValues).find((v) => lodash_1.default.isEqual(v, fillRgba)))
                        utils.report(`rgba(${fillRgba}) does not match a valid background or generic color token`, layer);
                });
            }
        }
    }),
    name: 'ds/fill-color',
    title: `Fill colors should match background or generic color token values ${RELEASE}`,
    description: `Reports a violation if a fill color is different than: \r\n${fillColorValues.join('\r\n')}`,
};
const shadow = {
    rule: (context) => __awaiter(void 0, void 0, void 0, function* () {
        var _s;
        const { utils } = context;
        for (const layer of utils.objects.anyLayer) {
            const appliedShadows = (_s = layer.style) === null || _s === void 0 ? void 0 : _s.shadows;
            if (isValidLayer(layer, utils) && appliedShadows && appliedShadows.length > 0) {
                appliedShadows.forEach((shadow) => {
                    if (shadow.isEnabled) {
                        let isAllowed = false;
                        parseShadows(shadowValues).forEach((allowedShadow) => {
                            const colours = [];
                            colours.push(allowedShadow[5]);
                            if (allowedShadow[0] == shadow.offsetX.toString() &&
                                allowedShadow[1] == shadow.offsetY.toString() &&
                                allowedShadow[2] == shadow.blurRadius.toString() &&
                                allowedShadow[3] == shadow.spread.toString() &&
                                allowedShadow[4] == shadow.contextSettings.blendMode.toString() &&
                                parseColors(colours).find((v) => lodash_1.default.isEqual(v, getRgba(shadow.color))))
                                isAllowed = true;
                        });
                        if (isAllowed == false)
                            utils.report(`${shadow.offsetX.toString()} ${shadow.offsetY.toString()} ${shadow.blurRadius.toString()} ${shadow.spread.toString()} ${shadow.contextSettings.blendMode.toString()} rgba(${getRgba(shadow.color)}) does not match any defined token`, layer);
                    }
                });
            }
        }
    }),
    name: 'ds/shadow',
    title: `Shadows should match defined token values ${RELEASE}`,
    description: `Reports a violation if a shadow is different than: \r\n${shadowValues.join('\r\n')}`,
};
const opacity = {
    rule: (context) => __awaiter(void 0, void 0, void 0, function* () {
        var _t, _u;
        const { utils } = context;
        for (const layer of utils.objects.anyLayer) {
            const objectOpacity = (_u = (_t = layer.style) === null || _t === void 0 ? void 0 : _t.contextSettings) === null || _u === void 0 ? void 0 : _u.opacity;
            if (!(objectOpacity == null) &&
                !(objectOpacity == undefined) &&
                isValidLayer(layer, utils) &&
                opacityValues &&
                opacityValues.length > 0) {
                for (const opacity of opacityValues) {
                    if (parseFloat(opacity) !== Math.round((objectOpacity + Number.EPSILON) * 100) / 100)
                        utils.report(`${Math.round((objectOpacity + Number.EPSILON) * 100) / 100} Does not match a valid opacity token value`, layer);
                }
            }
        }
    }),
    name: 'ds/opacity',
    title: `Opacities should match defined token values ${RELEASE}`,
    description: `Reports a violation if an opacity is different than: \r\n${opacityValues.join('\r\n')}`,
};
const radius = {
    rule: (context) => __awaiter(void 0, void 0, void 0, function* () {
        const { utils } = context;
        for (const layer of utils.objects.anyLayer) {
            if (layer._class === 'triangle' ||
                layer._class === 'star' ||
                layer._class === 'shapePath' ||
                layer._class === 'rectangle' ||
                layer._class === 'polygon') {
                for (const point of layer.points) {
                    if (point.curveMode == 1 &&
                        !radiusValues.find((v) => lodash_1.default.isEqual(v, point.cornerRadius.toString()))) {
                        utils.report(`${layer.points.length} One or more path points does not match a valid radius token value`, layer);
                        break;
                    }
                }
            }
        }
    }),
    name: 'ds/radius',
    title: `Radiuses should match defined token values ${RELEASE}`,
    description: `Reports a violation if a radius is different than: \r\n${radiusValues.join('\r\n')}`,
};
const textColor = {
    rule: (context) => __awaiter(void 0, void 0, void 0, function* () {
        var _v, _w;
        const { utils } = context;
        for (const layer of utils.objects.text) {
            let colorAttribute = (_w = (_v = layer.style) === null || _v === void 0 ? void 0 : _v.textStyle) === null || _w === void 0 ? void 0 : _w.encodedAttributes.MSAttributedStringColorAttribute;
            if (isValidLayer(layer, utils) && colorAttribute) {
                const textRgba = getRgba(colorAttribute);
                // check for token match or transparency
                if (textRgba[3] !== 0 && !parseColors(textColorValues).find((v) => lodash_1.default.isEqual(v, textRgba)))
                    utils.report(`rgba(${textRgba[0]},${textRgba[1]},${textRgba[2]},${textRgba[3]}) does not match a valid text or generic color token`, layer);
            }
        }
    }),
    name: 'ds/text-color',
    title: `Text colors should match text or generic color token values ${RELEASE}`,
    description: `Reports a violation if a text color is different than: \r\n${textColorValues.join('\r\n')}`,
};
const textDisallow = {
    rule: (context) => __awaiter(void 0, void 0, void 0, function* () {
        const { utils } = context;
        const patterns = utils.getOption('pattern');
        if (!Array.isArray(patterns))
            throw Error();
        for (const layer of utils.objects.text) {
            const value = layer.attributedString.string;
            for (const pattern of patterns)
                if (value.toLowerCase().includes(pattern)) {
                    utils.report(`Layer “${layer.name}” contains “${pattern}”`, layer);
                }
        }
    }),
    name: 'netural-guidelines-assistant/text-disallow',
    title: (config) => `Text should not contain ${config.pattern}`,
    description: (config) => `Reports a violation if a text layer contains '${config.pattern}'`,
};
const namePatternTextStyle = {
    rule: (context) => __awaiter(void 0, void 0, void 0, function* () {
        const { utils } = context;
        const allowed = utils.getOption('allowed');
        if (typeof allowed !== 'string')
            throw Error();
        var re = new RegExp(allowed);
        for (const textStyles of utils.objects.sharedTextStyleContainer) {
            for (const textStyle of textStyles.objects) {
                if (!re.test(textStyle.name))
                    utils.report(`Shared text style “${textStyle.name}” should follow the conventions`);
            }
        }
    }),
    name: 'netural-guidelines-assistant/name-pattern-text-style',
    title: 'Shared text styles should follow the naming conventions',
    description: 'Reports a violation if a shared text style is named differently than defined',
};
/*
const namePatternFile: RuleDefinition = {
  rule: async (context) => {
    const { utils } = context

    const allowed = utils.getOption('allowed')
    if (typeof allowed !== 'string') throw Error()

    utils.report(`Name Pattern Sketch File` + context.file.original.filepath)
  },
  name: 'netural-guidelines-assistant/name-pattern-file',
  title: 'Name Pattern Sketch File',
  description: 'Reports a violation if the sketch file is named differently than defined.',
}
*/
const assistant = [
    sketch_core_assistant_1.default,
    () => __awaiter(void 0, void 0, void 0, function* () {
        return {
            name: 'netural-guidelines-assistant',
            rules: [
                radius,
                opacity,
                shadow,
                fillColor,
                borderColor,
                borderSize,
                textColor,
                textSize,
                textFont,
                /*namePatternFile,*/
                textLineHeight,
                namePatternTextStyle,
                textDisallow,
            ],
            config: {
                rules: {
                    'ds/radius': { active: true },
                    'ds/opacity': { active: true },
                    'ds/shadow': { active: true },
                    'ds/fill-color': { active: true },
                    'ds/border-color': { active: true },
                    'ds/border-size': { active: true },
                    'ds/text-color': { active: true },
                    'ds/text-size': { active: true },
                    'ds/font': { active: true },
                    'ds/lineheight': { active: false },
                    /*
                    'netural-guidelines-assistant/name-pattern-file': {
                      active: true,
                      allowed: '^[a-z]{3}-[a-z]+-[0-9]{2}$',
                    },
                    */
                    'netural-guidelines-assistant/text-disallow': {
                        active: true,
                        //patterns in lowercase, will be checked case insensitive
                        pattern: ['lorem ipsum'],
                    },
                    //starts with three numbers
                    //continues with a dash and at least one other character that is not _ or capital letter
                    '@sketch-hq/sketch-core-assistant/name-pattern-artboards': {
                        active: true,
                        allowed: ['^[0-9]{3}-[^_^A-Z]*$'],
                        forbidden: [],
                        ruleTitle: 'Artboard names should follow the naming conventions',
                    },
                    //starts with one of the following: a/ m/ o/ c/
                    //continues with at least one character that is not _ or capital letter
                    '@sketch-hq/sketch-core-assistant/name-pattern-symbols': {
                        active: true,
                        allowed: ['^(a/|m/|o/|c/)[^_^A-Z]*$'],
                        forbidden: [],
                        ruleTitle: 'Symbol names should follow the naming conventions',
                    },
                    //starts with d- (desktop) or m- (mobile)
                    //continues with H(+number) or body-(+number)
                    //is further separated by /
                    //continues with color name for up to 30 characters
                    //is further separated by /
                    //continues with alignement: left or center or right
                    //is further separated by /
                    //continues with a font weight that can be preceeded by a font name if separated by a dash (-)
                    'netural-guidelines-assistant/name-pattern-text-style': {
                        active: true,
                        allowed: '^(d|m)-(H[0-9]|body-[0-9]{2,3})/[a-za-z0-9]{1,30}/(left|center|right)(/([a-z]{1,15}-)?(light|regular|medium|italic|semibold|semi-bold|bold|thin|black))?$',
                    },
                },
            },
        };
    }),
];
exports.default = assistant;
