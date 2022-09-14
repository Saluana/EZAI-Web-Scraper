
function removeEmptyStrings (textContent: string[]) {
    textContent.forEach(i => {
        if (i === "") {
            return textContent.splice(+i, 1);
        }
    })
}

function createContentChunks (textContent: string[]): string[] {
    const content: string = textContent.join(" ")
    let splitContent: string[] = [];
    let words: string[] = content.split(" ")
    if (words.length > 800) {
            //create an array of 800 word chunks 
            for (let i = 0; i < words.length; i += 800) {
                splitContent.push(words.slice(i, i + 800).join(" "));
            }
            console.log(splitContent);
    } else if (words.length > 400){
        //create an array of 400 word chunks
        for (let i = 0; i < words.length; i += 400) {
            splitContent.push(words.slice(i, i + 400).join(" "));
        }
    } else {
        splitContent.push(words.join(" "));
    }
    return splitContent;
}

function removeNewLine (text: string) {
    return text.replace(/\n/g, "");
}

export default {removeEmptyStrings, createContentChunks, removeNewLine}