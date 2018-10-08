import StreamReader from "./StreamReader.js";

export default class JSONReader extends StreamReader
{
	constructor(object)
	{
		super();
		this._readObject = object["container"];
		this._context = [this._readObject];
	}

    readProp(label)
    {
		const head = this._last;
		if(head.constructor === Object)
		{
			const prop = head[label];
			delete head[label];
			return prop;
		}
		else if(head.constructor === Array)
		{
			return head.shift();
		}
	}

	readFloat32(label)
	{
        return this.readProp(label);
	}
	
	// Reads the array into ar
	readFloat32Array(ar, label)
	{
		this.readArray(ar, label);
	}

	readFloat32ArrayOffset(ar, length, offset, label)
	{
		this.readFloat32Array(ar, label);
	}

	readArray(ar, label)
	{
		const array = this.readProp(label);
		for (let i = 0; i < ar.length; i++)
		{
			ar[i] = array[i];
		}
	}

	readFloat64(label)
	{
        return this.readProp(label);
    }

	readUint8(label)
	{
        return this.readProp(label);
	}

	readUint8Length()
	{
		return this._readLength();
	}

	isEOF()
	{
		return this._context.length <= 1 && Object.keys(this._readObject).length === 0;
	}

	readInt8(label)
	{
        return this.readProp(label);
    }

	readUint16(label)
	{
        return this.readProp(label);
    }

	readUint16Array(ar, label)
	{
		return this.readArray(ar, label);
	}

	readInt16(label)
	{
        return this.readProp(label);
	}

	readUint16Length()
	{
		return this._readLength();
	}

	readUint32(label)
	{
        return this.readProp(label);
    }

	// This implementation doesn't need this, as it would read a wrong value.
	// readUint32Length(label)
	// {
    //     return this.readProp(label);
    // }

	byteArrayToString(bytes)
	{
		let out = [],
			pos = 0,
			c = 0;
		while (pos < bytes.length)
		{
			let c1 = bytes[pos++];
			if (c1 < 128)
			{
				out[c++] = String.fromCharCode(c1);
			}
			else if (c1 > 191 && c1 < 224)
			{
				let c2 = bytes[pos++];
				out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
			}
			else if (c1 > 239 && c1 < 365)
			{
				// Surrogate Pair
				let c2 = bytes[pos++];
				let c3 = bytes[pos++];
				let c4 = bytes[pos++];
				let u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) -
					0x10000;
				out[c++] = String.fromCharCode(0xD800 + (u >> 10));
				out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
			}
			else
			{
				let c2 = bytes[pos++];
				let c3 = bytes[pos++];
				out[c++] =
					String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
			}
		}
		return out.join("");
	}

	readString(label)
	{
        return this.readProp(label);
	}
	
	readBool(label)
	{
		return this.readProp(label);
	}

	readRaw(obj, length, label)
	{
		const context = this._last;
		const next = this._peekNext();
		obj["container"] = next;
		// Remove the block from here.
		if(context.constructor === Object)
		{
			delete context[this._nextKey];
		}
		else if(context.constructor === Array)
		{
			context.shift();
		}
	}

	readBlockType(blockTypes)
	{
		const next = this._peekNext();
		let bType;
		if(next.constructor === Object)
		{
			const last = this._last;
			let nType;
			if(last.constructor === Object)
			{
				nType = this._nextKey;
			}
			else if(last.constructor === Array)
			{
				// Objects are serialized with "type" property.
				nType = next["type"];
			}
			bType = blockTypes[nType] || nType;
		}
		else if(next.constructor === Array)
		{
			// Arrays are serialized as "type": [Array].
			const nKey = this._nextKey;
			bType = blockTypes[nKey] || nKey;
		}
		return bType;
	}

	readImage(isOOB, cb)
	{
		const image = this.readString();
		if(isOOB)
		{
			const req = new XMLHttpRequest();
			req.open("GET", image, true);
			req.responseType = "blob";

			req.onload = function()
			{
				const blob = this.response;
				cb(blob);
			};
			req.send();
		}
		else
		{
			cb(image);
		}
	}

	readId(label)
	{
		const val = this.readUint16(label);
		return val !== undefined ? val+1 : 0;
	}

	openArray(label)
	{
		const array = this.readProp(label);
		this._context.unshift(array);
	}

	closeArray()
	{
		this._context.shift();
	}

	openObject(label)
	{
		const o = this.readProp(label);
		this._context.unshift(o);
	}

	closeObject()
	{
		this._context.shift();
	}

	get containerType()
	{
		return "json";
	}

	_peekNext()
	{
		const stream = this._last;
		let next;
		if(stream.constructor === Object)
		{
			next = stream[this._nextKey];
		}
		else if(stream.constructor === Array)
		{
			next = stream[0];
		}
		return next;
	}

	get _nextKey()
	{
		return Object.keys(this._last)[0];
	}

	_readLength()
	{
		const context = this._last;
		if(context.constructor === Array)
		{
			return context.length;
		}
		else if(context.constructor === Object)
		{
			return Object.keys(context).length;
		}
	}

	get _last()
	{
		return this._context[0];
	}
}