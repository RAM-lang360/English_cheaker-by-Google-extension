class Popup {
    constructor() {
        this.send_button = document.getElementById("send_button");
        this.api_button = document.getElementById("api_setting");
        this.option_button = document.getElementById("option_setting");
        this.order = document.querySelectorAll(".order button");
        this.request_text = document.getElementById("request_text");
        this.error = null;
        this.response_order = null;
        this.response_input_text = null;
    }

    //radioボタンの選択状態を管理
    button_check() {
        if (!this.order) return;
        this.order.forEach(btn => {
            btn.addEventListener("click", () => {
                this.order.forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
            });
        });
    }

    // 送信ボタンが押されたときの処理
    send_background() {
        if (!this.send_button || !this.request_text) return;
        this.send_button.addEventListener("click", () => {
            const text = this.request_text.value.trim();
            const selected = document.querySelector(".order .selected");
            const orderId = selected?.id;

            if (!orderId) {
                document.getElementById("status").classList.add("error");
                document.getElementById("status").textContent = "どれか1つチェックしてください";
                return;
            }
            if (text === "") {
                document.getElementById("status").classList.add("error");
                document.getElementById("status").textContent = "テキストを入力してください";
                return;
            }
            //ステータスの表示
            document.getElementById("status").textContent = "ステータス: 実行中";
            //リクエストをbackgroundへ送信
            chrome.runtime.sendMessage(
                {
                    type: "request",
                    request_text: text,
                    order: orderId
                }
            );
        });
    }


    //backgroundからのレスポンスをorderへリダイレクトする処理
    redirect_response() {

        chrome.runtime.onMessage.addListener((message) => {
            //リダイレクト処理
            if (message.type == "request") {
                this.response_order = message.order;
                this.response_text = message.response;
                this.response_input_text = message.input_text;
                // レスポンスのコンテンツを取得
                this.send_response_to_content();
                this.request_text.value = ""; // 送信後にテキストエリアをクリア
                document.getElementById("status").textContent = "ステータス: 完了";
                window.location.href = "../order/order.html";
            };
            //errorの処理
            if (message.type == "error") {
                this.error = message.error;
                document.getElementById("status").classList.add("error");
                document.getElementById("status").textContent = "ステータス: エラー - " + this.error;
            }
        });
    }

    //responseをorderに送るため中継地点としてbackgoundに送る処理(popup->background->order)
    send_response_to_content() {
        chrome.runtime.sendMessage(
            {
                type: "response",
                order: this.response_order,
                input_text: this.response_input_text,
                response: this.response_text
            },
        );
    }
    api_setup() {
        if (!this.api_button) return;
        this.api_button.addEventListener("click", () => {
            window.location.href = "../api_setting/api_setting.html";
        });
    }
    option_setup() {
        if (!this.option_button) return;
        this.option_button.addEventListener("click", () => {
            window.location.href = "../option_setting/option_setting.html";
        });
    }
}
const popups = new Popup();
popups.button_check();
popups.send_background();
popups.redirect_response();
popups.api_setup();
popups.option_setup();
