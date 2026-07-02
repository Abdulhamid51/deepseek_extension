# DeepSeek VS Code Linker 🚀

VS Code muharriri va DeepSeek brauzer interfeysini bir-biriga bog'lovchi juda tezkor va qulay instrument. Ushbu plagin yordamida siz VS Code ichida turib istalgan kod parchasini belgilab, o'z savolingiz (prompt) bilan birga to'g'ridan-to'g'ri DeepSeek chatiga yuborishingiz va u yerdan qaytgan tayyor kodni VS Code-ga avtomatik ravishda yozib olishingiz mumkin.

---

## Loyiha Tuzilishi (Structure)

Loyiha ikkita asosiy qismdan iborat:
* **vscode-extension/** — VS Code plagin kodi (Node.js + WebSocket server).
* **chrome-extension/** — Brauzer uchun kontent skript (Content Script + WebSocket client).

---

## Bosqichma-bosqich o'rnatish va sozlash (Setup Guide)

### 1-bosqich: VS Code Extension-ni paketlash va o'rnatish

1. Terminalni oching va VS Code extension joylashgan papkaga kiring:
   * Buyruq: `cd path/to/your/vscode-extension`
2. Kerakli kutubxonalarni (ayniqsa WebSocket uchun ws modulini) o'rnating:
   * Buyruq: `npm install`
3. Loyihani .vsix formatidagi tayyor plagin fayliga paketlang:
   * Buyruq: `vsce package --allow-missing-repository`
   *(Agar terminal so'rov bersa, 'y' deb bosib Enter'ni bosing).*
4. Hosil bo'lgan `deepseek-linker-0.0.2.vsix` faylini VS Code-ga o'rnating:
   * VS Code-da **Extensions** bo'limiga kiring (`Cmd + Shift + X`).
   * Yuqoridagi uchta nuqta (...) menyusini bosing.
   * **"Install from VSIX..."** bandini tanlang va tayyor bo'lgan faylni yuklang.
5. VS Code oynasini yangilang: `Cmd + Shift + P` -> `Developer: Reload Window`.

### 2-bosqich: Chrome Extension-ni brauzerga yuklash

1. Google Chrome brauzerini oching va manzil satriga quyidagicha yozing:
   * `chrome://extensions/`
2. Sahifaning yuqori o'ng burchagidagi **"Developer mode"** (Ishlab chiquvchi rejimi) tugmasini yoqing.
3. Chap tomonda paydo bo'lgan **"Load unpacked"** (Yuklanmagan plaginni yuklash) tugmasini bosing.
4. Kompyuteringizdan loyihaning **chrome-extension** papkasini tanlang va yuklang.
5. [DeepSeek Chat](https://chat.deepseek.com) sahifasini oching va uni yangilang (**F5**). Chrome extension avtomatik ravishda fonda VS Code serveriga ulanadi.

---

## Qanday ishlatiladi? (Usage)

Tizim ishlash jarayoni juda oddiy:

1. VS Code-da ixtiyoriy kod faylini oching.
2. O'zgartirmoqchi yoki so'ramoqchi bo'lgan kod qismini **sichqoncha yordamida belgilang**.
3. **Cmd + Shift + 0** (Windows-da `Ctrl + Shift + 0`) kombinatsiyasini bosing.
4. VS Code oynasining tepasida **Prompt yozish maydoni** ochiladi. DeepSeek-ga topshirig'ingizni yozing (masalan: *"Kodni optimizatsiya qil"*) va **Enter** ni bosing.
5. Kod va so'rovingiz avtomatik ravishda brauzerdagi DeepSeek chatiga o'tib, yuboriladi.
6. DeepSeek javob yozishni tugatishi bilan, yangi kod avtomatik ravishda VS Code-ga qaytadi va siz belgilagan eski kod o'rniga joylashadi!

---

## Port Sozlamalari

Extensionlar o'zaro xavfsiz va to'qnashuvlarsiz aloqa qilishi uchun standart **8081** portidan foydalanadi. Agar portni o'zgartirmoqchi bo'lsangiz, ham VS Code `extension.js` faylidagi, ham Chrome `content.js` faylidagi port raqamlarini bir xil qiymatga moslang.
