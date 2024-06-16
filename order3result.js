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
      
      question_data = await request.data.question;
      console.log("qu",question_data);
      response_data=await request.data.data.candidates[0].content.parts[0].text;
      var result=await Separate_sentence(response_data);
      var spelling_data=result[0];
      var sentence_data=result[1];
      console.log("sp",spelling_data);
      console.log("se",sentence_data);
      displayResult("question",question_data.slice(2));
      displayResult("spelling_result",spelling_data);
      displayResult("sentence_result",sentence_data);
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
  const sentences =response_data.split("::");
  
  console.log(sentences); // 分割された文を出力して、正しく分割されているか確認
  results = sentences
  console.log(results);
  return results;
}