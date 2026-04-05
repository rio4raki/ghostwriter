import * as vscode from 'vscode';

export enum ExtensionState {
    IDLE = 'IDLE',
    FETCHING = 'FETCHING',
    READY = 'READY',
    TYPING = 'TYPING'
}

export class StateManager {
    private state: ExtensionState = ExtensionState.IDLE;
    private predictedText: string = "";
    private currentOffset: number = 0;

    private _onStateChange = new vscode.EventEmitter<ExtensionState>();
    public readonly onStateChange = this._onStateChange.event;

    private _onProgressChange = new vscode.EventEmitter<{ current: number, total: number }>();
    public readonly onProgressChange = this._onProgressChange.event;

    public getState(): ExtensionState {
        return this.state;
    }

    public setState(newState: ExtensionState) {
        this.state = newState;
        this._onStateChange.fire(this.state);
    }

    public setPrediction(text: string) {
        this.predictedText = text;
        this.currentOffset = 0;
        this.setState(ExtensionState.READY);
        this._onProgressChange.fire({ current: this.currentOffset, total: this.predictedText.length });
    }

    public advanceTyping(count: number, enableSpaceCollapse: boolean = false): string | null {
        if (this.currentOffset < this.predictedText.length) {
            let end = this.currentOffset;
            
            // 如果启用空格合并，且当前是空格，则输出所有连续空格
            if (enableSpaceCollapse && this.predictedText[end] === ' ') {
                while (end < this.predictedText.length && this.predictedText[end] === ' ') {
                    end++;
                }
            } else {
                // 普通情况：按 count 输出字符
                end = Math.min(this.currentOffset + count, this.predictedText.length);
            }
            
            const charsToType = this.predictedText.substring(this.currentOffset, end);
            this.currentOffset = end;
            
            if (this.state !== ExtensionState.TYPING) {
                this.setState(ExtensionState.TYPING);
            }
            
            this._onProgressChange.fire({ current: this.currentOffset, total: this.predictedText.length });

            // 预测文本输出完毕，回归休眠
            if (this.currentOffset >= this.predictedText.length) {
                this.reset();
            }
            return charsToType;
        }
        return null;
    }

    public reset() {
        this.predictedText = "";
        this.currentOffset = 0;
        this.setState(ExtensionState.IDLE);
    }
}