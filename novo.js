const getViewerIdFromHTMLSourceCode = sourceCode => {
    if (!sourceCode) return null
    const splited = sourceCode.split('drive-viewer/')
    if (splited.length < 2) return null
    const viewerId = splited[1].split('\\')[0]
    return viewerId
}

const getViewIdFromImageIdGoogleDrive = async photo_id => {
    try {
        const fetch = await axios.get(`https://drive.google.com/file/d/${photo_id}/view`)
        const viewid = getViewerIdFromHTMLSourceCode(fetch.data)
        return viewid
    } catch (err) {
        return null;
    }
}