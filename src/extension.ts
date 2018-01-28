// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {window, workspace, commands, Disposable, ExtensionContext, EventEmitter, 
    TextDocument, TextDocumentContentProvider, Uri, ViewColumn} from 'vscode';

// this method is called when your extension is activated. activation is
// controlled by the activation events defined in package.json
export function activate(ctx: ExtensionContext) {

    let provider = new SOSearchProvider();
	let registration = workspace.registerTextDocumentContentProvider(SOSearchProvider.SCHEME, provider);
    
    // The command has been defined in the package.json file
    // The commandId parameter must match the command field in package.json
    var SOCommand = commands.registerCommand('SO-search-ext.SO', () => {
    SOSearchController.extractPhraseAndSearch();
    });
    
    // add to a list of disposables which are disposed when this extension
    // is deactivated again.
    ctx.subscriptions.push(SOCommand);
    ctx.subscriptions.push(registration);
    ctx.subscriptions.push(provider);
}

export class SOSearchController {

    constructor() {
    }

    private static showHTMLWindow(phrase: string) {
        let uriphrase = encodeURI(phrase);
        let query = `q=${uriphrase}&oq=${uriphrase}&sourceid=chrome&ie=UTF-8`;
        let previewUri = Uri.parse(`${SOSearchProvider.SCHEME}://SO/search.html?${query}`);
        
        
        return commands.executeCommand(
            "vscode.previewHtml",
            previewUri,
            ViewColumn.Two
        ).then((s) => { 
            // console.log(s); 
        }, window.showErrorMessage);
        
    }

    private static getSearchPhrase(): string {
        let editor = window.activeTextEditor;
        if (!editor) {
            window.showInformationMessage('SO Search: Open an editor and select a word / highlight some text to search.');
            return '';
        }
        let text = editor.document.getText();
        if (!text) return '';
        let selStart, selEnd;
        if (editor.selection.isEmpty) {
            selStart = editor.document.offsetAt(editor.selection.anchor);
            // the next or previous character at the caret must be a word character
            var i=selStart-1;
            if (!((i < text.length-1 && /\w/.test(text[i+1])) || (i > 0 && /\w/.test(text[i]))))
                return '';
            for (; i >= 0; i--) {
                if (!/\w/.test(text[i])) break;
            }
            if (i < 0) i = 0;
            for (; i < text.length; i++) {
                if (/\w/.test(text[i])) break;
            }
            let wordMatch = text.slice(i).match(/^\w+/);
            selStart = i;
            selEnd = selStart + (wordMatch ? wordMatch[0].length : 0);
        } else {
            selStart = editor.document.offsetAt(editor.selection.start);
            selEnd = editor.document.offsetAt(editor.selection.end);
        }
        let phrase = text.slice(selStart, selEnd).trim();
        phrase = phrase.replace(/\s\s+/g,' ');
        // limit the maximum searchable length to 100 characters
        phrase = phrase.slice(0, 100).trim();
        return phrase;
    }

    public static extractPhraseAndSearch() {
        let phrase = SOSearchController.getSearchPhrase();
        if (phrase) 
            this.showHTMLWindow(phrase);
    }

    public dispose() {
    }
}

export default class SOSearchProvider implements TextDocumentContentProvider {

    public static readonly SCHEME = 'SO-search-preview';
	private _onDidChange = new EventEmitter<Uri>();

	constructor() {
	}

	dispose() {
		this._onDidChange.dispose();
	}

	// Expose an event to signal changes of _virtual_ documents
	// to the editor
	get onDidChange() {
		return this._onDidChange.event;
	}

	// Provider method that takes an uri of the `references`-scheme and
	// resolves its content by (1) running the reference search command
    // and (2) formatting the results
    
	provideTextDocumentContent(uri: Uri): string | Thenable<string> {

        let url = 'https://stackoverflow.com';
        let urlorigin = url;
        if (uri.query)
            url = `${urlorigin}/search?${uri.query}`;
        console.log(url)
        let s = `<!DOCTYPE html>
        <html>
        <!-- 
        You messed up
        -->
        <script type="text/javascript">
        (function() {
            function logerr(err) {
                console.log(err);
                // Roooaaaar!
                var imgb64 = 'iVBORw0KGgoAAAANSUhEUgAAACsAAAArCAYAAADhXXHAAAAABHNCSVQICAgIfAhkiAAAAPpJREFUWIXtl00OhCAMRmHiDeGY9IzOqolBmwr9mSnhrVwg1Ocn1JyMKaWckvsBIOP1R16OH5kfMofUaA8AZDezrbXUWhPNESoGh9dCtVbxHKHM7mKt2MVa4bYbUFyPU45QZv/2uH0yHtMsmhjJ0BNvjc6sE8qsym6g3Q5ShDJ7yyzCZcqiuebGhDJLZpbaHbSM4rwj84UyS2bWmuX32V2sFbfceGV3JrPuzbekUSJvtDIsKTZ2Znu0TywJa5lFZg1rGEXWNItQhqkuStPswb1ezcVSkn2wYrPUw2j9LV8Jldnp41Y7Hm9gf2uQXxTXY55ZbtwIITKLD/4FTcJrVgXsz78AAAAASUVORK5CYII=';
                var oh = '<img src="data:image/png;base64,'+imgb64+'">';
                document.body.innerHTML = ['<div style="padding:1em;text-align:center;">',oh,'<div style="color:#333;padding-top:1em;">',err,'</div>','</div>'].join('');
                document.body.style.background='#F7F7F7';
            }
            function replacePage(content) {
                try {
                    var body = content
                    document.getElementById("pulled-content").innerHTML = body
                    document.body.style.background='#fff';
                    document.body.style.color='#333';
                    let headers = document.getElementsByClassName('top-bar')
                    let emptySpace = document.getElementsByClassName('everyonelovesstackoverflow');
                    let sidebar = document.getElementById('sidebar');
                    for(let i = 0; i < headers.length; i++) {
                        headers[i].parentNode.removeChild(headers[i]);
                    }
                    
                    for(let i = 0; i < emptySpace.length; i++) {
                        emptySpace[i].parentNode.removeChild(emptySpace[i]);
                    }
        
                    if(sidebar) {
                        sidebar.parentNode.removeChild(sidebar)
                    }
        
                } catch(err) {
                    logerr(err);
                }
            }
            function showHTTPError(code) {
                logerr('HTTP Error: '+code);
            }
            function setButtons(questions, index) {
                console.log(questions, index);
                let prev, next;
                let last_index = ((questions.length-1) === index)
                if(index === 0) {
                    prev = null
                    if(last_index) {
                        next = null
                    } else {
                        next = questions[index+1].getElementsByTagName('a')[0].getAttribute('href');
                    }
                } else if (last_index) {
                    prev = questions[index-1].getElementsByTagName('a')[0].getAttribute('href');
                    next = null
                } else {
                    prev = questions[index-1].getElementsByTagName('a')[0].getAttribute('href');
                    next = questions[index+1].getElementsByTagName('a')[0].getAttribute('href');
                }
        
                let prev_button = document.getElementById('prev-question-button')
                let next_button = document.getElementById('next-question-button')
                
                if(prev) {
                    prev_button.onclick = function() {
                        makeQuestionRequest('https://stackoverflow.com', questions, index-1)
                    };
                } else {
                    prev_button.onclick = '';
                }
        
                if(next) {
                    next_button.onclick = function() {
                        makeQuestionRequest('https://stackoverflow.com', questions, index+1)
                    };
                } else {
                    next_button.onclick = '';
                }
            } 
            function makeRequest(url) {
                let httpRequest = new XMLHttpRequest();
                if (!httpRequest) return logerr('new XMLHttpRequest() failed');
                httpRequest.onerror = function(e) {
                    logerr("Request failed. There's a problem with your network connectivity or the site cannot be contacted.");
                }
                httpRequest.onreadystatechange = function() {
                    if (this.readyState === XMLHttpRequest.DONE) {
                        if (this.status === 200) {
                            let parser = new DOMParser ();
                            let responseDoc = parser.parseFromString (this.responseText, "text/html");
                            let questions = responseDoc.getElementsByClassName('result-link')
                            if(questions.length) {
                                makeQuestionRequest('https://stackoverflow.com', questions, 0)//+ first[0].getAttribute('href'));
                            }
                            else {
                                replacePage("Cannot find questions");
                            }
                        }
                    }
                }.bind(httpRequest);
                httpRequest.open('GET', url);
                httpRequest.responseType = 'text'
                httpRequest.send();
            }
            function makeQuestionRequest(url, questions, index) {
                let httpRequest = new XMLHttpRequest();
                if (!httpRequest) return logerr('new XMLHttpRequest() failed');
                httpRequest.onerror = function(e) {
                    logerr("Request failed. There's a problem with your network connectivity or the site cannot be contacted.");
                }
                httpRequest.onreadystatechange = function() {
                    if (this.readyState === XMLHttpRequest.DONE) {
                        if (this.status === 200) {
                            setButtons(questions, index);
                            replacePage(this.responseText);
                        }
                        else {
                            showHTTPError(this.status);
                        }
                    }
                }.bind(httpRequest);
                let question_path = questions[index].getElementsByTagName('a');
                question_path = (question_path.length > 0) ? question_path[0].getAttribute('href') : null;
                let new_url = url + question_path
                httpRequest.open('GET', new_url);
                httpRequest.send();
            }
            makeRequest('${url}');
        })();
        </script>
        <body style="background:#fff;">
            <div style='margin-left: 16px; margin-top: 20px'>
                <button id='prev-question-button' style='margin-right: 30px'>Previous Question</button>
                <button id='next-question-button'>Next Question</button>
            </div>
            <div id='pulled-content'></div>
        </body>
        </html>`;
        return s;
	}
}