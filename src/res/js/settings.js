const DEBUG = true,
    DONATE_URL = "https://www.patreon.com/softhyena";

let settingDefaults = {
    
};
let settings = new (function(){
    let _settings = JSON.parse(window.localStorage["settings"]||"{}");
    this.get = function(key, fallback){
        if(key in _settings)
            return _settings[key];
        return key in settingDefaults?settingDefaults[key]:fallback;
    }
    this.set = function(key, value){
        _settings[key] = value;
        window.localStorage["settings"] = JSON.stringify(_settings);
    }
    this.delete = function(key, value){
        delete _settings[key];
        window.localStorage["settings"] = JSON.stringify(_settings);
    }
})();
