import StreamReader from "./StreamReader.js";

export default class BinaryReader extends StreamReader
{
	constructor(uint8Array)
	{
		super();
		this.isBigEndian = function()
		{
			const b = new ArrayBuffer(4);
			const a = new Uint32Array(b);
			const c = new Uint8Array(b);
			a[0] = 0xdeadbeef;
			return c[0] == 0xde;
		}();

		this.raw = uint8Array;
		this.dataView = new DataView(uint8Array.buffer);
		this.readIndex = 0;
	}

	readFloat32()
	{
		const v = this.dataView.getFloat32(this.readIndex, !this.isBigEndian);
		this.readIndex += 4;
		return v;
	}

	readFloat32ArrayOffset(ar, length, offset)
	{
		if(!offset)
		{
			offset = 0;
		}
		if (!length)
		{
			length = ar.length;
		}
		let end = offset + length;
		for (let i = offset; i < end; i++)
		{
			ar[i] = this.dataView.getFloat32(this.readIndex, !this.isBigEndian);
			this.readIndex += 4;
		}
		return ar;
	}

		
	readFloat32Array(ar)
	{
		for (let i = 0; i < ar.length; i++)
		{
			ar[i] = this.dataView.getFloat32(this.readIndex, !this.isBigEndian);
			this.readIndex += 4;
		}
		return ar;
	}

	readFloat64()
	{
		const v = this.dataView.getFloat64(this.readIndex, !this.isBigEndian);
		this.readIndex += 8;
		return v;
	}

	readUint8()
	{
		return this.raw[this.readIndex++];
	}

	isEOF()
	{
		return this.readIndex >= this.raw.length;
	}

	readInt8()
	{
		const v = this.dataView.getInt8(this.readIndex);
		this.readIndex += 1;
		return v;
	}

	readUint16()
	{
		const v = this.dataView.getUint16(this.readIndex, !this.isBigEndian);
		this.readIndex += 2;
		return v;
	}

	readUint16Array(ar)
	{
		const {length} = ar;
		for (let i = 0; i < length; i++)
		{
			ar[i] = this.dataView.getUint16(this.readIndex, !this.isBigEndian);
			this.readIndex += 2;
		}
		return ar;
	}

	readInt16()
	{
		const v = this.dataView.getInt16(this.readIndex, !this.isBigEndian);
		this.readIndex += 2;
		return v;
	}

	readUint32()
	{
		const v = this.dataView.getUint32(this.readIndex, !this.isBigEndian);
		this.readIndex += 4;
		return v;
	}

	readInt32()
	{
		const v = this.dataView.getInt32(this.readIndex, !this.isBigEndian);
		this.readIndex += 4;
		return v;
	}

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

	readString()
	{
		const length = this.readUint32();
		const ua = new Uint8Array(length);
		for (let i = 0; i < length; i++)
		{
			ua[i] = this.raw[this.readIndex++];
		}
		return this.byteArrayToString(ua);
	}

	readRaw(to, length)
	{
		for (let i = 0; i < length; i++)
		{
			to[i] = this.raw[this.readIndex++];
		}
	}

	readBool()
	{
		return this.readUint8() === 1;
	}

	readBlockType() 
	{
		return this.readUint8();
	}

	readImage(isOOB, cb)
	{
		if(isOOB)
		{
			const image = this.readString();
			const req = new XMLHttpRequest();
			req.open("GET", image, true);
			req.responseType = "arraybuffer";

			req.onload = function()
			{
				cb(this.response);
			};
			req.send();
		}
		else
		{
			const size = this.readUint32();
			const atlasData = new Uint8Array(size);
			this.readRaw(atlasData, atlasData.length);

			cb(atlasData);
		}
	}
	
	readId(label)
	{
		return this.readUint16();
	}
	
	readUint8Length() 
	{
		return this.readUint8();
	}

	readUint16Length()
	{
		return this.readUint16();
	}

	readUint32Length()
	{
		return this.readUint32();
	}

	get containerType() { return "bin"; }
}

BinaryReader.alignment = 1024;