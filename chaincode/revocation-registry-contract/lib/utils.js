'use strict';


class ContractUtils {
    static bufferToObj(buffer) {
        if (!buffer || buffer.length === 0) {
            throw new Error('State does not exist');
        }
        return JSON.parse(buffer.toString());
    }
    static objToBuffer(obj) {
        return Buffer.from(JSON.stringify(obj));
    }
}

module.exports = ContractUtils;