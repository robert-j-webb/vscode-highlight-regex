import * as vscode from 'vscode';

// https://regex101.com/r/PDzGpB/1
const regexRegex = /([^\/](\/[^\/]+\/)|(new\sRegExp\('[^']+'\)))/gm;

function getRegexMatches(regex: RegExp, text: string): RegExpMatchArray[] {
    const matches = [];
    let regexMatch;
    while ((regexMatch = regex.exec(text)) !== null) {
        matches.push(regexMatch);
    }
    return matches;
}

const colors = ['regexHighlighter.red', 'regexHighlighter.blue', 'regexHighlighter.green'];
function* getDecorationType() {
    // infinite color loop
    for (let i = 0; ; i >= colors.length ? (i = 0) : i++) {
        // create a decorator type that we use to decorate large numbers
        yield vscode.window.createTextEditorDecorationType({
            cursor: 'crosshair',
            // use a themable color. See package.json for the declaration and default values.
            backgroundColor: { id: colors[i] }
        });
    }
}

function getDecoration(activeEditor, match: RegExpMatchArray, index: number, regex: string): vscode.DecorationOptions {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(match.index + match[0].length);
    return {
        range: new vscode.Range(startPos, endPos),
        hoverMessage: `${regex}:${index}:${match[0]}`
    };
}

export { regexRegex, colors, getRegexMatches, getDecoration, getDecorationType };
