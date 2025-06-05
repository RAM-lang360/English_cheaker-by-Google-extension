class Background {
    constructor() {
        this.request_text = null;
        this.order = null;
        this.endpoint = null;
        this.api_key = null;
        this.apiresponse = null;
        this.response = null;
        this.type = null;
        this.error = []

    }
    //インストール時のストレージの初期化
    async data_initialization() {
        console.log("拡張機能がインストールされました。ストレージを初期化します。");
        await chrome.storage.local.set({
            apikey: "",
            endpoint: "gemini-2.0-flash"
        });
        await chrome.storage.local.get('apikey', (result) => {
            this.apikey = result.apikey;
            if (!this.apikey) {
                console.log("APIキーが設定されていません。");
                return;
            }
            console.log("APIキーが取得されました:", this.apikey);
        });

        await chrome.storage.local.get('endpoint', (result) => {
            this.endpoint = result.endpoint;
            if (!this.endpoint) {
                console.log("エンドポイントが設定されていません。");
                return;
            }
            console.log("エンドポイントが取得されました:", this.endpoint);
        });
    }
    get_request() {
        chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
            //リクエストの処理
            if (request.type === "request") {
                console.log("background.js で受信", request);
                this.request_text = request.request_text;
                this.order = request.order;
                this.type = "request";

                // 非同期処理を別スレッドで処理
                await this.api_request()
                await this.response_format();
                if (this.error.length > 0) {
                    //重複の削除
                    this.error = [...new Set(this.error)];
                    console.error("エラーが発生しました:", this.error);
                    chrome.runtime.sendMessage({ type: "error", error: this.error });
                }
                else {
                    console.log("レスポンスをpopupに送信:", this.response);
                    chrome.runtime.sendMessage(this.response);
                }
            }
            //popupからorderに送る際の中継として使用
            if (request.type === "response") {
                //受信したresponseを各orderに応じてjsへ送信
                setTimeout(() => {
                    console.log("popupからresponseを受信", request);
                    chrome.runtime.sendMessage(request);
                }, 3000);
            }
            //apiのテスト
            if (request.type === "test") {
                console.log("APIテストリクエストを受信:", request);
                const testResult = await this.api_test();
                if (testResult) {
                    console.log("APIテスト結果:", testResult);
                    chrome.runtime.sendMessage(testResult);
                } else {
                    console.error("APIテストに失敗しました");
                    chrome.runtime.sendMessage({ type: "error", error: ["APIテストに失敗しました"] });
                }
            }
        });
    }


    prompt_set() {
        //request_textをあてはめたプロンプトを作成
        const english_text = this.request_text;
        const prompt1 = `
以下の英文の文節の正しさを判断してください...
英文: "${english_text}"
出力形式:
{
    "judgment": "正しい" または "間違っている",
    "reason": "判断理由",
    "correction_suggestion": "修正案(正しい場合はなしと出力)"
}
`;
        const prompt2 = `
    以下の複数の英単語の意味の違いを判断してください...
    英単語: "${english_text}"
    出力形式:
    {
        "judgment": "同じ" または "異なる",
        "reason": "判断理由",
        "different_part": "単語1": "意味1", "単語2": "意味2" (異なる場合のみ。正しい場合はなしと出力)
    }
    `;
        const prompt3 = `
    以下の英文のスペルの正しさを判断してください。文法、スペル、意味の整合性に基づいて判断し、「正しい」か「間違っている」かで回答してください。間違っている場合は、修正案も提示してください。

    英文: "${english_text}"

    出力形式:
{
    "judgment": "正しい" または "間違っている",
    "reason": "判断理由",
    "correction_suggestion": "修正案（間違っている場合のみ。正しい場合はなしと出力）"
    \`\`\`json
    {
        "judgment": "正しい" または "間違っている",
        "reason": "判断理由",
        "correction_suggestion": "修正案（間違っている場合のみ。正しい場合はなしと出力）"
    }
    \`\`\`
    `;
        //orderによってプロンプトを変える
        if (this.order === "text_check") return prompt1;
        if (this.order === "meaning_check") return prompt2;
        if (this.order === "spell_check") return prompt3;
        return "";
    }

    //apiの実行
    async api_request() {
        // Promiseを使ってstorageからAPIキーとエンドポイントを取得
        this.api_key = await new Promise((resolve) => {
            chrome.storage.local.get('apikey', (result) => {
                resolve(result.apikey || "");
            });
        });

        const model = await new Promise((resolve) => {
            chrome.storage.local.get('endpoint', (result) => {
                resolve(result.endpoint || "");
            });
        });

        this.endpoint=`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
        
        console.log("APIキー:", this.api_key);
        console.log("エンドポイント:", this.endpoint);

        // エラーチェック
        this.error = []; // ← 忘れずに初期化！
        if (!this.api_key.trim()) {
            console.error("APIキーが未設定です");
            this.error.push("APIキーが未設定です");
            return;
        }
        if (!this.endpoint.trim()) {
            console.error("エンドポイントが未設定です");
            this.error.push("エンドポイントが未設定です");
            return;
        }

        // promptの作成
        const prompt = this.prompt_set();
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2 }
        };

        // リクエスト実行
        try {
            const response = await fetch(`${this.endpoint}?key=${this.api_key}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            this.apiresponse = await response.json();
        } catch (error) {
            console.error("APIリクエスト中にエラー:", error);
            this.error.push("APIリクエスト中にエラー");
            return;
        }
    }

    response_format() {
        const raw_response = this.apiresponse;
        if (!raw_response?.candidates?.length) {
            console.error("APIレスポンスが不正です");
            this.error.push("APIレスポンスが不正です")
            return
        }

        const generatedText = raw_response.candidates[0]?.content?.parts?.[0]?.text || "";
        try {
            const jsonMatch = generatedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            const jsonStr = jsonMatch ? jsonMatch[1] : generatedText;
            const parsed = JSON.parse(jsonStr);
            this.response = {
                type: "request",
                order: this.order,
                input_text: this.request_text,
                response: {
                    judgment: parsed.judgment || "",
                    reason: parsed.reason || "",
                    ai_assessment: parsed.correction_suggestion || parsed.different_part || ""
                }
            };

        } catch (e) {
            console.log("レスポンスのJSONパースに失敗:", e);
            this.error.push("レスポンスのJSONパースに失敗")
            return;
        }
    }

    //apiテストの実行
    async api_test() {
        //apikeyの取得　あとでエラーコードを作成し個別のエラー対応ができるようにする
        // Promiseを使ってstorageからAPIキーとエンドポイントを取得
        this.api_key = await new Promise((resolve) => {
            chrome.storage.local.get('apikey', (result) => {
                resolve(result.apikey || "");
            });
        });

        const model = await new Promise((resolve) => {
            chrome.storage.local.get('endpoint', (result) => {
                resolve(result.endpoint || "");
            });
        });
        this.endpoint=`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
        console.log("APIキー:", this.api_key);
        console.log("エンドポイント:", this.endpoint);
        //各数値のチェック
        if (!this.api_key || !this.endpoint) {
            console.error("APIキーまたはエンドポイントが未設定です");
            this.error.push("APIキーまたはエンドポイントが未設定です")
            return;
        }

        //テストプロンプトの作成
        const testPrompt = "This is a test prompt.";
        const payload = {
            contents: [{ parts: [{ text: testPrompt }] }],
            generationConfig: { temperature: 0.1 }
        };

        try {
            //テストの実行
            const response_text = await fetch(`${this.endpoint}?key=${this.api_key}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response_text.json();
            let test = null
            if (result && result.candidates && result.candidates.length > 0) {
                console.log("API接続テスト成功:", result);
                test = true;
            } else {
                console.error("API接続テスト失敗:", result);
                test = false;
            }
            //responseの作成　resultがtrueかfalseかで動作確認
            const response = {
                type: "test",
                result: test
            }
            return response

        } catch (error) {
            console.error("API接続テスト中にエラー:", error);
            return null;
        }

    }
}

const background = new Background();
background.data_initialization();
background.get_request();