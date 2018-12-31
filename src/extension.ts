import * as vscode from 'vscode';
import { getDecoration, getDecorationType, getRegexMatches, regexRegex } from './util';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('decorator sample is activated');

    let activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        triggerUpdateDecorations();
    }

    vscode.window.onDidChangeActiveTextEditor(
        editor => {
            activeEditor = editor;
            if (editor) {
                triggerUpdateDecorations();
            }
        },
        null,
        context.subscriptions
    );

    vscode.workspace.onDidChangeTextDocument(
        event => {
            if (activeEditor && event.document === activeEditor.document) {
                triggerUpdateDecorations();
            }
        },
        null,
        context.subscriptions
    );

    let timeout: NodeJS.Timer | null = null;
    function triggerUpdateDecorations() {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(updateDecorations, 500);
    }

    function updateDecorations() {
        if (!activeEditor) {
            return;
        }
        const text = activeEditor.document.getText();
        const decorationTypes = getDecorationType();

        getRegexMatches(regexRegex, text).forEach((regexRegexMatch, index) => {
            // avoid being interrupted by the timer by breaking the work up into little bits
            return setTimeout(() => {
                const rawRegex = new Function('return ' + regexRegexMatch[0])();
                const globalRegex = new RegExp(rawRegex.source, 'g');
                const regexMatches = [
                    getDecoration(activeEditor, regexRegexMatch, 1, rawRegex.source),
                    ...getRegexMatches(globalRegex, text).map((userRegexMatch, idx) =>
                        getDecoration(activeEditor, userRegexMatch, idx + 2, rawRegex.source)
                    )
                ];
                activeEditor.setDecorations(decorationTypes.next().value, regexMatches);
            }, index * 2);
        });
    }
}
