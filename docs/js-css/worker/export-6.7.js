self.onmessage = async(message) => {
    self.postMessage({
        backupStr: JSON.stringify(message.data??{})
    })
}
