let contextRoot = chrome.contextMenus.create({
    title: "Two Factor Authentication",
    contexts: ["all"],
    id: "root"
});
chrome.contextMenus.create({
    title: "Manage...",
    contexts: ["all"],
    parentId: contextRoot,
    onclick: function(data){
        let optionsUrl = chrome.extension.getURL('options.htm');
        chrome.tabs.query({url: optionsUrl}, function(tabs) {
            if (tabs.length) {
                chrome.tabs.update(tabs[0].id, {
                    active: true,
                    url: optionsUrl
                });
            } else {
                chrome.tabs.create({
                    active: true,
                    url: optionsUrl
                });
            }
        });
    }
});
chrome.contextMenus.create({
    title: "Add 2FA token",
    contexts: ["selection"],
    parentId: contextRoot,
    onclick: function(data){
        let optionsUrl = chrome.extension.getURL('options.htm'),
            fragment = `#action=add&secret=${encodeURIComponent(data.selectionText)}&from=${encodeURIComponent(data.pageUrl)}`;
        chrome.tabs.query({url: optionsUrl}, function(tabs) {
            if (tabs.length) {
                chrome.tabs.update(tabs[0].id, {
                    active: true,
                    url: optionsUrl + fragment
                });
            } else {
                chrome.tabs.create({
                    active: true,
                    url: optionsUrl + fragment
                });
            }
        });
    }
});
/*
chrome.contextMenus.create({
    contexts: ["all"],
    parentId: contextRoot,
    itemType: "separator"
});
*/

function getUniqueID(exclude){
    exclude = exclude || [];
    do{
        const k = new Array(16).fill(null).map(()=>Math.round(Math.random()*255).toString(16).padStart(2, '0')).join("");
        if(!(k in exclude)) return k;
    }while(true)
}

let TFAContextMenus = {};
function createManagedContextMenu(data, ctx){
    if(data.id === undefined)
        data.id = getUniqueID(TFAContextMenus);
    TFAContextMenus[chrome.contextMenus.create(data)] = ctx;
}

function insertTFAToken(info, tab){
    if(info.menuItemId in TFAContextMenus) {
        const text = "ASDF";
        chrome.tabs.sendMessage(tab.id, {
            name: "insertText",
            data: getTFAToken(TFAContextMenus[info.menuItemId])
        }, {frameId: info.frameId || 0});
    }
}

let tokens = new TFAStore();

function populateContextMenus(){
    for(let ctx of TFAContextMenus)
        chrome.contextMenus.remove(ctx);
    TFAContextMenus = [];
    for(let ctx of tokens.list()){
        ctx = TFAStore.get(ctx);
        let label = "";
        if(ctx.username)
            label += ctx.username;
        if(ctx.label){
            if(label != "")
                label += " | ";
            label += ctx.label;
        }
        let website = "<all_urls>";
        if(website)
            website = `*://${ctx.website}/`;
        createManagedContextMenu({
            title: label,
            contexts: ["editable"],
            parentId: contextRoot,
            documentUrlPatterns: website,
            onclick: insertTFAToken
        }, ctx);
    }
}

chrome.runtime.onMessage.addListener(function(message, callback){
    if(message.name == "reload"){
        TFAStore.load();
        populateContextMenus();
    }
});