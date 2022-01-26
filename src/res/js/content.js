chrome.runtime.onMessage.addListener(function(message, callback){
    if(message.name == "insertText"){
        document.execCommand('insertText', false, message.data);
    }else{
        
    }
});