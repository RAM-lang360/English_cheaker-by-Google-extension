var questionID=document.getElementById("question-button")
if (questionID){
questionID.addEventListener("click",
async function(event){
    event.preventDefault();
    var question=await document.getElementById("question").value;
    let elements = document.getElementsByName('select-mode');
    let len = elements.length;
    let checkValue = '';
    for (let i = 0; i < len; i++){
    if (elements.item(i).checked){
            checkValue = elements.item(i).value;
        }
    }
    //backgroundには1つしか引数を設定できないため[mode:content]という形に変換
    var message=`${checkValue}:${question}`;
    await chrome.runtime.sendMessage({ action: "sendDataToServer", data:message});
    switch(checkValue) {
    case "1":
        window.location.href = await 'order1result.html';
        break
    case "2":
        window.location.href = await 'order2result.html';
        break
    case "3":
        window.location.href = await 'order3result.html';
    }
}
)
}
