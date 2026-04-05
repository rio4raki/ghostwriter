import * as vscode from 'vscode';
import axios, { AxiosError } from 'axios';

export class AIProvider {
    private currentRequest: Promise<string> | null = null;

    public async fetchPrediction(documentText: string): Promise<string> {
        // 如果当前有正在进行的请求，先取消它
        if (this.currentRequest) {
            // 这里可以实现取消逻辑，如果 axios 支持的话
            // 目前只是等待前一个请求完成
            await this.currentRequest;
        }

        // 从 VS Code 配置中读取最新设置
        const config = vscode.workspace.getConfiguration('ghostwriter');
        const apiUrl = config.get<string>('apiUrl');
        const apiKey = config.get<string>('apiKey');
        const model = config.get<string>('model');
        const systemPrompt = config.get<string>('prompt');
        const maxTokens = config.get<number>('maxTokens');

        if (!apiKey) {
            vscode.window.showErrorMessage("请先在设置中配置 API Key！");
            return "";
        }

        // 创建新的请求
        this.currentRequest = this.makeRequest(apiUrl, apiKey, model, systemPrompt, maxTokens, documentText);
        
        try {
            const result = await this.currentRequest;
            this.currentRequest = null;
            return result;
        } catch (error) {
            this.currentRequest = null;
            throw error;
        }
    }

    private async makeRequest(
        apiUrl: string | undefined,
        apiKey: string | undefined,
        model: string | undefined,
        systemPrompt: string | undefined,
        maxTokens: number | undefined,
        documentText: string
    ): Promise<string> {
        try {
            const response = await axios.post(`${apiUrl}/chat/completions`, {
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Context code:\n${documentText}` }
                ],
                max_tokens: maxTokens,
                temperature: 0.2 // 保持输出稳定
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content || "";
        } catch (error) {
            const axiosError = error as AxiosError;
            let errorMessage = "未知错误";
            
            if (axiosError.response) {
                // 服务器返回了错误状态码
                errorMessage = `HTTP ${axiosError.response.status}: ${JSON.stringify(axiosError.response.data)}`;
            } else if (axiosError.request) {
                // 请求已发出但没有收到响应
                errorMessage = "网络错误：无法连接到 API 服务器";
            } else {
                // 发送请求时出错
                errorMessage = `请求错误: ${axiosError.message}`;
            }
            
            vscode.window.showErrorMessage(`AI 请求失败: ${errorMessage}`);
            return "";
        }
    }
}
