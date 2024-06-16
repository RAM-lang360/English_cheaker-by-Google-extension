chrome.runtime.onMessage.addListener(
  async function(request, sender, sendResponse) {
    if (request.action === "sendDataToServer") {
      try {
        // リクエストデータからオーダーを作成
        const order = await makerequest(request.data);
        console.log(order);
        // サーバーからデータを取得
        const responseData = await fetchData(order);
        // レスポンスデータに質問を追加して送信
        await chrome.runtime.sendMessage({ action: "sendData", data: { ...responseData, question: request.data } });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  }
);

async function makerequest(data) {
  var order1 = "今から英文を提出します。正しい英語か確認してください。もし間違っている場合は評価、理由、修正した文に項目を分けて返答してください。";
  var order2 = "今から二つの英単語を提出します。最後に各単語を使った英文を日本語訳付きで生成してください";
  var order3 = "今から英単語を提出します。スペルが正しい場合は'correct'正しくない場合は'incorrect'。最後にその単語を使った英文一つ日本語訳をつけて生成してください。そのあとに::をつけてください";

  const separate_data = data.split(":");
  let order = "";
  switch (separate_data[0]) {
    case "1":
      order = order1 + separate_data[1];
      break;
    case "2":
      order = order2 + separate_data[1];
      break;
    case "3":
      order = order3 + separate_data[1];
      break;
    default:
      break;
  }
  return order;
}

async function fetchData(data) {
  var apikey = "Individually API key";
  var url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apikey}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: data }],
          },
        ],
      }),
    });
    const responseData = await response.json();
    return { data: responseData, status: response.status };
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}
