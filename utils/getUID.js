const uuid = require('uuid');

const getUID = () => {
    const uid = uuid.v4();
    return uid.toString();
};

module.exports = getUID;