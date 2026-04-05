import * as vscode from 'vscode';
import { StateManager, ExtensionState } from './StateManager';

export class UIController {
    private statusBarItem: vscode.StatusBarItem;

    constructor(private stateManager: StateManager) {
        // 创建状态栏，优先显示在右侧
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        
        // 监听状态变化
        this.stateManager.onStateChange(this.updateUI.bind(this));
        this.stateManager.onProgressChange(this.updateProgress.bind(this));
    }

    private updateUI(state: ExtensionState) {
        switch (state) {
            case ExtensionState.IDLE:
                this.statusBarItem.hide();
                break;
            case ExtensionState.FETCHING:
                this.statusBarItem.text = "$(sync~spin) GhostWriter";
                this.statusBarItem.color = new vscode.ThemeColor('charts.blue');
                this.statusBarItem.show();
                break;
            case ExtensionState.READY:
                this.statusBarItem.color = new vscode.ThemeColor('charts.green');
                break;
            // TYPING 状态由 updateProgress 处理文本
        }
    }

    private updateProgress(progress: { current: number, total: number }) {
        if (this.stateManager.getState() === ExtensionState.READY || this.stateManager.getState() === ExtensionState.TYPING) {
            this.statusBarItem.text = `$(pass) ${progress.current}/${progress.total}`;
            this.statusBarItem.show();
        }
    }

    public dispose() {
        this.statusBarItem.dispose();
    }
}