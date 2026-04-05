import * as vscode from 'vscode';

export class SettingsWebview {
    public static readonly viewType = 'ghostwriterSettings';

    public static show(context: vscode.ExtensionContext) {
        const panel = vscode.window.createWebviewPanel(
            this.viewType,
            'GhostWriter 设置',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const config = vscode.workspace.getConfiguration('ghostwriter');

        // 生成简单的 HTML 界面
        panel.webview.html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { padding: 20px; color: var(--vscode-foreground); font-family: sans-serif; }
                    .field { margin-bottom: 20px; }
                    label { display: block; margin-bottom: 5px; font-weight: bold; }
                    input[type="text"], input[type="password"], input[type="number"], textarea { width: 100%; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); padding: 8px; box-sizing: border-box; }
                    input[type="range"] { width: 80%; vertical-align: middle; }
                    .range-val { display: inline-block; width: 15%; text-align: center; font-weight: bold; font-size: 1.2em; color: var(--vscode-textLink-foreground); }
                    input[type="checkbox"] { width: 18px; height: 18px; vertical-align: middle; }
                    button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 10px 20px; cursor: pointer; font-size: 14px; }
                    button:hover { background: var(--vscode-button-hoverBackground); }
                    .section-title { font-size: 1.1em; margin-top: 25px; padding-bottom: 5px; border-bottom: 1px solid var(--vscode-widget-border); }
                    .checkbox-label { display: inline; margin-left: 8px; vertical-align: middle; }
                </style>
            </head>
            <body>
                <h2>GhostWriter 设置</h2>
                
                <h3 class="section-title">API 配置</h3>
                <div class="field">
                    <label>API URL (OpenAI 兼容):</label>
                    <input type="text" id="apiUrl" value="${config.get('apiUrl')}">
                </div>
                <div class="field">
                    <label>API Key:</label>
                    <input type="password" id="apiKey" value="${config.get('apiKey')}" placeholder="输入您的 API Key">
                </div>
                <div class="field">
                    <label>模型名称:</label>
                    <input type="text" id="model" value="${config.get('model')}" placeholder="例如: gpt-3.5-turbo">
                </div>
                <div class="field">
                    <label>提示词 (System Prompt):</label>
                    <textarea id="prompt" rows="4">${config.get('prompt')}</textarea>
                </div>
                <div class="field">
                    <label>最大输出 Token:</label>
                    <input type="number" id="maxTokens" value="${config.get('maxTokens')}" min="1" max="4096">
                </div>
                
                <h3 class="section-title">输出设置</h3>
                <div class="field">
                    <label>单次按键输出字符数 (1-10):</label>
                    <input type="range" id="charsPerKey" min="1" max="10" value="${config.get('charsPerKey')}">
                    <span class="range-val" id="charsPerKeyVal">${config.get('charsPerKey')}</span>
                </div>
                
                <h3 class="section-title">自然节奏设置</h3>
                <div class="field">
                    <input type="checkbox" id="enableNaturalRhythm" ${config.get('enableNaturalRhythm') ? 'checked' : ''}>
                    <label class="checkbox-label" for="enableNaturalRhythm">启用自然打字节奏（模拟人类不均匀的打字速度）</label>
                </div>
                <div class="field">
                    <label>基础打字延迟 (ms):</label>
                    <input type="number" id="baseDelay" value="${config.get('baseDelay')}" min="10" max="500">
                </div>
                <div class="field">
                    <label>延迟随机波动范围 (ms):</label>
                    <input type="number" id="variance" value="${config.get('variance')}" min="0" max="100">
                </div>
                <div class="field">
                    <label>标点符号速度倍率:</label>
                    <input type="range" id="punctuationSpeed" min="0.1" max="2" step="0.1" value="${config.get('punctuationSpeed')}">
                    <span class="range-val" id="punctuationSpeedVal">${config.get('punctuationSpeed')}</span>
                </div>
                <div class="field">
                    <label>字母间额外随机延迟上限 (ms):</label>
                    <input type="number" id="letterVariance" value="${config.get('letterVariance')}" min="0" max="100">
                </div>
                <div class="field">
                    <label>空格键延迟倍率:</label>
                    <input type="range" id="spaceDelay" min="0.5" max="3" step="0.1" value="${config.get('spaceDelay')}">
                    <span class="range-val" id="spaceDelayVal">${config.get('spaceDelay')}</span>
                </div>
                <div class="field">
                    <label>换行延迟倍率:</label>
                    <input type="range" id="newlineDelay" min="0.5" max="4" step="0.1" value="${config.get('newlineDelay')}">
                    <span class="range-val" id="newlineDelayVal">${config.get('newlineDelay')}</span>
                </div>
                <div class="field">
                    <input type="checkbox" id="enableSpaceCollapse" ${config.get('enableSpaceCollapse') ? 'checked' : ''}>
                    <label class="checkbox-label" for="enableSpaceCollapse">启用空格合并（连续空格一次输出，不逐个空格延迟）</label>
                </div>
                
                <button onclick="save()" style="margin-top: 10px;">保存配置</button>

                <div style="margin-top: 30px; padding: 15px; background: var(--vscode-editor-inactiveSelectionBackground); border-radius: 5px;">
                    <p style="margin: 0 0 10px 0; font-size: 0.9em; font-weight: bold;">使用说明：</p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 0.85em; opacity: 0.9;">
                        <li>使用 <code>Ctrl+Enter</code> (Windows/Linux) 或 <code>Cmd+Enter</code> (macOS) 触发代码预测</li>
                        <li>预测完成后，继续输入即可自动输出建议代码</li>
                        <li>按任意键打断预测并返回正常输入模式</li>
                    </ul>
                    <p style="margin: 15px 0 0 0; font-size: 0.85em; opacity: 0.8;">
                        修改快捷键请前往 <a href="#" onclick="openKeys()">键盘快捷键设置</a> 搜索 "ghostwriter.predict"
                    </p>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();
                    
                    // 动态显示滑动条数值
                    const sliders = ['charsPerKey', 'punctuationSpeed', 'spaceDelay', 'newlineDelay'];
                    sliders.forEach(id => {
                        const el = document.getElementById(id);
                        if (el) {
                            el.oninput = function() {
                                document.getElementById(id + 'Val').innerText = this.value;
                            };
                        }
                    });

                    function save() {
                        vscode.postMessage({
                            command: 'save',
                            data: {
                                apiUrl: document.getElementById('apiUrl').value,
                                apiKey: document.getElementById('apiKey').value,
                                model: document.getElementById('model').value,
                                prompt: document.getElementById('prompt').value,
                                maxTokens: parseInt(document.getElementById('maxTokens').value),
                                charsPerKey: parseInt(document.getElementById('charsPerKey').value),
                                enableNaturalRhythm: document.getElementById('enableNaturalRhythm').checked,
                                baseDelay: parseInt(document.getElementById('baseDelay').value),
                                variance: parseInt(document.getElementById('variance').value),
                                punctuationSpeed: parseFloat(document.getElementById('punctuationSpeed').value),
                                letterVariance: parseInt(document.getElementById('letterVariance').value),
                                spaceDelay: parseFloat(document.getElementById('spaceDelay').value),
                                newlineDelay: parseFloat(document.getElementById('newlineDelay').value),
                                enableSpaceCollapse: document.getElementById('enableSpaceCollapse').checked
                            }
                        });
                    }
                    function openKeys() {
                        vscode.postMessage({ command: 'openKeys' });
                    }
                </script>
            </body>
            </html>
        `;

        // 处理来自 Webview 的消息
        panel.webview.onDidReceiveMessage(async message => {
            if (message.command === 'save') {
                const data = message.data;
                await config.update('apiUrl', data.apiUrl, vscode.ConfigurationTarget.Global);
                await config.update('apiKey', data.apiKey, vscode.ConfigurationTarget.Global);
                await config.update('model', data.model, vscode.ConfigurationTarget.Global);
                await config.update('prompt', data.prompt, vscode.ConfigurationTarget.Global);
                await config.update('maxTokens', data.maxTokens, vscode.ConfigurationTarget.Global);
                await config.update('charsPerKey', data.charsPerKey, vscode.ConfigurationTarget.Global);
                await config.update('enableNaturalRhythm', data.enableNaturalRhythm, vscode.ConfigurationTarget.Global);
                await config.update('baseDelay', data.baseDelay, vscode.ConfigurationTarget.Global);
                await config.update('variance', data.variance, vscode.ConfigurationTarget.Global);
                await config.update('punctuationSpeed', data.punctuationSpeed, vscode.ConfigurationTarget.Global);
                await config.update('letterVariance', data.letterVariance, vscode.ConfigurationTarget.Global);
                await config.update('spaceDelay', data.spaceDelay, vscode.ConfigurationTarget.Global);
                await config.update('newlineDelay', data.newlineDelay, vscode.ConfigurationTarget.Global);
                await config.update('enableSpaceCollapse', data.enableSpaceCollapse, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('GhostWriter 配置已保存！');
            } else if (message.command === 'openKeys') {
                vscode.commands.executeCommand('workbench.action.openGlobalKeybindings', 'ghostwriter.predict');
            }
        });
    }
}