

class Option_setting {

    constructor() {
        this.back_button = document.getElementById("back_button");
        this.models = document.querySelectorAll(".models button");
        this.model_name = document.getElementById("model_name")
        this.model_explaination_text = document.getElementById("model_explaination_text")
        this.store_button = document.getElementById("store_button")
        this.store_result = document.getElementById("store_result")
        this.model_info = {
            "test": "explaination",
            "gemini-2.0-flash": "速度とコスト効率を重視した軽量モデル。Gemini 1.5 Proの知識を継承しつつ、高速応答と低レイテンシを実現する。約100万トークン対応。",
            "gemini-1.5-pro": "高機能で汎用的なモデル。最大約200万トークンの広大なコンテキストウィンドウを持ち、複雑な推論や長文処理に優れる。テキスト、画像、音声、動画を含むマルチモーダルタスクで高い精度を発揮し、高度な分析やコンテンツ生成に適している。",
            "gemini-2.5-pro": "'課金回避のため使用不可'<br>高度な推論能力とコーディング能力とハイエンドなAIモデル,200kトークン以下だとinput $1.25 output $10,200kトークン以上だとinput $2.5 output $15.00",
            "gemini-2.0-pro": "'課金回避のため使用不可'<br>マルチモーダルに対応し高度な推論と膨大なトークンを解析できるハイエンドなAIモデル。"
        };
    }

    back_button_setup() {
        if (this.back_button) {
            this.back_button.addEventListener("click", () => {
                window.location.href = "../popup/popup.html";
            });
        }
    }

    button_check() {
        if (!this.models) return;
        this.models.forEach(btn => {
            btn.addEventListener("click", () => {
                this.models.forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
            });
        });
    }
    display_explanation() {
        this.models.forEach(btn => {
            btn.addEventListener("click", () => {
                if (btn.classList.contains("selected")) {
                    const text = btn.textContent.trim();
                    console.log(text); // または他の処理に使う
                    this.model_name.textContent = text
                    this.model_explaination_text.innerHTML = this.model_info[text]
                };
            });
        });
    }
    store_endpoint() {
        this.store_button.addEventListener("click", () => {
            let found = false;

            this.models.forEach(btn => {
                if (btn.classList.contains("selected")) {
                    const text = btn.textContent.trim();
                    if (text == "gemini-2.5-pro" || text == "gemini-2.0-pro") {
                        this.store_result.classList.remove("true");
                        this.store_result.classList.add("false");
                        this.store_result.textContent = "課金回避のため使用不可";
                    }
                    chrome.storage.local.set({ endpoint: text }, () => {
                        console.log("endpoint stored:", text);
                    });
                    this.store_result.classList.remove("false");
                    this.store_result.classList.add("true");
                    this.store_result.textContent = "成功";
                    found = true;
                }
            });

            if (!found) {
                this.store_result.classList.remove("true");
                this.store_result.classList.add("false");
                this.store_result.textContent = "モデルを選択してください";
            }
        });
    }

}


option_setting = new Option_setting()
option_setting.back_button_setup()
option_setting.button_check()
option_setting.display_explanation()
option_setting.store_endpoint()