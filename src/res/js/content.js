chrome.runtime.onMessage.addListener(function(message, callback){
    console.log(message);
    if(message.name == "insertText"){
        document.execCommand('insertText', false, message.data);
    }
    return true;
});