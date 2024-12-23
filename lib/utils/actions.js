const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

// Helper function to simulate human typing
// Helper function to simulate human typing while focusing on the file
const typeContent = async (fileFullPath, fileContent, delay = 30, batchSize = 10) => {
    return new Promise(async (resolve, reject) => {
        try {
            const uri = vscode.Uri.file(fileFullPath);
            let document = null;

            // Ensure the file exists or create it empty if necessary
            if (!fs.existsSync(fileFullPath)) {
                fs.mkdirSync(path.dirname(fileFullPath), { recursive: true });
                fs.writeFileSync(fileFullPath, ''); // Create an empty file
            }

            // Open the file in the editor
            document = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(document, { preview: false });

            let contentWritten = '';
            let index = 0;

            const typeInterval = setInterval(() => {
                contentWritten += fileContent[index];
                index++;

                // Update the editor's document with typed content
                editor.edit((editBuilder) => {
                    const fullRange = new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(document.getText().length)
                    );
                    editBuilder.replace(fullRange, contentWritten);
                });

                if (index >= fileContent.length) {
                    clearInterval(typeInterval);
                    resolve();
                }
            }, delay);
        } catch (error) {
            reject(error);
        }
    });
};


// Function to handle actions
const focusFile = async (fileFullPath) => {
    try {
        const uri = vscode.Uri.file(fileFullPath);
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document, { preview: false });
        console.log(`Focused on file: ${fileFullPath}`);
    } catch (error) {
        console.error(`Error focusing on file: ${fileFullPath}`, error);
    }
};

// Function to handle actions
const doActions = async (response) => {
    try {
        console.log("Actions received:", response);
        const actions = response.actions;

        for (const action of actions) {
            console.log(`Processing action: ${action.type}`);
            const fileFullPath = path.join(vscode.workspace.rootPath, action.fileFullPath);

            if (action.type === 'CREATE') {
                await handleFile({ fileFullPath, fileContent: action.fileContent || '', type: 'NEW' });
                await focusFile(fileFullPath); // Focus on the newly created file
            } else if (action.type === 'UPDATE') {
                await handleFile({ fileFullPath, fileContent: action.fileContent, type: 'UPDATE' });
                await focusFile(fileFullPath); // Focus on the updated file
            } else if (action.type === 'DELETE') {
                await handleFile({ fileFullPath, type: 'DELETE' });
            } else if (action.type === 'COMMAND') {
                handleCommand({ command: action.command });
            }
        }
    } catch (error) {
        console.error("Error in doActions:", error);
    }
};


// Handle file actions
const handleFile = async (file) => {
    const { fileFullPath, fileContent, type } = file;
    if (type === 'NEW') await createFile({ fileFullPath, fileContent });
    if (type === 'UPDATE') await updateFile({ fileFullPath, fileContent });
    if (type === 'DELETE') await deleteFile({ fileFullPath });
};

// Create a file by simulating typing
const createFile = async ({ fileFullPath, fileContent }) => {
    fs.mkdirSync(path.dirname(fileFullPath), { recursive: true });
    await typeContent(fileFullPath, fileContent);
    console.log(`File created: ${fileFullPath}`);
};

// Update an existing file by simulating typing
const updateFile = async ({ fileFullPath, fileContent }) => {
    if (fs.existsSync(fileFullPath)) {
        await typeContent(fileFullPath, fileContent);
        console.log(`File updated: ${fileFullPath}`);
    } else {
        console.error(`File not found for update: ${fileFullPath}`);
    }
};

// Delete file
const deleteFile = async ({ fileFullPath }) => {
    if (fs.existsSync(fileFullPath)) {
        fs.unlinkSync(fileFullPath);
        console.log(`File deleted: ${fileFullPath}`);
    } else {
        console.error(`File not found for deletion: ${fileFullPath}`);
    }
};

// Handle shell commands
const handleCommand = ({ command }) => {
    const exec = require('child_process').exec;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Command error: ${stderr}`);
        } else {
            console.log(`Command executed: ${stdout}`);
        }
    });
};

module.exports = {
    doActions
};
