let ws;

function connectWebSocket() {
    // VS Code server portiga ulanish (8081)
    ws = new WebSocket('ws://localhost:8081/');

    ws.onopen = () => {
        console.log("VS Code serveriga ulandik!");
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
            // VS Code'dan kod kelganida
            if (data.type === 'SEND_TO_DEEPSEEK' && data.code) {
                console.log("VS Code'dan kod keldi, DeepSeek'ga kiritilmoqda...");
                sendToDeepSeek(data.code);
            }
        } catch (err) {
            console.error("Xabarni qayta ishlashda xato:", err);
        }
    };

    ws.onclose = () => {
        console.log("Server uzildi. 3 soniyadan keyin qayta ulanishga urinib ko'riladi...");
        setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
        console.error("WebSocket xatolik:", error);
    };
}

// Kodni DeepSeek maydoniga yozish va yuborish funksiyasi
function sendToDeepSeek(code) {
    const textarea = document.querySelector('textarea');
    
    if (!textarea) {
        console.error("Xato: DeepSeek yozish maydoni (textarea) topilmadi!");
        return;
    }

    // 1. React/Vue ichki keshini tozalash va matnni majburlab kiritish
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    nativeTextAreaValueSetter.call(textarea, code);

    // 2. Brauzerga input o'zgarganini bir nechta eventlar orqali bildiramiz
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Kurserni matn oxiriga olib borib, fokus qilamiz
    textarea.focus();
    textarea.setSelectionRange(code.length, code.length);

    console.log("Matn kiritildi, element holati yangilandi.");

    // 3. Biroz kutib (DeepSeek o'ziga kelishi uchun), yuborish tugmasini bosamiz
    setTimeout(() => {
        // DeepSeek yuborish tugmasini aniq klasslari yoki SVG belgisi orqali qidiramiz
        let sendButton = document.querySelector('button[type="submit"]') || 
                         document.querySelector('.ds-button--circle') ||
                         textarea.parentElement.querySelector('button');

        // Agar tugma baribir topilmasa yoki disabled bo'lsa, Enter tugmasini simulyatsiya qilamiz
        if (sendButton && !sendButton.hasAttribute('disabled')) {
            sendButton.click();
            console.log("Yuborish tugmasi bosildi!");
        } else {
            console.log("Tugma topilmadi yoki bloklangan, Enter bosish simulyatsiya qilinmoqda...");
            const enterEvent = new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13
            });
            textarea.dispatchEvent(enterEvent);
        }

        // Javobni tekshirishni boshlash
        if (typeof checkResponseReady === 'function') {
            checkResponseReady();
        }
    }, 500); // Kutish vaqtini 500ms ga oshirdik, barqaror ishlashi uchun
}

// Kodni avtomatik o'qish va VS Code'ga qaytarish qismi (Oldingi to'g'rilangan versiya)
function checkResponseReady() {
    console.log("DeepSeek javobi kutilmoqda...");
    
    const interval = setInterval(() => {
        const textarea = document.querySelector('textarea');
        let sendButton = document.querySelector('.ds-button--circle') || 
                         document.querySelector('button[type="submit"]');

        if (textarea && !textarea.disabled && sendButton && !sendButton.hasAttribute('disabled')) { 
            clearInterval(interval);
            console.log("DeepSeek yozishni tugatdi. Kod render bo'lishi uchun 500ms kutilmoqda...");

            setTimeout(() => {
                console.log("Kod o'qilmoqda...");
                const preBlocks = document.querySelectorAll('pre');
                
                if (preBlocks.length > 0) {
                    const lastPre = preBlocks[preBlocks.length - 1];
                    let finalCode = lastPre.innerText.replace(/\u00A0/g, ' ');

                    console.log("Kod olindi, VS Code'ga yuborilmoqda...");
                    ws.send(JSON.stringify({
                        type: 'RESPONSE_FROM_DEEPSEEK',
                        code: finalCode.trim()
                    }));
                } else {
                    console.log("Xato: Sahifada kod (pre) bloki topilmadi.");
                }
            }, 500);
        }
    }, 1500);
}

// Skriptni ishga tushiramiz
connectWebSocket();