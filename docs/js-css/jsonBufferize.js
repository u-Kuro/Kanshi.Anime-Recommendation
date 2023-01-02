JSON.bufferize = async(obj) =>{
    function _mergeUint8Array(_old,_new){
        if(_old.length){
            const mergedArray = new Uint8Array(_old.length + _new.length);
            mergedArray.set(_old);
            mergedArray.set(_new, _old.length);
            return mergedArray;
        } else { return _new }
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
        const encoder = new TextEncoder;
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
                        if(first) first = false;
                        else {
                            chunkStr+=', '
                        }
                        chunkStr+='"'+k.replace(/"/g,"'")+'":'
                        _bufferize(x[k])
                    } else {
                        if(first) first = false;
                        else {
                            chunkStr+=', '
                        }
                        if(typeof x[k]==='string'){
                            chunkStr+='"'+k.replace(/"/g,"'")+'":"'+x[k].replace(/"/g,"'")+'"'
                        } else {
                            chunkStr+='"'+k.replace(/"/g,"'")+'":'+(JSON.stringify(x[k])??'null')
                        }
                    }
                }
                chunkStr+='}'
                return
            } else if(x instanceof Array){
                chunkStr+='['
                for(let v of x){
                    if(isJson(v)||v instanceof Array){
                        if(first) first = false;
                        else {
                            chunkStr+=','
                        }
                        _bufferize(v)
                    } else {
                        if(first) first = false;
                        else {
                            chunkStr+=','
                        }
                        if(typeof v==='string'){
                            chunkStr+='"'+v.replace(/"/g,"'")+'"'
                        } else {
                            chunkStr+=JSON.stringify(v)??'null'
                        }
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