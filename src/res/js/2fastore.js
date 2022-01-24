class URIUserInfo{
    constructor(username, password){
        if(username !== undefined && password === undefined){
            let i = 0, l = username.length;
            while(i++<l){
                if(username[i] == ":")
                    break;
            }
            this.username = username.substring(0,i) || null;
            this.password = i==l?null:username.substring(i+1, l);
        }else{
            this.username = username || null;
            this.password = password || null;
        }
    }
    toString(){
        if(this.username === null && this.password === null)
            return null;
        let result = "";
        if(this.username !== null)
            result += encodeURIComponent(this.username);
        if(this.password !== null)
            result += ":" + encodeURIComponent(this.password);
        return result;
    }
}
class URIHost{
    constructor(name, port){
        if(name !== undefined && port === undefined){
            let i = 0, l = name.length;
            if(name[0] == "["){
                while(i++<l)
                    if(name[i] == "]")
                        break;
                if(name[(++i)+1] == ":")
                    i++;
            }else{
                while(i++<l)
                    if(name[i] == ":")
                        break;
            }
            this.name = name.substring(0, i);
            this.port = i==l?null:parseInt(name.substring(i+1,l));
        }else{
            this.name = name || null;
            this.port = port || null;
        }
    }
    toString(a){
        let result = "";
        if(this.name !== null)
            result += this.name;
        if(this.port !== null)
            result += ":" + this.port;
        return result;
    }
}
class URIAuthority{
    constructor(authority){
        this.userinfo = new URIUserInfo();
        if(authority){
            if(authority.substr(0,2) !== "//"){
                throw Error("Invalid authority!");
            }
            let i = 2, s = i, l = authority.length;
            while(i++<l){
                if(authority[i] == "@"){
                    this.userinfo = new URIUserInfo(authority.substring(s, i));
                    s = i+1;
                }
            }
            this.host = new URIHost(authority.substring(s, l));
        }
    }
}
class URIQuery{
    constructor(query){
        this.query = [];
        if(query && query.length>0){
            if(query[0] != "?")
                throw Error("Invalid Query String");
            else{
                let i = 0, s = i, l = query.length;
                while(i<l){
                    let key = "";
                    let value = "";
                    parse: {
                        while(i++<l){
                            if(query[i] == "&"){
                                value = null;
                                break;
                            }
                            if(query[i] == "=") break;
                        }
                        key = query.substring(s+1, i);
                        s = i;
                        if(value === null)
                            break parse;
                        
                        while(i++<l){
                            if(query[i] == "&")
                                break;
                        }
                        value = query.substring(s+1, i);
                    }
                    s = i;
                    this.query.push([key, value]);
                }
            }
        }
    }
    get(key, casesensitive){
        if(casesensitive === undefined)
            casesensitive = false;
        let values = [];
        for(let i = 0, l = this.query.length; i<l; i++){
            if(
                (casesensitive && key == this.query[i][0])
             || (!casesensitive && key.toLowerCase() == this.query[i][0].toLowerCase())
            ){
                values.push(this.query[i][1]);
            }
        }
        return values;
    }
    add(key, value){
        this.query.push([key,value]);
    }
    remove(key, casesensitive){
        if(casesensitive === undefined)
            casesensitive = false;
        if(typeof key === "number"){
            this.query.splice(key, 1);
        }else if(typeof v === "string"){
            let i = this.query.length;
            while(i--){
                if(
                    (casesensitive && key == this.query[i][0])
                || (!casesensitive && key.toLowerCase() == this.query[i][0].toLowerCase())
                ){
                    this.query.splice(i, 1);
                }
            }
        }
    }
    toString(prefix){
        let result = "";
        if(prefix === undefined || prefix === true)
            result += "?";
        for(let i = 0, l = this.query.length; i<l; i++){
            result += encodeURIComponent(this.query[i][0]);
            if(this.query[i][1] !== null)
                result += "="+encodeURIComponent(this.query[i][1]);
            if(i+1 != l)
                result += "&";
        }
        return result;
    }
}
class URI{
    constructor(location){
        this.scheme = "undefined";
        this.authority = new URIAuthority();
        this.path = "";
        this.query = new URIQuery();
        this.fragment = "";
        if(location){
            let i = 0, s = i, l = location.length;
            do if(location[i] == ":") break; while(i++<l);
            this.scheme = location.substring(s,i);
            if(location.substring(i+1,i+3) == "//"){
                if(location[++i] != "/")throw Error("Malformed URI");
                if(location[++i] != "/")throw Error("Malformed URI");
                s = i-1;
                while(i++<l) if(location[i] == "/") break;
                this.authority = new URIAuthority(location.substring(s, i));
            }else{
                this.authority = new URIAuthority();
            }
            s = i;
            while(i++<l) if(location[i] == "?" || location[i] == "#") break;
            this.path = location.substring(s, i);
            if(i<l && location[i] == "?"){
                s = i;
                while(i++<l) if(location[i] == "#") break;
                this.query = new URIQuery(location.substring(s, i));
            }
            if(i<l && location[i] == "#"){
                this.fragment = location.substring(i, l);
            }
        }
    }
}
//2fa://username@website/label/token?encoding=[base64|base32|base16]&length=[int]&chars=[chars]&format=[format]&timeserver=[url]#test

class TFAEntry{
    constructor(opt){
        if(typeof opt === "string"){
            this.fromURI(opt);
        }else if(typeof opt === "object"){
            
        }
    }
    fromURI(uri){
        let result = new URI(uri);
        this.username = result.authority.username;
        this.website = result.authority.host
    }
}
class TFAStore{
    constructor(){
        
    }
    store(entry){
        
    }
    get(name){
        
    }
}