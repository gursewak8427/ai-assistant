
// Function to apply a unified diff to a file's content
const applyUnifiedDiff = async (fileFullPath, diffContent) => {
    try {
        const fileUri = vscode.Uri.file(fileFullPath);
        const document = await vscode.workspace.openTextDocument(fileUri);
        const originalLines = document.getText().split('\n');

        let newLines = [...originalLines];
        let diffLines = diffContent.split('\n');
        let currentIndex = 0;

        for (let i = 0; i < diffLines.length; i++) {
            const line = diffLines[i];

            if (line.startsWith('@@')) {
                const matches = line.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/);
                if (!matches) continue;

                const originalStart = parseInt(matches[1]) - 1;
                const modifiedStart = parseInt(matches[3]) - 1;

                currentIndex = modifiedStart;
                continue;
            }

            if (line.startsWith('-')) {
                newLines.splice(currentIndex, 1);
            } else if (line.startsWith('+')) {
                newLines.splice(currentIndex, 0, line.substring(1));
                currentIndex++;
            } else {
                currentIndex++;
            }
        }

        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(newLines.join('\n')));
        console.log(`Diff applied to: ${fileFullPath}`);
        vscode.window.showInformationMessage(`Diff applied to: ${path.basename(fileFullPath)}`);

        await vscode.window.showTextDocument(document, { preview: false });
    } catch (error) {
        console.error(`Error applying diff: ${error}`);
        vscode.window.showErrorMessage(`Error applying diff: ${error.message}`);
    }
};

// Function to replace full file content
const replaceFileContent = async (fileFullPath, newContent) => {
    try {
        const fileUri = vscode.Uri.file(fileFullPath);
        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(newContent));

        console.log(`File replaced: ${fileFullPath}`);
        vscode.window.showInformationMessage(`File replaced: ${path.basename(fileFullPath)}`);

        const document = await vscode.workspace.openTextDocument(fileUri);
        await vscode.window.showTextDocument(document, { preview: false });
    } catch (error) {
        console.error(`Error replacing file content: ${error}`);
        vscode.window.showErrorMessage(`Error replacing file content: ${error.message}`);
    }
};

// Main function to handle updates
const handleUpdates = async (updates) => {
    for (const update of updates) {
        if (update.type === 'diff') {
            await applyUnifiedDiff(update.fileFullPath, update.content);
        } else if (update.type === 'file') {
            await replaceFileContent(update.fileFullPath, update.content);
        }

        await delay(500); // Add delay for better visualization
    }
};
