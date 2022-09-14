"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function removeEmptyStrings(textContent) {
    textContent.forEach(function (i) {
        if (i === "") {
            return textContent.splice(+i, 1);
        }
    });
}
function createContentChunks(textContent) {
    var content = textContent.join(" ");
    var splitContent = [];
    var words = content.split(" ");
    if (words.length > 800) {
        //create an array of 800 word chunks 
        for (var i = 0; i < words.length; i += 800) {
            splitContent.push(words.slice(i, i + 800).join(" "));
        }
        console.log(splitContent);
    }
    else if (words.length > 400) {
        //create an array of 400 word chunks
        for (var i = 0; i < words.length; i += 400) {
            splitContent.push(words.slice(i, i + 400).join(" "));
        }
    }
    else {
        splitContent.push(words.join(" "));
    }
    return splitContent;
}
function removeNewLine(text) {
    return text.replace(/\n/g, "");
}
exports.default = { removeEmptyStrings: removeEmptyStrings, createContentChunks: createContentChunks, removeNewLine: removeNewLine };
