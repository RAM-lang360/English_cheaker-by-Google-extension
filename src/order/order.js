
class Order {
    constructor() {
        this.back_button = document.getElementById("back_button");
        this.api_key = null; 
        this.response = null; 
    }
    //back-buttonの設定
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
        chrome.runtime.onMessage.addListener((response) => {
            if (response.type == "response") {

                //titleの変更
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
                

                // レスポンスを各変数に格納
                const judgment = response.response.judgment;
                const reason = response.response.reason;
                const correction_suggestion = response.response.ai_assessment;
                const input_text = response.input_text;

                console.log("判断", judgment)
                console.log("判断理由:", reason);
                console.log("修正案:", correction_suggestion);
                console.log("入力テキスト:", input_text);
                //文法チェック、スペルチェックの結果出力
                if (response.order == "text_check" || response.order == "spell_check") {
                    const inputText = document.getElementById("input_text");
                    inputText.textContent = input_text; 
                    const correctionText = document.getElementById("judgment_reason");
                    correctionText.textContent = reason; 
                    const reasonText = document.getElementById("correction_suggestion");
                    reasonText.textContent = correction_suggestion;
                }
                //意味の違いの結果出力
                if (response.order == "meaning_check") {
                    const inputText = document.getElementById("input_text");
                    inputText.textContent = input_text; 
                    const correctionText = document.getElementById("judgment_reason");
                    correctionText.innerHTML = reason;
                    //correction_suggestionはjson形式のため以下の処理を記述
                    const formattedText = Object.entries(correction_suggestion)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join("<br>"); 
                    console.log("修正案:", formattedText);
                    const reasonText = document.getElementById("correction_suggestion");
                    reasonText.innerHTML = formattedText;
                }
            }
        });
    }

}

const order = new Order();
order.back_button_setup();
order.get_response();
