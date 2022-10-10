self.onmessage = async(message) => {
    const data = message.data
    self.postMessage({
        anchor: `
            <a style="display:none;" 
                href="${"data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.exportObj))}"
                download="${data.exportName+'.json'}"
            </a>
         `
    })
}