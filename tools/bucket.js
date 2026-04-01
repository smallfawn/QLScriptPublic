module.exports = {
    getBucket,
    updateBucket
}
const fs = require('fs')
function getBucket(bucketName) {
    return fs.readFileSync(bucketName)
}

function updateBucket(bucketName, bucket) {
    return fs.writeFileSync(bucketName, bucket)
}

