const baseEncoding = new (function(){
    this.base32 = new (function(){
        const pad = "=",
              alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        this.encode = function(s){
            const len = s.length;
            let o = "";
            let w, c, r=0, sh=0; // word, character, remainder, shift
            for(i=0; i<len; i+=5) {
                // mask top 5 bits
                c = s[i];
                w = 0xf8 & c;
                o += alphabet.charAt(w>>3);
                r = 0x07 & c;
                sh = 2;

                if ((i+1)<len) {
                    c = s[i+1];
                    // mask top 2 bits
                    w = 0xc0 & c;
                    o += alphabet.charAt((r<<2) + (w>>6));
                    o += alphabet.charAt((0x3e & c) >> 1);
                    r = c & 0x01;
                    sh = 4;
                }
                
                if ((i+2)<len) {
                    c = s[i+2];
                    // mask top 4 bits
                    w = 0xf0 & c;
                    o += alphabet.charAt((r<<4) + (w>>4));
                    r = 0x0f & c;
                    sh = 1;
                }

                if ((i+3)<len) {
                    c = s[i+3];
                    // mask top 1 bit
                    w = 0x80 & c;
                    o += alphabet.charAt((r<<1) + (w>>7));
                    o += alphabet.charAt((0x7c & c) >> 2);
                    r = 0x03 & c;
                    sh = 3;
                }

                if ((i+4)<len) {
                    c = s[i+4];
                    // mask top 3 bits
                    w = 0xe0 & c;
                    o += alphabet.charAt((r<<3) + (w>>5));
                    o += alphabet.charAt(0x1f & c);
                    r = 0;
                    sh = 0;
                } 
            }
            // Encode the final character.
            if (sh != 0) { o += alphabet.charAt(r<<sh); }
            // Calculate length of pad by getting the 
            // number of words to reach an 8th octet.
            var padlen = 8 - (o.length % 8);
            // modulus 
            if (padlen==8) { return o; }
            if (padlen==1) { return o + pad; }
            if (padlen==3) { return o + pad + pad + pad; }
            if (padlen==4) { return o + pad + pad + pad + pad; }
            if (padlen==6) { return o + pad + pad + pad + pad + pad + pad; }
            console.log('there was some kind of error');
            console.log('padlen:'+padlen+' ,r:'+r+' ,sh:'+sh+', w:'+w);
        };
        this.decode = function(s){
            const len = s.length, apad = alphabet + pad;
            let v,x,r=0,bits=0,c,o=[];

            s = s.toUpperCase();

            for(i=0;i<len;i+=1) {
                v = apad.indexOf(s.charAt(i));
                if (v>=0 && v<32) {
                    x = (x << 5) | v;
                    bits += 5;
                    if (bits >= 8) {
                        c = (x >> (bits - 8)) & 0xff;
                        o.push(c);
                        bits -= 8;
                    }
                }
            }
            // remaining bits are < 8
            if (bits>0) {
                c = ((x << (8 - bits)) & 0xff) >> (8 - bits);
                // Don't append a null terminator.
                // See the comment at the top about why this sucks.
                if (c!==0) {
                    o.push(c);
                }
            }
            return new Uint8Array(o);
        }
    })();
})();