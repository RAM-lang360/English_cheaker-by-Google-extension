//p to change the popup

var questionID=document.getElementById("button")
if (questionID){
questionID.addEventListener("click",
function(event){
    event.preventDefault();// need to not refresh page
    //p to chenge popup
    window.location.href = 'popup.html';
}
)
}
else{
    console.log("????");
}


//p to accept messages from the background
async function handleMessage(request, sender, sendResponse) {
    if (request.action === "sendData") {
      //requsetdataを返答に変換
      console.log(request.data);
      question_data = await request.data.question;
      response_data=await request.data.data.candidates[0].content.parts[0].text;
      var result=await Separate_sentence(response_data);
      var hyouka_data=result[2];
      var reason_data=result[4];
      var repair_data=result[6];
      console.log(hyouka_data);
      console.log(reason_data);
      console.log(repair_data);
      displayResult("question",question_data.slice(2));
      displayResult("hyouka_result",hyouka_data);
      displayResult("reason_result",reason_data);
      displayResult("repair_result",repair_data);
    }
  }
  
  // ポップアップが開かれたときにイベントリスナーを登録する
  document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.onMessage.addListener(handleMessage);
  });
  
  // ポップアップが閉じられたときにイベントリスナーを削除する
  window.addEventListener('unload', function () {
    chrome.runtime.onMessage.removeListener(handleMessage);
  });

  //function to display result to result html
  async function displayResult(place,text) {
    document.getElementById(place).textContent=text;
    
  }


//p to separate the word

async function Separate_sentence(response_data) {
  const clean = response_data.replace(/\n/g, "");
  const sentences = clean.split("**");
  
  console.log(sentences); // 分割された文を出力して、正しく分割されているか確認
  results = sentences
  console.log(results);
  return results;
}