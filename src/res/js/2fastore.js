class URIUserInfo{
    constructor(username, password){
        if(username !== undefined && password === undefined){
            let i = 0, l = username.length;
            while(i++<l){
                if(username[i] == ":")
                    break;
            }
            this.username = decodeURIComponent(username.substring(0,i)) || null;
            this.password = i==l?null:decodeURIComponent(username.substring(i+1, l));
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
            this.name = name.substring(0, i++);
            this.port = i>l?null:parseInt(name.substring(i,l));
        }else{
            this.name = name || null;
            this.port = port || null;
        }
    }
    toString(){
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
    toString(){
        let result = "";
        const uinfo = this.userinfo.toString();
        if(uinfo !== null)
            result += `${uinfo}@`;
        const hinfo = this.host;
        if(hinfo)
            result += hinfo.toString();
        return result;
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
                    this.query.push([decodeURIComponent(key), decodeURIComponent(value)]);
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
        this.scheme = "";
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
                this.fragment = decodeURIComponent(location.substring(i, l));
            }
        }
        if(this.path === "")
            this.path == "/";
    }
    toString(){
        let result = `${this.scheme}://`;
        result += `${this.authority.toString()}`;
        result += `${this.path}`;
        result += this.query.toString();
        if(this.fragment !== "")
            result += `${this.fragment}`;
        return result;
    }
}
//2fa://username@website/token?label=[label]&encoding=[base64|base32|base16]&length=[int]&chars=[chars]&format=[format]&timeserver=[url]#test

class TFAEntry{
    constructor(opt){
        this.keys = [
            "username",
            "website",
            "secret",
            "label",
            "encoding",
            "length",
            "chars",
            "format",
            "timeserver"
        ];
        if(typeof opt === "string"){
            this.fromURI(opt);
        }else if(typeof opt === "object"){
            this.fromObject(opt);
        }
    }
    
    fromURI(uri){
        let result = new URI(uri);
        if(result.scheme != "2fa")
            throw Error("Invalid URI!");
        this.username = result.authority.userinfo.username;
        this.website = result.authority.host.name;
        let path = result.path.split("/").slice(1);
        this.secret = decodeURIComponent(path[0]);
        this.label = result.query.get("label")[0];
        this.encoding = result.query.get("encoding")[0] || "base32";
        this.length = result.query.get("length")[0];
        this.chars = result.query.get("chars")[0];
        this.format = result.query.get("format")[0];
        this.timeserver = result.query.get("timeserver")[0];
        this.timeoffset = parseFloat(result.query.get("timeoffset")[0]);
    }
    
    toURI(){
        let result = new URI();
        result.scheme = "2fa";
        if(this.username)result.authority.userinfo.username = this.username;
        if(this.website)result.authority.host.name = this.website;
        result.path = `/${encodeURIComponent(this.secret)}`;
        if(this.label) result.query.add("label", this.label);
        if(this.encoding) result.query.add("encoding", this.encoding);
        if(this.length) result.query.add("length", this.length);
        if(this.chars) result.query.add("chars", this.chars);
        if(this.format) result.query.add("format", this.format);
        if(this.timeserver) result.query.add("timeserver", this.timeserver);
        console.log(result.toString());
        return result.toString();
    }
    
    toURIGoogle(){
        const label = (this.website || "") + this.username?":"+this.username:"";
        const issuer = this.website || this.username;
        return `otpauth://totp/${encodeURIComponent(label)}?secret=${encodeURIComponent(this.secret)}&issuer=${encodeURIComponent(issuer)}`
    }
    
    fromObject(obj){
        for(let k of this.keys)
            this[k] = obj[k] || null;
    }
    
    toObject(){
        let result = {};
        for(let k of this.keys){
            if(this[k] !== undefined)
                result[k] = this[k];
        }
        return result;
    }
}

class TFAStore{
    constructor(){
        this.load();
    }
    
    //TODO: Move this to secure storage
    load(){
        let tmp = window.localStorage.getItem("2faStore") || "{}",
            store = JSON.parse(tmp);
        this.store = {};
        for(let k in store){
            this.store[k] = new TFAEntry();
            this.store[k].fromURI(store[k]);
        }
    }
    
    //TODO: Move this to secure storage
    save(){
        let store = {};
        for(let k in this.store){
            store[k] = this.store[k].toURI();
        }
        window.localStorage.setItem("2faStore", JSON.stringify(store));
        chrome.runtime.sendMessage({name: "reload"});
    }
    
    delete(entry){
        delete this.store[entry.label];
        this.save();
    }
    
    add(entry){
        this.store[entry.label] = entry;
        this.save();
    }
    
    get(name){
        return this.store[name];
    }
    
    list(){
        return Object.keys(this.store);
    }
    
    findByWebsite(name){
        name = name.toLowerCase()
        for(let entry of this.store){
            if(entry.website.toLowerCase() == name)
                return entry;
        }
        return null;
    }
}

function getTFAToken(entry, time){
    let secret = null;
    switch(entry.encoding){
        case "base32":
        default:
            secret = baseEncoding.base32.decode(entry.secret);
            break
    }
    
    if(secret == null)
        throw Error("Couldn't decode secret");
    
    const hmac = new HMAC(secret);
    
    //Create timestamp
    const timestamp = new ArrayBuffer(8);
    const timestampdv = new DataView(timestamp);
    if(time instanceof Date)
        timestampdv.setBigUint64(0, BigInt(+time)/1000n/30n);
    else
        timestampdv.setBigUint64(0, (BigInt(+new Date())/1000n/30n) + BigInt(time|0));
    
    //Update hmac
    hmac.update(new Uint8Array(timestamp));
    
    //Digest it
    const digest = hmac.digest();
    const digestdv = new DataView(digest.buffer);
    
    //Truncate it
    let truncatedHash = (digestdv.getUint32(digest[19]&0xF) & 0x7FFFFFFF);
    
    const length = entry.length || 6;
    if(entry.chars){
        let code = '';
        const charLength = entry.chars.length;
        for(let i = 0; i < length; i++){
            code += entry.chars[truncatedHash % charLength];
            truncatedHash = Math.floor(truncatedHash / charLength);
        }
        return code;
    }else{
        //Pad it and return it
        return String(truncatedHash % Math.pow(10, length)).padStart(length,0);
    }
}