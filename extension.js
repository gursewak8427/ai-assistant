const { doActions } = require('./lib/utils/actions');
const vscode = require('vscode');

// Example usage with the button click
function activate(context) {
	const statusBarButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	statusBarButton.text = '$(megaphone) Click Me';
	statusBarButton.tooltip = 'Click to perform actions';
	statusBarButton.command = 'extension.performActions';
	statusBarButton.show();

	const disposable = vscode.commands.registerCommand('extension.performActions', async () => {
		const response = {
			actions: [
				{
					type: 'CREATE',
					fileFullPath: 'src/index.js',
					fileContent: `
console.log("Hello, World!");
function greet() {
	return"Greetings!";
}
console.log("This is a test");
function sayGoodbye() {
	return "Goodbye!";
}
		`
				},
				{
					type: 'UPDATE',
					fileFullPath: 'src/index.js',
					fileContent: `
console.log("Hello, World!");
function greet() {
	return "hello Greetings!";
}
console.log("This is a test");
function sayGoodbye() {
	return "Goodbye!";
}
		`
				}
			]
		};
		
		doActions(response);
		
	});

	context.subscriptions.push(statusBarButton);
	context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate,
};
