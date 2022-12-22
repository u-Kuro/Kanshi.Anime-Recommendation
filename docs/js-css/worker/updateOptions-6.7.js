self.onmessage = (message) => {
    const savedFilterOptionsJson = []
    const allFilterInfo = message.data.allFilterInfo??{}
    for(let key in allFilterInfo){
        savedFilterOptionsJson.push({info: key})
    }
    self.postMessage({
        savedFilterOptionsJson: savedFilterOptionsJson
    })
}
