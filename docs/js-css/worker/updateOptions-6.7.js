self.onmessage = (message) => {
    const savedFilterOptionsJson = []
    for(let key in message.data.allFilterInfo??{}){
        savedFilterOptionsJson.push({info: key})
    }
    self.postMessage({
        savedFilterOptionsJson: savedFilterOptionsJson
    })
}
