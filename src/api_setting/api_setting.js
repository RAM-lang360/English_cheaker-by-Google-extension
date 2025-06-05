class ApiSetting {
    constructor() {
        this.api_text = document.getElementById("api_key");
        this.storebutton = document.getElementById("api-setting-store-button");
        this.testbutton = document.getElementById("api-setting-test-button");
        this.back_button = document.getElementById("back_button"); // ←追加
    }

    back_button_setup() {
        if (this.back_button) {
            this.back_button.addEventListener("click", () => {
                window.location.href = "../popup/popup.html";
            });
        }
    }

    apikey_store() {
        if (!this.storebutton || !this.api_text) return;

        this.storebutton.addEventListener('click', async () => {
            const apikey = this.api_text.value.trim();
            if (!apikey) {
                document.getElementById("store_result").classList.remove("true");
                document.getElementById("store_result").classList.add("false");
                document.getElementById("store_result").textContent = "失敗";
                return;
            }
            await chrome.storage.local.set({ apikey: apikey }, () => {
                document.getElementById("store_result").classList.remove("false");
                document.getElementById("store_result").classList.add("true");
                document.getElementById("store_result").textContent = "成功";
                console.log("API key stored:", apikey);
            });
        });
    }

    apikey_test() {
        if (!this.testbutton || !this.api_text) return;

        this.testbutton.addEventListener('click', () => {
            // APIキーの保存
            const apikey = this.api_text.value.trim();
            chrome.storage.local.set({ apikey: apikey }, () => {
                console.log("API key stored:", apikey);
            });
            
            chrome.runtime.sendMessage(
                { type: "test"}
            );
        });
    }
    get_test_result() {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.type === "test") {
                console.log("APIテスト結果:", message.result);
                if (message.result) {
                    document.getElementById("test_result").classList.remove("false");
                    document.getElementById("test_result").classList.add("true");
                    document.getElementById("test_result").textContent = "成功";
                } else {
                    document.getElementById("test_result").classList.remove("true");
                    document.getElementById("test_result").classList.add("false");
                    document.getElementById("test_result").textContent = "失敗";
                }
            }
        });
    }

}

const ApiSettings = new ApiSetting();
ApiSettings.back_button_setup();
ApiSettings.apikey_store();
ApiSettings.apikey_test();
ApiSettings.get_test_result();
