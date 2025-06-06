class Popup {
    constructor(flag) {
        if (flag == "popup") {
            this.send_button = document.getElementById("send_button");
            this.api_button = document.getElementById("api_setting");
            this.option_button = document.getElementById("option_setting");
            this.order = document.querySelectorAll(".order button");
            this.request_text = document.getElementById("request_text");
            this.error = null;
            this.response_order = null;
            this.response_input_text = null;
        }
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
                document.getElementById("status").textContent="どれか1つチェックしてください";
                return;
            }
            if (text === "") {
                document.getElementById("status").classList.add("error");
                document.getElementById("status").textContent="テキストを入力してください";
                return;
            }
            // back groundに送信する
            console.log("バックグラウンドにリクエストを送信:", { type: "request", request_text: text, order: orderId });
            //ステータスの表示
            document.getElementById("status").textContent = "ステータス: 実行中";
            chrome.runtime.sendMessage(
                {
                    type: "request",
                    request_text: text,
                    order: orderId
                },
                (response) => {
                    console.log("バックグラウンドからのレスポンス:", response);
                }
            );

            

        });
    }


    //backgroundからのレスポンスを受けたらリダイレクト
    redirect_response() {
        chrome.runtime.onMessage.addListener((message) => {
            console.log("バックグラウンドからのメッセージ:", message);
            if (message.type == "request") {
                this.response_order = message.order;
                this.response_text = message.response;
                this.response_input_text = message.input_text;
                // レスポンスのコンテンツを取得
                    console.log("レスポンスを受信:", this.response_text);
                    this.send_response_to_content();
                    this.request_text.value = ""; // 送信後にテキストエリアをクリア
                    document.getElementById("status").textContent = "ステータス: 完了";
                    window.location.href = "../order/order.html";
                
            };
            if (message.type == "error") {
                    console.error("エラーが発生しました:", message.error)
                    this.error = message.error;
                    console.error("エラー:", this.error);
                    document.getElementById("status").classList.add("error");
                    document.getElementById("status").textContent = "ステータス: エラー - " + this.error;
                }
    });
}

send_response_to_content() {
    console.log("コンテンツにレスポンスを送信:", this.response_text, this.response_order);
    chrome.runtime.sendMessage(
        {
            type: "response",
            order: this.response_order,
            input_text: this.response_input_text,
            response: this.response_text
        },
        (response) => {
            console.log("コンテンツからのレスポンス:", response);
        }
    );
}
api_setup(){
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
const popups = new Popup("popup");
popups.button_check();
popups.send_background();
popups.redirect_response();
popups.api_setup();
popups.option_setup();
