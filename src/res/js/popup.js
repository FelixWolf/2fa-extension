function i18nProcessor(i18nData){
    var getI18nValue;
    if(typeof(i18nData)=="object")
        getI18nValue = function(n){
            return typeof(i18nData[n])=="string"?i18nData[n]:"!!I18N_UNDEFINED["+n+"]!!";
        }
    else if(typeof(i18nData)=="function")
        getI18nValue = i18nData;
    else
        throw Error("Expected function(key) or object");
    
    var reparsing=false;
    var processI18n = function(){
        if(reparsing)return;
        reparsing=true;
        var elms = document.body.querySelectorAll("*[data-i18n]");
        for(var i=0;i<elms.length;i++){
            elms[i].innerHTML = getI18nValue(elms[i].getAttribute("data-i18n"));
        }
        reparsing=false;
    }
    if (document.readyState == "complete" || document.readyState == "loaded" || document.readyState == "interactive"){
        processI18n();
        document.body.addEventListener('DOMSubtreeModified', function(){
            if(!reparsing)
                processI18n();
        }, false);
    }else{
        document.addEventListener("DOMContentLoaded", function(){
            processI18n();
            document.body.addEventListener('DOMSubtreeModified', function(){
                if(!reparsing)
                    processI18n();
            }, false);
        });
    }
}

function getElements(li){
    var result = {};
    for(var i in li)
        result[li[i]] = document.querySelectorAll(li[i]);
    return result;
}

function smoothScroll(element, rate, pos){
    var start = element.scrollLeft, currentOffset = 0,
        prevTime = +new Date();
    function frame(){
        var delta = (+new Date())-prevTime;
        prevTime = prevTime + delta;
        currentOffset = currentOffset + (delta/rate);
        if(currentOffset>1){
            element.scrollLeft = pos;
        }else{
            element.scrollLeft = start + (Math.sin(currentOffset*(Math.PI/2))*(pos-start));
            window.requestAnimationFrame(frame);
        }
    }
    frame();
}

document.addEventListener('DOMContentLoaded', function(){
    var elms = getElements([
        ".navigation > button",
        ".menus > .menu"
    ]);
    function setMenu(name){
        for(let e of elms[".navigation > button"]){
            if(e.dataset.menu == name)
                e.classList.add("selected");
            else
                e.classList.remove("selected");
        }
        for(let e of elms[".menus > .menu"]){
            if(e.dataset.menu == name)
                e.classList.add("selected");
            else
                e.classList.remove("selected");
        }
    }
    for(let e of elms[".navigation > button"]){
        e.addEventListener("click", function(e){
            console.log(e.target);
            setMenu(e.target.dataset.menu);
        });
    }
    setMenu(elms[".navigation > button"][0].dataset.menu);
    //Initialize i18n
    i18nProcessor(function(k){
        return chrome.i18n.getMessage(k);
    });
});

