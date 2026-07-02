import * as vscode from 'vscode';
import { WebSocketServer, WebSocket } from 'ws';

// Chrome Extension bilan aloqani ushlab turish uchun o'zgaruvchi
let activeSocket: WebSocket | null = null;

export function activate(context: vscode.ExtensionContext) {
    console.log('DeepSeek Linker extensioni faollashdi!');

    // 1. Orqa fonda 12345 portida WebSocket serverini ochamiz
    const wss = new WebSocketServer({ port: 12345 });

    wss.on('connection', (ws) => {
        activeSocket = ws;
        vscode.window.showInformationMessage('Chrome Extension VS Code-ga muvaffaqiyatli ulandi!');

        // 2. Chrome Extension-dan (DeepSeek saytidan) javob kelganda:
        ws.on('message', (message) => {
            const data = JSON.parse(message.toString());
            
            if (data.type === 'RESPONSE_FROM_DEEPSEEK') {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    // Belgilangan eski kodni DeepSeek yuborgan yangi kodga almashtiramiz
                    editor.edit(editBuilder => {
                        editBuilder.replace(editor.selection, data.code);
                    });
                    vscode.window.showInformationMessage('Kod DeepSeek yordamida muvaffaqiyatli yangilandi!');
                }
            }
        });

        ws.on('close', () => {
            activeSocket = null;
            console.log('Chrome Extension bilan aloqa uzildi.');
        });
    });

    // 3. Foydalanuvchi tugmani yoki shortcutni bosgandagi asosiy buyruq (Command)
    let disposable = vscode.commands.registerCommand('deepseek-linker.sendCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Hech qanday kod fayli ochilmagan!');
            return;
        }

        // Foydalanuvchi belgilagan (select qilgan) kod matnini olamiz
        const selectedCode = editor.document.getText(editor.selection);
        if (!selectedCode) {
            vscode.window.showErrorMessage('Iltimos, avval almashtirmoqchi bo\'lgan kod qismini belgilang!');
            return;
        }

        // VS Code oynasining tepasida Prompt kiritish uchun oyna ochamiz
        const prompt = await vscode.window.showInputBox({
            placeHolder: "Masalan: ushbu kodni optimizatsiya qilib ber yoki xatosini top",
            prompt: "DeepSeek-ga yuborish uchun amalni yozing"
        });

        // Agar prompt yozilmasdan oyna yopilsa, jarayonni to'xtatamiz
        if (!prompt) return;

        // 4. Agar Chrome Extension serverga ulanib turgan bo'lsa, unga ma'lumot jo'natamiz
        if (activeSocket && activeSocket.readyState === WebSocket.OPEN) {
            activeSocket.send(JSON.stringify({
                type: 'SEND_PROMPT',
                code: selectedCode,
                prompt: prompt
            }));
            vscode.window.showInformationMessage('So\'rov Chrome-ga jo\'natildi. DeepSeek yozishni tugatishini kutilmoqda...');
        } else {
            vscode.window.showErrorMessage('Chrome Extension ulanmagan! Iltimos, brauzerda DeepSeek saytini oching yoki yangilang.');
        }
    });

    context.subscriptions.push(disposable);
}

// Extension o'chirilganda serverni toza yopish uchun
export function deactivate() {}