import * as vscode from "vscode";

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
	console.log("decorator sample is activated");

	// create a decorator type that we use to decorate small numbers
	const smallNumberDecorationType = vscode.window.createTextEditorDecorationType(
		{
			borderWidth: "1px",
			borderStyle: "solid",
			overviewRulerColor: "blue",
			overviewRulerLane: vscode.OverviewRulerLane.Right,
			light: {
				// this color will be used in light color themes
				borderColor: "darkblue"
			},
			dark: {
				// this color will be used in dark color themes
				borderColor: "lightblue"
			}
		}
	);

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

	var timeout: NodeJS.Timer | null = null;
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
		//https://regex101.com/r/PDzGpB/1
		const regexRegex = /([^\/](\/[^\/]+\/)|(new\sRegExp\('[^']+'\)))/gm;
		const text = activeEditor.document.getText();
		const decorationTypes = getDecorationType();

		getRegexMatches(regexRegex, text).forEach((regexRegexMatch, index) => {
			// avoid being interrupted by the timer by breaking the work up into little bits
			return setTimeout(() => {
				const rawRegex = new Function("return " + regexRegexMatch[0])();
				const globalRegex = new RegExp(rawRegex.source, "g");
				const regexMatches = [
					getDecoration(activeEditor, regexRegexMatch, 1, rawRegex.source),
					...getRegexMatches(globalRegex, text).map((userRegexMatch, idx) =>
						getDecoration(
							activeEditor,
							userRegexMatch,
							idx + 2,
							rawRegex.source
						)
					)
				];
				activeEditor.setDecorations(decorationTypes.next().value, regexMatches);
			}, index * 2);
		});
	}
}

const colors = ["regexHighlighter.red", "regexHighlighter.blue", "regexHighlighter.green"];
function* getDecorationType() {
	// infinite color loop
	for (let i = 0; ; i >= colors.length ? (i = 0) : i++) {
		// create a decorator type that we use to decorate large numbers
		yield vscode.window.createTextEditorDecorationType({
			cursor: "crosshair",
			// use a themable color. See package.json for the declaration and default values.
			backgroundColor: { id: colors[i] }
		});
	}
}

function getRegexMatches(regex: RegExp, text: string): RegExpMatchArray[] {
	const matches = [];
	let regexMatch;
	while ((regexMatch = regex.exec(text)) !== null) {
		matches.push(regexMatch);
	}
	return matches;
}

function getDecoration(
	activeEditor,
	match: RegExpMatchArray,
	index: number,
	regex: string
): vscode.DecorationOptions {
	const startPos = activeEditor.document.positionAt(match.index);
	const endPos = activeEditor.document.positionAt(
		match.index + match[0].length
	);
	return {
		range: new vscode.Range(startPos, endPos),
		hoverMessage: `${regex}:${index}:${match[0]}`
	};
}
