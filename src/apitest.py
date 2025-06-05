import requests
import json
import os # APIキーを環境変数から読み込むため

# --- 設定情報 ---
# 1. APIキーを安全に取得（環境変数から読み込むことを強く推奨）
# 例: export GEMINI_API_KEY="YOUR_API_KEY"
API_KEY = "AIzaSyDnTmMb3jtnFLcloRnvXR3v3gDgJHUk6Mo"

if not API_KEY:
    print("エラー: 環境変数 'GEMINI_API_KEY' が設定されていません。")
    print("APIキーを設定してから再度実行してください。")
    exit()

# 2. Gemini Proモデルのエンドポイント
# モデルによってエンドポイントが異なる場合があります。
# 現在（2025年6月時点）のGenerative Language APIのエンドポイントは以下の形式です。
API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# 3. リクエストヘッダー
HEADERS = {
    "Content-Type": "application/json",
}

# --- 関数定義 ---
def analyze_english_text_with_gemini(english_text: str):
    """
    指定された英文をGemini APIに送信し、文節の正誤を判断します。

    Args:
        english_text (str): 判断したい英文。

    Returns:
        dict: Gemini APIからのレスポンスを解析した辞書、またはエラー情報。
    """
    # プロンプトの構築
    # モデルに期待する出力形式をJSONで明確に指示することが重要です。
    prompt_content = f"""
    以下の英文の文節の正しさを判断してください。文法、スペル、意味の整合性に基づいて判断し、「正しい」か「間違っている」かで回答してください。間違っている場合は、修正案も提示してください。

    英文: "{english_text}"

    出力形式:
    ```
    {{
        "judgment": "正しい" または "間違っている",
        "reason": "判断理由",
        "correction_suggestion": "修正案（間違っている場合のみ。正しい場合は空欄）"
    }}
    ```
    """

    # リクエストボディの作成
    # Gemini APIのリクエストボディは 'contents' フィールド内に 'parts' リストを持ちます。
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt_content}
                ]
            }
        ],
        # 'temperature'はモデルの創造性を制御します。
        # 正確な判断が求められるため、低めの値（0.0〜0.5）が推奨されます。
        "generationConfig": {
            "temperature": 0.2
        }
    }

    # APIリクエストの送信
    try:
        # requests.post() でPOSTリクエストを送信
        # paramsにはURLクエリパラメータ（APIキーなど）を設定
        # jsonにはPython辞書を渡すと自動でJSONに変換し、Content-Typeヘッダーも設定してくれます
        response = requests.post(
            API_ENDPOINT,
            params={"key": API_KEY},
            headers=HEADERS,
            json=payload
        )

        # HTTPステータスコードを確認
        response.raise_for_status() # 200以外のステータスコードはHTTPErrorを発生させる

        # レスポンスのJSONを解析
        response_data = response.json()
        # モデルの出力（通常は 'candidates' の最初の要素の 'content' の 'parts' にある）
        if "candidates" in response_data and response_data["candidates"]:
            # モデルの出力テキストを抽出
            generated_text = response_data["candidates"][0]["content"]["parts"][0]["text"][0]
            
            # モデルの出力はJSON形式を想定しているので、さらにJSONとしてパースを試みる
            try:
                print("gene",generated_text)
                parsed_result = json.loads(generated_text)
                return parsed_result
            except json.JSONDecodeError:
                return {
                    "error": "モデルの出力がJSON形式ではありませんでした。",
                    "raw_gemini_output": generated_text,
                    "full_response": response_data
                }
        else:
            return {
                "error": "モデルからの有効な候補がありませんでした。",
                "full_response": response_data
            }

    except requests.exceptions.HTTPError as e:
        print(f"HTTPエラーが発生しました: {e.response.status_code} - {e.response.text}")
        return {"error": f"APIリクエストエラー: {e.response.text}"}
    except requests.exceptions.ConnectionError as e:
        print(f"接続エラーが発生しました: {e}")
        return {"error": "ネットワーク接続エラー。APIエンドポイントに到達できません。"}
    except requests.exceptions.Timeout as e:
        print(f"リクエストがタイムアウトしました: {e}")
        return {"error": "APIリクエストがタイムアウトしました。"}
    except requests.exceptions.RequestException as e:
        print(f"予期せぬエラーが発生しました: {e}")
        return {"error": f"予期せぬリクエストエラー: {e}"}

# --- 使用例 ---

# 1. 正しい英文の例
text_correct = "This is a beautiful day, isn't it?"
result_correct = analyze_english_text_with_gemini(text_correct)
print(f"\n--- 正しい英文の判断 ---")
print(f"入力: {text_correct}")
print(json.dumps(result_correct, indent=2, ensure_ascii=False))

print("-" * 30)

# 2. 間違った英文の例
text_incorrect = "He go to school yesterday."
result_incorrect = analyze_english_text_with_gemini(text_incorrect)
print(f"\n--- 間違った英文の判断 ---")
print(f"入力: {text_incorrect}")
print(json.dumps(result_incorrect, indent=2, ensure_ascii=False))

print("-" * 30)

# 3. 少し複雑な間違った英文の例
text_complex_incorrect = "Despite of the bad weather, they decided going for a walk."
result_complex_incorrect = analyze_english_text_with_gemini(text_complex_incorrect)
print(f"\n--- 複雑な間違った英文の判断 ---")
print(f"入力: {text_complex_incorrect}")
print(json.dumps(result_complex_incorrect, indent=2, ensure_ascii=False))