//Port of https://github.com/983/SHA1 (Unlicense)
class SHA1 {
    add_byte_dont_count_bits(x){
        this.buf[this.i++] = x;
        if (this.i >= this.buf.length){
            this.i = 0;
            this.process_block(this.buf);
        }
    }

    rol32(x, n){
        return ((x << n) | (x >> (32n - n))) & 0xFFFFFFFFn;
    }

    make_word(p){
        return
            (p[0] << 24) |
            (p[1] << 16) |
            (p[2] << 8) |
            (p[3]);
    }

    process_block(data){
        const c0 = 0x5A827999n;
        const c1 = 0x6ED9EBA1n;
        const c2 = 0x8F1BBCDCn;
        const c3 = 0xCA62C1D6n;
        
        let state = new BigUint64Array([
            BigInt(this.state[0]),
            BigInt(this.state[1]),
            BigInt(this.state[2]),
            BigInt(this.state[3]),
            BigInt(this.state[4]),
        ]);
        
        let w = new BigUint64Array(16);
        
        for (let i = 0, ii = 0; i < 16; i++)
            w[i] = (BigInt(data[ii++]) << 24n) | (BigInt(data[ii++]) << 16n) | (BigInt(data[ii++]) << 8n) | BigInt(data[ii++]);
        
        const SHA1_LOAD = i => w[i&15] = this.rol32(w[(i+13)&15] ^ w[(i+8)&15] ^ w[(i+2)&15] ^ w[i&15], 1n);
        const shift = () => {const tmp = state[4]; state.copyWithin(1, 0, 4); state[0] = tmp;}
        let i = 0;
        for(; i < 16; i++){
            state[4] = (this.rol32(state[0], 5n) + (state[1] & (state[2] ^ state[3]) ^ state[3]) + state[4] + c0 + w[i&15]) & 0xFFFFFFFFn;
            state[1] = this.rol32(state[1], 30n);
            shift();
        }
        for(; i < 20; i++){
            SHA1_LOAD(i);
            state[4] = (this.rol32(state[0], 5n) + (state[1] & (state[2] ^ state[3]) ^ state[3]) + state[4] + c0 + w[i&15]) & 0xFFFFFFFFn;
            state[1] = this.rol32(state[1], 30n);
            shift();
        }
        for(; i < 40; i++){
            SHA1_LOAD(i);
            state[4] = (this.rol32(state[0], 5n) + (state[1] ^ state[2] ^ state[3]) + state[4] + c1 + w[i&15]) & 0xFFFFFFFFn;
            state[1] = this.rol32(state[1], 30n) & 0xFFFFFFFFn;
            shift();
        }
        for(; i < 60; i++){
            SHA1_LOAD(i);
            state[4] = (this.rol32(state[0], 5n) + (((state[1] | state[2]) & state[3]) | (state[1] & state[2])) + state[4] + c2 + w[i&15]) & 0xFFFFFFFFn;
            state[1] = this.rol32(state[1], 30n) & 0xFFFFFFFFn;
            shift();
        }
        for(; i < 80; i++){
            SHA1_LOAD(i);
            state[4] = (this.rol32(state[0], 5n) + (state[1] ^ state[2] ^ state[3]) + state[4] + c3 + w[i&15]) & 0xFFFFFFFFn;
            state[1] = this.rol32(state[1], 30n) & 0xFFFFFFFFn;
            shift();
        }
        for(i = 0; i < 5; i++)
            this.state[i] += Number(state[i]);
    }

    constructor(text){
        //Class variables
        this.state = new Uint32Array(5)
        this.buf = new Uint8Array(64);
        this.i = 0;
        this.n_bytes = 0n;
        
        //Initialization
        this.state[0] = 0x67452301;
        this.state[1] = 0xEFCDAB89;
        this.state[2] = 0x98BADCFE;
        this.state[3] = 0x10325476;
        this.state[4] = 0xC3D2E1F0;
        if(text)
            this.update(text);
    }

    update(x){
        switch(x.constructor){
            case Number:
                this.add_byte_dont_count_bits(x&0xFF);
                this.n_bytes++;
                break;
            case String:
                let enc = new TextEncoder(); // always utf-8
                x = enc.encode(x);
            case Uint8Array:
            case Int8Array:
            case Uint16Array:
            case Int16Array:
            case Uint32Array:
            case Int32Array:
            case Uint32Array:
            case Float32Array:
            case Float64Array:
                x = x.buffer;
                const data = new Uint8Array(x);
                
                let n = data.length,
                    i = 0;
                // fill up block if not full
                for (; n && this.i % this.buf.length; n--){
                    this.add_byte_dont_count_bits(data[i++]);
                    this.n_bytes++;
                }
                
                // process full blocks
                for (i = 0; n >= this.buf.length; n -= this.buf.length){
                    this.process_block(data.slice(i, i+this.buf.length));
                    i += this.buf.length;
                    this.n_bytes += BigInt(this.buf.length);
                }
                
                // process remaining part of block
                for (; n>0; n--){
                    this.add_byte_dont_count_bits(data[i++]);
                    this.n_bytes++;
                }
                break;
            default:
                throw Error("Unknown input type " + x.constructor);
        }
        return this;
    }
    
    finalize(){
        //Save state
        const
            prefinal_state = new Uint32Array(new ArrayBuffer(this.state.byteLength)),
            prefinal_buf = new Uint8Array(new ArrayBuffer(this.buf.byteLength)),
            prefinal_i = this.i,
            prefinal_n_bytes = this.n_bytes;
        
        prefinal_state.set(this.state);
        prefinal_buf.set(this.buf);
        
        // hashed text ends with 0x80, some padding 0x00 and the length in bits
        this.add_byte_dont_count_bits(0x80);
        while (this.i % 64 != 56)
            this.add_byte_dont_count_bits(0x00);
        
        for (let j = 56n, bl = this.n_bytes*8n; j >= 0; j-=8n){
            this.add_byte_dont_count_bits(Number((bl >> j)&0xFFn));
        }
        
        const result = this.state;
        //Restore state
        this.state = prefinal_state;
        this.buf = prefinal_buf;
        this.i = prefinal_i;
        this.n_bytes = prefinal_n_bytes;
        return result;
    }
    
    digest(){
        let state = this.finalize(), k = 0, bytes = new Uint8Array(20);
        for (let i = 0; i < 5; i++){
            for (let j = 3; j >= 0; j--){
                bytes[k++] = (state[i] >> j * 8) & 0xff;
            }
        }
        return bytes;
    }
    
    hexdigest(){
        return [...this.digest()].map(x => x.toString(16).padStart(2, '0')) .join('');
    }
};

class HMAC {
    constructor(secret, data){
        //Convert to bytes if needed
        const enc = new TextEncoder(); // always utf-8
        if(secret.constructor == String){
            secret = enc.encode(secret);
        }
        
        //Check key length
        if(secret.buffer.length > 64)
            throw Error("Key is bigger than 64 bytes!");
        
        //Setup the key with zero padding
        const tmp = new Uint8Array(secret.buffer);
        secret = new Uint8Array(64);
        secret.set(tmp);
        this.secret = secret;
        this.reset();
    }
    
    xor(a, b){
        const l = Math.min(a.length, b.length),
            result = new Uint8Array(l);
        for(let i = 0; i < l; i++){
            result[i] = a[i] ^ b[i];
        }
        return result;
    }
    
    reset(){
        this.inner = new SHA1(
            this.xor(this.secret, new Uint8Array(64).fill(0x36))
        );
    }
    
    update(data){
        this.inner.update(data);
    }
    
    digest(){
        const outer = new SHA1(
            this.xor(this.secret, new Uint8Array(64).fill(0x5c))
        );
        outer.update(this.inner.digest());
        return outer.digest();
    }
    
    hexdigest(){
        return [...this.digest()].map(x => x.toString(16).padStart(2, '0')).join('');
    }
}