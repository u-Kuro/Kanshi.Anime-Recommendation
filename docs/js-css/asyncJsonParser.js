JSON.parseAsync = async(text, byte=1024*1024) => {
  function isValidJson(j){
   let construct = j?.constructor.name
   try{return((construct==='Object'&&`${j}`==='[object Object]')||j instanceof Array||construct==='Array')}
   catch(e){return false}
 }
 return await new Promise((resolve)=>{
   let counter = 0;
   let keyN = 0;
   let ogStr = text;
   let parseStr = ogStr;
   let constructor = parseStr?.constructor.name??parseStr;
   let at = 0;
   let ch = ' ';
   let word = '';
   let yielding = '';
   function ParseError(_mes,_pos,_val,_cons) {
     let _ogStr = ogStr
     this.message = _mes;
     if(isNaN(_pos)){
       this.construct = _cons??constructor
     }
     this.value = _ogStr
     if(!isNaN(_pos)){
       this.position = _pos??0
       let rpos = Math.max(0,_pos-5)
       let strLen = Math.min(10,_ogStr.length)
       this.preview = _ogStr.substr(rpos,strLen)
       _char = _pos<_ogStr.length?_ogStr.charAt(_pos):'EOS'
       this.char = _char.match(/['"`]/gm)?` ${_char} `:_char
     }
   }
   if(isValidJson(ogStr)) {
     console.warn(new ParseError(`Data is already a valid JSON`))
     return ogStr
   } else if(!(typeof ogStr==='string'||ogStr instanceof String)){
     console.error(new ParseError('Unexpected Type'))
     return null
   } else if(typeof ogStr==='string'||ogStr instanceof String){
     if(!ogStr.match(/^\s*[\[\{]/gm)){
         console.error(new ParseError('Data is not a Valid JSON'))
         return null
     }
   }
   let position = () => {
     var pos = parseStr.length
     var fChar = parseStr.charAt(0)
     pos = ogStr.length - pos
     return Math.min(Math.max(pos,0),ogStr.length)
   }
   let seek = () => {
     ch = parseStr.charAt(at);
     at++;
     while (ch && ch <= ' ') {
       seek();
     }
     return ch;
   };
   let unseek = () => {
     ch = parseStr.charAt(--at);
   };
   let wordCheck = () => {
     word = '';
     do {
       word += ch;
       seek();
     } while (ch.match(/[a-z]/i));
     parseStr = parseStr.slice(at - 1);
     at = 0;
     return word;
   };
   let normalizeUnicodedString = (quote) => {
     let inQuotes = ' ';
     let tempIndex = at;
     let index = 0;
     let slash = 0;
     let c = quote;
     while (c) {
       index = parseStr.indexOf(quote, tempIndex + 1);
       tempIndex = index;
       ch = parseStr.charAt(tempIndex - 1);
       while (ch === '\\') {
         slash++;
         ch = parseStr.charAt(tempIndex - (slash + 1));
       }
       if (slash % 2 === 0) {
         inQuotes = parseStr.substring(at, index);
         parseStr = parseStr.slice(++index);
         slash = 0;
         break;
       } else
         slash = 0;
     }
     index = inQuotes.indexOf('\\');
     while (index >= 0) {
       let escapee = {
         quote: quote,
         '\'': '\'',
         '/': '/',
         '\\': '\\',
         b: '\b',
         f: '\f',
         n: '\n',
         r: '\r',
         t: '\t',
       };
       let hex = 0;
       let i = 0;
       let uffff = 0;
       at = index;
       ch = inQuotes.charAt(++at);
       if (ch === 'u') {
         uffff = 0;
         for (i = 0; i < 4; i += 1) {
           hex = parseInt(ch = inQuotes.charAt(++at), 16);
           if (!isFinite(hex)) {
             break;
           }
           uffff = uffff * 16 + hex;
         }
         inQuotes = inQuotes.slice(0, index) +
                  String.fromCharCode(uffff) + inQuotes.slice(index + 6);
         at = index;
       } else if (typeof escapee[ch] === 'string') {
         inQuotes = inQuotes.slice(0, index) +
                  escapee[ch] + inQuotes.slice(index + 2);
         at = index + 1;
       } else { break; }
       index = inQuotes.indexOf('\\', at);
     }
     at = 0;
     return inQuotes;
   };
   var isFirstChar = true
   var firstChar;
   function * parseYield() {
     let key = '';
     let returnObj = {};
     let returnArr = [];
     let v = '';
     let inQuotes = '';
     let num = 0;
     let numHolder = '';
     let _quote;
     let addup = () => {
       numHolder += ch;
       seek();
     };
     if(yielding instanceof ParseError){ 
       return yielding
     }
     if (typeof parseStr === 'number' || typeof parseStr === 'boolean' ||
       parseStr === null) {
       parseStr = '';
       return text;
     } else if (typeof parseStr === 'undefined') {
       parseStr = undefined;
       return text;
     } else if (parseStr.charAt(0) === '[' && parseStr.charAt(1) === ']'&&parseStr.length===2) {
       parseStr = '';
       return [];
     } else if (parseStr.charAt(0) === '{' && parseStr.charAt(1) === '}') {
       parseStr = '';
       return {};
     } else {
       if (++counter > byte) {
         counter = 0;
         yield;
       }
       if (keyN !== 1){
         if(yielding instanceof ParseError){ 
           return yielding
         }
         seek();
       }
       switch (ch) {
         case '{':
           isFirstChar = true
           if(yielding instanceof ParseError){
             return yielding
           }
           seek();
           if (ch === '}') {
             parseStr = parseStr.slice(at);
             at = 0;
             return returnObj
           } else if(isFirstChar&&!ch.match(/^\s*["'`]$/gm)) {
               parseStr = parseStr.slice(at-1)
               return(yielding = new ParseError("Expected property name or '}' in JSON",position()))
           }
           if(isFirstChar){ isFirstChar=false; }
           var first = true
           do {
             if(!ch.match(/^\s*["'`]$/gm)){ seek(); }
             if(first&&!ch.match(/^\s*["'`,]$/gm)) {
               first = false
               parseStr = parseStr.slice(at-1)
               return(yielding = new ParseError("Expected quoted property name in JSON",position()))
             }
             keyN = 1;
             key = yield *parseYield();
             if(yielding instanceof ParseError){ 
               return yielding
             }
             if(parseStr.charAt(0)!==':'){
               return(yielding = new ParseError("Expected ':' after property name in JSON",position()))
             }
             keyN = 0;
             seek();
             returnObj[key] = yield *parseYield();
             if(yielding instanceof ParseError){ 
               return yielding
             }
             seek();
             if (ch === '}') {
               parseStr = parseStr.slice(at);
               at = 0;
               return returnObj
             }
           } while (ch === ',');
           if(parseStr.length>0){
             return(yielding = new ParseError("Expected ',' or '}' after property value in JSON",position()))
           }
           return(yielding = new ParseError('Unmatched Brace',position()));
         case '[':
           if(yielding instanceof ParseError){ 
             return yielding
           }
           seek();
           if (ch === ']') {
             parseStr = parseStr.slice(at);
             at = 0;
             return returnArr
           }
           unseek();
           do {
             v = yield *parseYield();
             if(yielding instanceof ParseError){ 
               return yielding
           }
             seek();
             returnArr.push(v);
             if (ch === ']') {
               parseStr = parseStr.slice(at);
               at = 0;
               return returnArr
             }
           } while (ch === ',');
           return(yielding = new ParseError('Umatched Bracket',position()));
         case '"':
           _quote = '"'
           if(yielding instanceof ParseError){ 
             return yielding
           }
           parseStr = parseStr.slice(at - 1);
           at = 0;
           if (parseStr.charAt(0) === _quote && parseStr.charAt(1) === _quote) {
             parseStr = parseStr.slice(2);
             at = 0;
             return inQuotes;
           } else {
             seek();
             let strInQuotes = normalizeUnicodedString(_quote)
             if(strInQuotes===_quote){
               return(yielding = new ParseError('Unmatched Double Quote',position()));
             }
             return strInQuotes;
           }
         case "'":
           _quote = "'"
           if(yielding instanceof ParseError){ 
             return yielding
           }
           parseStr = parseStr.slice(at - 1);
           at = 0;
           if (parseStr.charAt(0) === _quote && parseStr.charAt(1) === _quote) {
             parseStr = parseStr.slice(2);
             at = 0;
             return inQuotes;
           } else {
             seek();
             let strInQuotes = normalizeUnicodedString(_quote)
             if(strInQuotes===_quote){
               return(yielding = new ParseError('Unmatched Single Quote',position()));
             }
             return strInQuotes;
           }
         case '`':
           _quote = "`"
           if(yielding instanceof ParseError){ 
             return yielding
           }
           parseStr = parseStr.slice(at - 1);
           at = 0;
           if (parseStr.charAt(0) === _quote && parseStr.charAt(1) === _quote) {
             parseStr = parseStr.slice(2);
             at = 0;
             return inQuotes;
           } else {
             seek();
             let strInQuotes = normalizeUnicodedString(_quote)
             if(strInQuotes===_quote){
               return(yielding = new ParseError('Unmatched Backtick',position()));
             }
             return strInQuotes;
           }
         case '0':
         case '1':
         case '2':
         case '3':
         case '4':
         case '5':
         case '6':
         case '7':
         case '8':
         case '9':
         case '-':
           if(yielding instanceof ParseError){
             return yielding
           }
           if(ch === '-'){addup();}
           do {
             addup();
             if (ch === '.' || ch === 'e' || ch === 'E' || ch === '-' || ch === '+' || (ch >= String.fromCharCode(65) && ch <= String.fromCharCode(70))){
               addup();
             }
           } while (ch === '-' || ch === '+' || (isFinite(ch) && ch !== ''));
           num = Number(numHolder);
           if(isNaN(num)) {
             if(parseStr.match(/^\s*[,:]/gm)){
               parseStr = parseStr.slice(1)
             }
             return(yielding = new ParseError('Invalid Number',position()));
           }
           parseStr = parseStr.slice(at-1);
           at = 0;
           return num;
         case 't':
           if(yielding instanceof ParseError){ return yielding
           }
           word = wordCheck();
           if (word === 'true'){
             return true;
           } else {
             if(parseStr.match(/^\s*[,:]/gm)){
                 parseStr = parseStr.slice(1)
             }
             return(yielding = new ParseError('Unexpected Token',position()));
           }
         case 'f':
           if(yielding instanceof ParseError){ 
             return yielding
           }
           word = wordCheck();
           if (word === 'false'){
             return false;
           } else {
             if(parseStr.match(/^\s*[,:]/gm)){
               parseStr = parseStr.slice(1)
             }
             return(yielding = new ParseError('Unexpected Token',position()));
           }
         case 'n':
           if(yielding instanceof ParseError){ 
             return yielding
           }
           word = wordCheck();
           if (word === 'null'){
             return null
           } else {
             if(parseStr.match(/^\s*[,:]/gm)){
               parseStr = parseStr.slice(1)
             }
             return(yielding = new ParseError('Unexpected Token',position()));
           }
         default:
           if(yielding instanceof ParseError){
             return yielding
           }
           if(parseStr.match(/^[,:]{1}/gm)){
             parseStr = parseStr.slice(1)
           }
           if(parseStr.match(/^[\[\{]{1}/gm)){
             parseStr = parseStr.slice(1)
           }
           return(yielding = new ParseError('Unexpected Token',position()));
       }
     }
   }
   function * yieldBridge(){
     if(yielding instanceof ParseError){
       return yielding
     }
     yielding = yield *parseYield()
   }
   let rs = yieldBridge();
   let gen = rs.next();
   let yieldCPU = () => {
     setTimeout(() => {
       gen = rs.next();
       if(gen && gen.done === true){
         if(isValidJson(yielding)&&(typeof parseStr==='string'||parseStr instanceof String)) {
           if(parseStr.length<=0){
             resolve(yielding);
           } else {
             console.error(new ParseError('Unexpected non-whitespace character after JSON',position()))
             resolve(null);
           }
         } else if(yielding instanceof ParseError) {
           console.error(yielding);
           resolve(null);
         } else if(typeof yielding==='string'||yielding instanceof String){
           console.error(new ParseError('Unexpected Type',null,yielding))
           resolve(null);
         } else {
           console.error(new ParseError('Unexpected Type',yielding,null,yielding?.constructor.name))
           resolve(null);
         }
       } else {
         yieldCPU()
       }
     },0);
   };
   return yieldCPU();
 });
};