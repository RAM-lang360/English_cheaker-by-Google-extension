const jsonFileUrl = chrome.runtime.getURL('example.json');

// JSONファイルを取得するリクエストを送信
fetch(jsonFileUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // JSONデータを取得した後の処理
    console.log(data);
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });