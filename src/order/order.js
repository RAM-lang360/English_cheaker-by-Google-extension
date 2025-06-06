
class Order {
    constructor() {
        this.back_button = document.getElementById("back_button");
        this.api_key = null; // APIキーを格納する変数
        this.response = null; // レスポンスを格納する変数
    }
    back_button_setup() {
        if (this.back_button) {
            this.back_button.addEventListener("click", () => {
                window.location.href = "../popup/popup.html";
            });
        }
    }
    //responseの処理
    get_response() {
        console.log("get_responseメソッドが呼び出されました");
        chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
            if (response.type == "response") {

                if (response.order=="text_check"){
                    document.getElementById("order-check-title").textContent="文法チェック";
                    document.getElementById("order-check-title-en").textContent="Grammar check";
                }
                if (response.order=="meaning_check"){
                    document.getElementById("order-check-title").textContent="意味の違い";
                    document.getElementById("order-check-title-en").textContent="Meaning difference";
                }
                if (response.order=="spell_check"){
                    document.getElementById("order-check-title").textContent="スペルチェック";
                    document.getElementById("order-check-title-en").textContent="Spell check";
                }
                
                console.log("レスポンスを受信:", response);
                // テキストチェックのレスポンス処理
                const judgment = response.response.judgment;
                const reason = response.response.reason;
                const correction_suggestion = response.response.ai_assessment;
                const input_text = response.input_text;

                console.log("判断", judgment)
                console.log("判断理由:", reason);
                console.log("修正案:", correction_suggestion);
                console.log("入力テキスト:", input_text);
                if (response.order == "text_check" || response.order == "spell_check") {

                    //テキストの入力
                    const inputText = document.getElementById("input_text");
                    inputText.textContent = input_text; // 入力テキストを表示
                    const correctionText = document.getElementById("judgment_reason");
                    correctionText.textContent = reason; // 判断理由
                    const reasonText = document.getElementById("correction_suggestion");
                    reasonText.textContent = correction_suggestion; // 修正案
                }
                if (response.order == "meaning_check") {
                    // 意味チェックのレスポンス処理
                    const inputText = document.getElementById("input_text");
                    inputText.textContent = input_text; // 入力テキストを表示
                    const correctionText = document.getElementById("judgment_reason");
                    correctionText.innerHTML = reason; // 判断理由
                    const formattedText = Object.entries(correction_suggestion)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join("<br>"); 
                    console.log("修正案:", formattedText);
                    const reasonText = document.getElementById("correction_suggestion");
                    reasonText.innerHTML = formattedText; // 修正案
                }
            }
        });
    }

}

const order = new Order();
order.back_button_setup();
order.get_response();
