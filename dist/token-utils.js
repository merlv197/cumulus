"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShadows = exports.getOpacities = exports.getRadiuses = exports.getLineHeights = exports.getFontFamilies = exports.getFontSizes = exports.getTextColors = exports.getBorderSizes = exports.getBorderColors = exports.getFillColors = void 0;
//import * as primitiveTokens from './design-tokens/primitive.json'
const primitiveTokens = __importStar(require("@fireinureeyes/json"));
//returns an array of allowed generic colors (category "color") from json file
const getGenericColors = () => primitiveTokens.properties.filter((p) => p.category === 'color').map((p) => p.value);
//returns an array of allowed background colors and generic colors from json file
exports.getFillColors = () => primitiveTokens.properties
    .filter((p) => p.category === 'fill-color')
    .map((p) => p.value)
    .concat(getGenericColors());
//returns an array of allowed border colors and generic colors from json file
exports.getBorderColors = () => primitiveTokens.properties
    .filter((p) => p.category === 'border-color')
    .map((p) => p.value)
    .concat(getGenericColors());
//returns an array of allowed border sizes in px from json file
exports.getBorderSizes = () => primitiveTokens.properties
    .filter((p) => p.category === 'border-style' && p.type === 'size')
    .map((p) => p.value);
//returns an array of allowed text colors and generic colors from json file
exports.getTextColors = () => primitiveTokens.properties
    .filter((p) => p.category === 'text-color')
    .map((p) => p.value)
    .concat(getGenericColors());
//returns an array of allowed font sizes from json file
exports.getFontSizes = () => primitiveTokens.properties.filter((p) => p.category === 'font-size').map((p) => p.value);
//returns an array of allowed font families from json file
exports.getFontFamilies = () => primitiveTokens.properties
    .filter((p) => p.category === 'font' && p.type === 'font')
    .map((p) => p.value);
//returns an array of allowed line heights from json file
exports.getLineHeights = () => primitiveTokens.properties.filter((p) => p.category === 'line-height').map((p) => p.value);
//returns an array of allowed radiuses from json file
exports.getRadiuses = () => primitiveTokens.properties.filter((p) => p.category === 'radius').map((p) => p.value);
//returns an array of allowed opacities from json file
exports.getOpacities = () => primitiveTokens.properties.filter((p) => p.category === 'opacity').map((p) => p.value);
//returns an array of allowed shadows from json file
exports.getShadows = () => primitiveTokens.properties.filter((p) => p.category === 'shadow').map((p) => p.value);
