JSON.bufferize = (obj) =>{
    const encoder = new TextEncoder;
    let chunkBuffer = new Uint8Array;
    let chunkStr = ''
    function mergeUint8Array(_old,_new){
        if(_old?.length){
            const mergedArray = new Uint8Array(_old.length + _new.length);
            mergedArray.set(_old);
            return mergedArray.set(_new, _old.length);
        } else { return _new }
    }
    function validSize(obj, maxByteSize = 1024*128){
        const constructor = obj?.constructor.name
        if(!obj){ return true; }
        else if(constructor==="Uint8Array"){ return new TextEncoder().encode(obj).length<maxByteSize; }
        else if(obj instanceof Array){ return JSON.stringify(obj).replace(/[\[\]\,\"]/g,'').length<maxByteSize; }
        else if(constructor==="Blob"){ return obj.size<maxByteSize }
        else if(typeof obj==="string"){ return obj.length<maxByteSize; }
        else{ return new Blob([JSON.stringify(obj)]).size<maxByteSize; }
    }
    function isJson(j){
        try{return(j?.constructor.name==='Object'&&`${j}`==='[object Object]')}
        catch(e){return false}
    }
    function _bufferize(x){
        let first = true;
        if(!validSize(chunkStr)){
            chunkBuffer = mergeUint8Array(chunkBuffer,encoder.encode(chunkStr))
            chunkStr = ''
        }
        if(isJson(x)){
            chunkStr+='{'
            // chunkBuffer = mergeUint8Array(chunkBuffer,encoder.encode('{'))
            for(let k in x){
                if(isJson(x[k])||x[k] instanceof Array){
                    if(first) first = false;
                    else {
                        chunkStr+=', '
                        // chunkBuffer = mergeUint8Array(chunkBuffer,encoder.encode(','))
                    }
                    chunkStr+='"'+k.replace(/"/g,"'")+'":'
                    // chunkBuffer = mergeUint8Array(chunkBuffer,encoder.encode('"'+k.replace(/"/g,"'")+'":'))
                    _bufferize(x[k])
                } else {
                    if(first) first = false;
                    else {
                        chunkStr+=', '
                        // chunkBuffer = mergeUint8Array(chunkBuffer,encoder.encode(','))
                    }
                    if(typeof x[k]==='string'){
                        chunkStr+='"'+k.replace(/"/g,"'")+'":"'+x[k].replace(/"/g,"'")+'"'
                        // chunkBuffer = mergeUint8Array(chunkBuffer,encoder.encode('"'+k.replace(/"/g,"'")+'":"'+x[k].replace(/"/g,"'")+'"'))
                    } else {
                        chunkStr+='"'+k.replace(/"/g,"'")+'":'+(JSON.stringify(x[k])??'null')
                        // chunkBuffer = mergeUint8Array(chunkBuffer,encoder.encode('"'+k.replace(/"/g,"'")+'":'+(JSON.stringify(x[k])??'null')))
                    }
                }
            }
            chunkStr+='}'
            // chunkBuffer = mergeUint8Array(chunkBuffer,encoder.encode('}'))
            return
        } else if(x instanceof Array){
            chunkStr+='['
            // chunkBuffer = mergeUint8Array(chunkBuffer,encoder.encode('['))
            for(let v of x){
                if(isJson(v)||v instanceof Array){
                    if(first) first = false;
                    else {
                        chunkStr+=','
                        // chunkBuffer = mergeUint8Array(chunkBuffer,encoder.encode(','))
                    }
                    _bufferize(v)
                } else {
                    if(first) first = false;
                    else {
                        chunkStr+=','
                        // chunkBuffer = mergeUint8Array(chunkBuffer,encoder.encode(','))
                    }
                    if(typeof v==='string'){
                        chunkStr+='"'+v.replace(/"/g,"'")+'"'
                        // chunkBuffer = mergeUint8Array(chunkBuffer,encoder.encode('"'+v.replace(/"/g,"'")+'"'))
                    } else {
                        chunkStr+=JSON.stringify(v)??'null'
                        // chunkBuffer = mergeUint8Array(chunkBuffer,encoder.encode((JSON.stringify(v)??'null')))
                    }
                }
            }
            chunkStr+=']'
            // chunkBuffer = mergeUint8Array(chunkBuffer,encoder.encode(']'))
            return;
        }
    }
    _bufferize(obj);
    return chunkBuffer;
}