self.onmessage = (message) => {
    self.postMessage({
        backupStr: JSON.stringify(message.data??{})
    })
}
