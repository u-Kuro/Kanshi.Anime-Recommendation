const encoder = new TextEncoder;
JSON.bufferize = async(obj) =>{
    function _mergeUint8Array(_old,_new){
        const mergedArray = new Uint8Array(_old.length + _new.length);
        mergedArray.set(_old);
        mergedArray.set(_new, _old.length);
        return mergedArray;
    }
    function _validSize(obj, maxByteSize=1024*1024){
        const constructor = obj?.constructor.name
        if(!obj&&obj!==false){ return true; }
        else if(typeof obj==="string"){ return obj.length<maxByteSize; }
        else if(constructor==="Blob"){ return obj.size<maxByteSize }
        else if(constructor==="Uint8Array"){ return new TextEncoder().encode(obj).length<maxByteSize; }
        else if(obj instanceof Array){ return JSON.stringify(obj).replace(/[\[\]\,\"]/g,'').length<maxByteSize; }
        else{ return new Blob([JSON.stringify(obj)]).size<maxByteSize; }
    }
    return await new Promise((resolve) => {
        let chunkBuffer = new Uint8Array;
        let chunkStr = ''
        function isJson(j){
            try{return(j?.constructor.name==='Object'&&`${j}`==='[object Object]')}
            catch(e){return false}
        }
        async function _bufferize(x){
            let first = true;
            if(!_validSize(chunkStr)){
                chunkBuffer = _mergeUint8Array(chunkBuffer,encoder.encode(chunkStr))
                chunkStr = ''
            }
            if(isJson(x)){
                chunkStr+='{'
                for(let k in x){
                    if(isJson(x[k])||x[k] instanceof Array){
                        if(first){ first = false }
                        else { chunkStr+=',' }
                        chunkStr+=JSON.stringify(k)+':'
                        _bufferize(x[k])
                    } else if(x[k]!==undefined){
                        if(first){ first = false }
                        else { chunkStr+=',' }
                        chunkStr+=JSON.stringify(k)+':'+JSON.stringify(x[k])
                    }
                }
                chunkStr+='}'
                return
            } else if(x instanceof Array){
                chunkStr+='['
                for(let v of x){
                    if(isJson(v)||v instanceof Array){
                        if(first){ first = false }
                        else { chunkStr+=',' }
                        _bufferize(v)
                    } else {
                        if(first){ first = false }
                        else { chunkStr+=',' }
                        chunkStr+=JSON.stringify(v)
                    }
                }
                chunkStr+=']'
                return;
            }
        }
        _bufferize(obj);
        chunkBuffer = _mergeUint8Array(chunkBuffer,encoder.encode(chunkStr))
        return resolve(chunkBuffer);
    })
}