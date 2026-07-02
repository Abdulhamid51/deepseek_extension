const vscode = require('vscode');
const WebSocket = require('ws');

let wss = null;

function activate(context) {
    console.log('DeepSeek Linker faollashdi!');

    // WebSocket Serverni Chrome Extension portiga (8081) moslab ishga tushiramiz
    if (!wss) {
        wss = new WebSocket.Server({ port: 8081 });
        
        wss.on('connection', (ws) => {
            console.log('Chrome Extension muvaffaqiyatli ulandi!');
            
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    
                    // DeepSeek javobni tugatgandan keyin yangi kod keladi
                    if (data.type === 'RESPONSE_FROM_DEEPSEEK' && data.code) {
                        insertCodeToEditor(data.code);
                    }
                } catch (err) {
                    console.error('Kelgan xabarni o‘qishda xatolik:', err);
                }
            });
        });
    }

    // Shortcut bosilganda ishga tushadigan asosiy buyruq
    let disposable = vscode.commands.registerCommand('deepseek-linker.sendCode', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Hech qanday kod muharriri ochiq emas!');
            return;
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (!text) {
            vscode.window.showWarningMessage('Iltimos, avval kodni belgilang!');
            return;
        }

        // VS Code tepadagi qismidan prompt (savol) yozadigan oyna ochiladi
        vscode.window.showInputBox({
            prompt: 'DeepSeek-ga nima buyruq bermoqchisiz?',
            placeHolder: 'Masalan: Xatosini top, Optimizatsiya qil, Django-ga mosla...',
            value: '' // Odatiy holatda bo'sh turadi
        }).then(userPrompt => {
            // Agar foydalanuvchi ESC bossa yoki oynani yopsa, funksiyani to'xtatamiz
            if (userPrompt === undefined) return;

            let finalPrompt = "";
            
            // Agar foydalanuvchi hech narsa yozmay shunchaki Enter bossa, standart prompt ketadi
            if (userPrompt.trim() === "") {
                finalPrompt = `Ushbu kodni tahlil qil va faqat to'g'rilangan yoki tayyor variantini KO'D BLOKI (pre) ichida qaytar, ortiqcha gaplar shart emas:\n\n${text}`;
            } else {
                // Agar o'zining savolini yozsa, o'sha savolga belgilangan kodni biriktiramiz
                finalPrompt = `${userPrompt}\n\nJavobni faqat tayyor kod holatida, KO'D BLOKI (pre) ichida qaytar, ortiqcha tushuntirishlar shart emas.\n\nKOD:\n${text}`;
            }

            // Chrome Extension ulanishini tekshiramiz va ma'lumotni jo'natamiz
            if (wss && wss.clients.size > 0) {
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'SEND_TO_DEEPSEEK',
                            code: finalPrompt
                        }));
                    }
                });
                vscode.window.showInformationMessage('So‘rov DeepSeek-ga yuborildi!');
            } else {
                vscode.window.showErrorMessage('Brauzer ulangan ko‘rinmaydi. DeepSeek sahifasini oching yoki yangilang!');
            }
        });
    });

    context.subscriptions.push(disposable);
}

// DeepSeek'dan kelgan tayyor kodni eski belgilangan kod o'rniga joylashtirish funksiyasi
function insertCodeToEditor(code) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        editor.edit(editBuilder => {
            editBuilder.replace(editor.selection, code);
        }).then(success => {
            if (success) {
                vscode.window.showInformationMessage('Kod DeepSeek javobi bilan muvaffaqiyatli yangilandi!');
            }
        });
    }
}

// Extension yopilganda WebSocket serverni toza o'chirish
function deactivate() {
    if (wss) {
        wss.close();
        wss = null;
    }
}

module.exports = {
    activate,
    deactivate
};