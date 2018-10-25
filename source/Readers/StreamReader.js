export default class StreamReader
{
    constructor() {}
    readFloat32() {}
    readFloat32Array(ar, length, offset) {}
    readFloat32ArrayOffset(ar, length, offset) {}
    readFloat64() {}
    isEOF() {}
    readInt8() {}
    readUint8() {}
    readUint8Length() {}
    readUint16() {}
    readUint16Array(ar, length) {}
    readUint16Length() {}
    readInt16() {}
    readUint32() {}
    readUint32Length() {}
    readInt32() {}
    byteArrayToString(bytes) {}
    readString() {}
    readRaw(to, length) {}
    
    readBool() {}
    readBlockType() {}
    readImage(isOOB, cb) {}

    readId(label) {}

    openArray(label) {}
    closeArray() {}
    openObject(label) {}
    closeObject() {}

    get containerType() { return "stream"; }
}
