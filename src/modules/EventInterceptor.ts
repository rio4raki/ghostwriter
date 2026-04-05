import * as vscode from 'vscode';
import { StateManager, ExtensionState } from './StateManager';
import { EditorAction } from './EditorAction';

export class EventInterceptor {
    private typeCommandDisposable: vscode.Disposable;
    // 异步锁：确保插入操作按顺序执行，不会因为手速过快而产生重叠和乱码
    private processingQueue: Promise<void> = Promise.resolve();
    // 节流控制：防止快速按键导致的字符丢失
    private isProcessing: boolean = false;
    // 待处理的按键缓冲区
    private pendingKeyPresses: number = 0;

    constructor(
        private stateManager: StateManager,
        private editorAction: EditorAction
    ) {
        this.typeCommandDisposable = vscode.commands.registerCommand('type', this.onType.bind(this));
    }

    private onType(args: { text: string }) {
        const state = this.stateManager.getState();

        if (state === ExtensionState.READY || state === ExtensionState.TYPING) {
            // 节流：记录按键次数，但限制同时处理的任务数
            this.pendingKeyPresses++;
            
            // 如果当前正在处理，将任务加入队列等待
            if (this.isProcessing) {
                this.processingQueue = this.processingQueue.then(async () => {
                    await this.processKeyPress();
                }).catch(err => {
                    console.error("Queue execution error:", err);
                    this.stateManager.reset();
                });
            } else {
                // 当前没有处理任务，直接处理
                this.processKeyPress();
            }
        } else {
            // 如果处于 IDLE 或 FETCHING 状态，原样放行，立即执行
            vscode.commands.executeCommand('default:type', { text: args.text });
        }
    }

    /**
     * 处理单个按键
     */
    private async processKeyPress(): Promise<void> {
        // 设置处理中标志
        this.isProcessing = true;
        
        try {
            // 减少待处理计数
            this.pendingKeyPresses = Math.max(0, this.pendingKeyPresses - 1);
            
            const config = vscode.workspace.getConfiguration('ghostwriter');
            const charsPerKey = config.get<number>('charsPerKey') || 5;
            const enableNaturalRhythm = config.get<boolean>('enableNaturalRhythm') ?? true;
            const enableSpaceCollapse = config.get<boolean>('enableSpaceCollapse') ?? true;

            const textToType = this.stateManager.advanceTyping(charsPerKey, enableNaturalRhythm && enableSpaceCollapse);
            if (textToType) {
                if (enableNaturalRhythm) {
                    await this.typeWithNaturalRhythm(textToType, config);
                } else {
                    await this.editorAction.typeCharacter(textToType);
                }
                
                // 如果还有待处理的按键，继续处理
                if (this.pendingKeyPresses > 0) {
                    await this.processKeyPress();
                }
            }
        } finally {
            // 任务完成后清除处理标志
            this.isProcessing = false;
        }
    }

    /**
     * 自然节奏打字：模拟人类不均匀的打字速度
     */
    private async typeWithNaturalRhythm(text: string, config: vscode.WorkspaceConfiguration): Promise<void> {
        const baseDelay = config.get<number>('baseDelay', 80);
        const variance = config.get<number>('variance', 40);
        const punctuationSpeed = config.get<number>('punctuationSpeed', 0.5);
        const letterVariance = config.get<number>('letterVariance', 20);
        const spaceDelay = config.get<number>('spaceDelay', 1.5);
        const newlineDelay = config.get<number>('newlineDelay', 2.0);
        const enableSpaceCollapse = config.get<boolean>('enableSpaceCollapse') ?? true;

        // 标点符号集合（需要更快的停顿）
        const punctuationSet = new Set(['.', ',', ';', ':', '!', '?', '(', ')', '[', ']', '{', '}']);

        let i = 0;
        while (i < text.length) {
            const char = text[i];
            
            // 空格合并处理：如果启用，连续空格一次输出
            if (enableSpaceCollapse && char === ' ') {
                // 统计连续空格数量
                let spaceCount = 0;
                while (i + spaceCount < text.length && text[i + spaceCount] === ' ') {
                    spaceCount++;
                }
                
                // 一次输出所有空格，只加一次延迟
                const randomVariance = (Math.random() * 2 - 1) * variance;
                let delay = baseDelay + randomVariance;
                delay = delay * spaceDelay;
                delay = Math.max(10, Math.min(500, delay));
                
                const spaces = ' '.repeat(spaceCount);
                await this.editorAction.typeCharacter(spaces);
                await this.sleep(delay);
                
                i += spaceCount;
                continue;
            }
            
            const isPunctuation = punctuationSet.has(char);

            // 计算基础延迟：baseDelay ± variance
            const randomVariance = (Math.random() * 2 - 1) * variance;
            let delay = baseDelay + randomVariance;

            // 换行特殊处理：换行后有明显的停顿
            if (char === '\n' || char === '\r') {
                delay = delay * newlineDelay;
            }
            // 制表符特殊处理
            else if (char === '\t') {
                delay = delay * 1.5;
            }
            // 标点符号特殊处理
            else if (isPunctuation) {
                if (char === '.' || char === '!' || char === '?' || char === ':') {
                    // 句号、感叹号、问号后停顿更长
                    delay = delay * 1.5 * punctuationSpeed;
                } else {
                    // 其他标点使用配置的倍率
                    delay = delay * punctuationSpeed;
                }
            } else {
                // 普通字母添加额外随机延迟，模拟手指移动
                const extraDelay = Math.random() * letterVariance;
                delay += extraDelay;
            }

            // 确保延迟不会太小（至少10ms）或太大（最多500ms）
            delay = Math.max(10, Math.min(500, delay));

            // 插入字符
            await this.editorAction.typeCharacter(char);

            // 等待延迟
            await this.sleep(delay);
            
            i++;
        }
    }

    /**
     * 工具函数：Promise 版本的 setTimeout
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public dispose() {
        this.typeCommandDisposable.dispose();
    }
}
