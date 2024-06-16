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
      displayResult("question",question_data.slice(2));
      displayResult("reason_result1",result);
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

  async function Separate_sentence(response_data) {
    //var sentences= response_data.replace(/\*/g, "");
    var sentences = response_data.replace(/\\n/g, '\n');
    console.log(sentences); // 分割された文を出力して、正しく分割されているか確認
    return sentences;
  }