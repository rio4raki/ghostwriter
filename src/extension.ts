import * as vscode from 'vscode';
import { StateManager, ExtensionState } from './modules/StateManager';
import { UIController } from './modules/UIController';
import { AIProvider } from './modules/AIProvider';
import { EditorAction } from './modules/EditorAction';
import { EventInterceptor } from './modules/EventInterceptor';
import { SettingsWebview } from './modules/SettingsWebview'; // 新增：引入设置界面模块

export function activate(context: vscode.ExtensionContext) {
    // 1. 实例化各个模块
    const stateManager = new StateManager();
    const uiController = new UIController(stateManager);
    const editorAction = new EditorAction();
    const aiProvider = new AIProvider();
    const eventInterceptor = new EventInterceptor(stateManager, editorAction);

    // 2. 注册预测快捷键命令
    const predictCommand = vscode.commands.registerCommand('ghostwriter.predict', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        // 如果已经在预测中，则重置（相当于打断）
        if (stateManager.getState() !== ExtensionState.IDLE) {
            stateManager.reset();
            return;
        }

        // 开启 FETCHING 状态
        stateManager.setState(ExtensionState.FETCHING);

        // 获取当前全文并请求 AI
        const documentText = editor.document.getText();
        const predictedText = await aiProvider.fetchPrediction(documentText);

        // 如果获取结果为空（例如未配置 API Key 或网络请求失败），则重置状态
        if (!predictedText) {
            stateManager.reset();
            return;
        }

        // AI 返回结果，进入 READY 状态
        stateManager.setPrediction(predictedText);
    });

    // 3. 注册打开设置界面的命令 (新增)
    const settingsCommand = vscode.commands.registerCommand('ghostwriter.openSettings', () => {
        SettingsWebview.show(context);
    });

    // 4. 将需要销毁的资源放入 context.subscriptions
    context.subscriptions.push(
        uiController,
        eventInterceptor,
        predictCommand,
        settingsCommand // 新增：将设置命令加入销毁队列
    );
}

export function deactivate() {}