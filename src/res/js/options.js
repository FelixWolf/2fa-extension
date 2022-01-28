const tfastore = new TFAStore();
let elements = {};

function createElementProps(tree){
    let elm = null;
    if(tree.xmlns)
        elm = document.createElementNS(tree.xmlns, tree.type);
    else
        elm = document.createElement(tree.type);
    for(let prop in tree){
        switch(prop){
            case "type":
            case "xmlns":
                break;
            case "class":
                if(tree.class.constructor == String)
                    elm.classList.add(tree.class);
                else for(let cls of tree.class)
                    elm.classList.add(cls);
                break;
            case "children":
                for(let child of tree.children)
                    elm.appendChild(child);
                break;
            case "attributes":
            case "attribs":
                for(let attribute in tree[prop])
                    if(tree.xmlns)
                        elm.setAttributeNS(null, attribute, tree[prop][attribute]);
                    else
                        elm.setAttribute(attribute, tree[prop][attribute]);
                break;
            case "style":
                for(let k in tree.style)
                    elm.style[k] = tree.style[k];
                break;
            case "listeners":
                for(let k in tree.listeners)
                    elm.addEventListener(k, tree.listeners[k]);
                break;
            case "dataset":
                for(let k in tree.dataset)
                    elm.dataset[k] = tree.dataset[k];
            default:
                if(prop in elm)
                    elm[prop] = tree[prop];
        }
    }
    return elm;
}

function testSearch(entry){
    const test = elements.search.value.toLowerCase();
    for(let prop of ["label", "website", "username", "secret"]){
        if(~(entry[prop]||"").toLowerCase().indexOf(test))
            return true;
    }
    return false;
}

function showHelp(){
    while(elements.details.firstChild)
        elements.details.removeChild(elements.details.firstChild);
    let elm = createElementProps({
        type: "div",
        children: [
            createElementProps({
                type: "h3",
                textContent: "Welcome!",
                style: {
                    marginTop: 0
                }
            }),
            createElementProps({
                type: "div",
                style: {
                    whiteSpace: "pre-wrap"
                },
                textContent: `This is a simple extension to handle two factor authentication.
It may not be the best, or the most feature filled, but it does the job.

For what it is, I hope you enjoy it!`
            }),
            createElementProps({
                type: "h3",
                textContent: "How to use",
                style: {
                    marginTop: 0
                }
            }),
            createElementProps({
                type: "div",
                style: {
                    whiteSpace: "pre-wrap"
                },
                textContent: `To add a key, click the green "+" on the side, a new blank entry will be added.
To remove a entry, click a entry and then use the red "-". It'll be gone.

You can backup your keys to a text file, or print them off using the backup buttons on the menu bar.
`,
                children: [
                    createElementProps({
                        type: "span",
                        textContent: "If you'd like to help this project, you can "
                    }),
                    createElementProps({
                        type: "a",
                        textContent: "contribute code here",
                        attributes: {
                            href: "https://github.com/FelixWolf/2fa-extension"
                        }
                    }),
                    createElementProps({
                        type: "span",
                        textContent: " or if you'd really like to, you can "
                    }),
                    createElementProps({
                        type: "a",
                        textContent: "donate",
                        attributes: {
                            href: DONATE_URL
                        }
                    }),
                    createElementProps({
                        type: "span",
                        textContent: "! :3"
                    }),
                ]
            }),
        ]
    });
    elements.details.appendChild(elm);
}

function showEntryInfo(source){
    while(elements.details.firstChild)
        elements.details.removeChild(elements.details.firstChild);
    let entry = tfastore.get(source.dataset.entry);
    let elm = createElementProps({
        type: "div",
        class: "entryDetails",
        children: [
            createElementProps({
                type: "input",
                class: "label",
                value: entry.label
            }),
            createElementProps({
                type: "div",
                style: {
                    width: "256px",
                    textAlign: "center"
                },
                children: [
                    createElementProps({
                        type: "div",
                        class: "qrcode",
                        style: {
                            backgroundImage: `url(${QRCode.generatePNG(entry.toURI(),
                                {
                                    modulesize: 4,
                                    margin: 0
                                }
                            )})`
                        }
                    }),
                    createElementProps({
                        type: "span",
                        style: {
                            wordBreak: "break-word",
                            fontWeight: "bold"
                        },
                        textContent: entry.secret
                    })
                ]
            }),
            createElementProps({
                type: "div",
                class: "fields",
                children: [
                    createElementProps({
                        type: "label",
                        textContent: "Website: ",
                    }),
                    createElementProps({
                        type: "input",
                        class: "website"
                    }),
                    createElementProps({
                        type: "label",
                        textContent: "Username: "
                    }),
                    createElementProps({
                        type: "input",
                        class: "username"
                    })
                ]
            }),
            createElementProps({
                type: "div",
                class: "buttons",
                children: [
                    createElementProps({
                        type: "button",
                        class: "btn_save",
                        textContent: "Save",
                        style: { background: "#0e0" },
                        listeners: {
                            click: function(e){
                                tfastore.save();
                            }
                        }
                    }),
                    createElementProps({
                        type: "button",
                        class: "btn_restore",
                        textContent: "Restore",
                        style: { background: "#eee" }
                    }),
                    createElementProps({
                        type: "button",
                        class: "btn_delete",
                        textContent: "Delete",
                        style: { background: "#e00" }
                    })
                ]
            })
        ]
    });
    elements.details.appendChild(elm);
}


function entryClick(e){
    const target = e.path.find(e=>e.classList.contains("entry"));
    for(let elm of elements.entries.children){
        elm.dataset.selected = elm == target;
    }
    if(!target)return;
    showEntryInfo(target);
}

function populateKeys(){
    while(elements.entries.firstChild)
        elements.entries.removeChild(elements.entries.firstChild);
    const thirty = Math.floor(+new Date()/1000%30);
    for(let entry in tfastore.store){
        entry = tfastore.store[entry];
        let elm = createElementProps({
            type: "div",
            class: "entry",
            listeners: {
                click: entryClick
            },
            children: [
                createElementProps({
                    type: "input",
                    class: "name",
                    value: entry.label
                }),
                createElementProps({
                    type: "div",
                    class: "fields",
                    children: [
                        createElementProps({
                            type: "label",
                            textContent: "Website: ",
                        }),
                        createElementProps({
                            type: "input",
                            class: "website",
                            attributes: {
                                "readonly": true
                            },
                        }),
                        createElementProps({
                            type: "label",
                            textContent: "Username: "
                        }),
                        createElementProps({
                            type: "input",
                            class: "username",
                            attributes: {
                                "readonly": true
                            },
                        }),
                        createElementProps({
                            type: "svg",
                            xmlns: "http://www.w3.org/2000/svg",
                            class: "timeLeftContainer",
                            attributes: {
                                viewBox: "0 0 100 100"
                            },
                            style: {
                                transform: "rotate(-90deg)",
                                strokeDasharray: (Math.PI * 2) * 30,
                                strokeDashoffset: (thirty/30.0)*((Math.PI * 2) * 30),
                                width: "2em",
                                height: "2em",
                            },
                            children: [
                                createElementProps({
                                    type: "circle",
                                    xmlns: "http://www.w3.org/2000/svg",
                                    attributes: {
                                        cx: "50",
                                        cy: "50",
                                        r: "30"
                                    },
                                    style: {
                                        stroke: "rgb(100,100,255)",
                                        fill: "rgba(0,0,0,0.1)",
                                        strokeWidth: 15
                                    }
                                })
                            ]
                        }),
                        createElementProps({
                            type: "input",
                            class: "token",
                            value: getTFAToken(entry),
                            attributes: {
                                "readonly": true
                            },
                            listeners: {
                                focus: function(e){
                                    e.target.focus();
                                    e.target.select();
                                    navigator.clipboard.writeText(e.target.value).then(function() {
                                    }, function(err) {
                                    });
                                }
                            }
                        }),
                    ]
                })
            ],
            dataset: {
                entry: entry.label,
                hidden: !testSearch(entry)
            }
        });
        elements.entries.appendChild(elm);
    }
}

function updateKeys(){
    const thirty = Math.floor(+new Date()/1000%30);
    for(let elm of elements.entries.children){
        elm.querySelector(".token").value = getTFAToken(tfastore.get(elm.dataset.entry));
        let circle = elm.querySelector(".timeLeftContainer");
        circle.style.strokeDashoffset = (thirty/30.0)*circle.style.strokeDasharray;
    }
}

document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll("*[js-tag]").forEach(a=>elements[a.getAttribute("js-tag")] = a);
    populateKeys();
    function filterSearch(){
        for(let elm of elements.entries.children){
            let e = tfastore.get(elm.dataset.entry);
            if(testSearch(e)){
                elm.dataset.hidden = false;
            }else{
                elm.dataset.hidden = true;
            }
        }
    }
    elements.search.addEventListener("change", filterSearch);
    elements.search.addEventListener("keyup", filterSearch);
    filterSearch();
    showHelp();
    setInterval(updateKeys, 1000);
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if(message.name == "reload"){
        tokens.load();
        populateKeys();
    }
    return true;
});