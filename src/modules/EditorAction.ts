import * as vscode from 'vscode';

export class EditorAction {
    public async typeCharacter(char: string): Promise<boolean> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return false;
        }

        return await editor.edit(editBuilder => {
            // 将字符插入到当前所有的光标位置（支持多光标）
            editor.selections.forEach(selection => {
                editBuilder.insert(selection.active, char);
            });
        });
    }
}