export default class BinaryReader
{
	constructor(uint8Array)
	{
		this.isBigEndian = function()
		{
			var b = new ArrayBuffer(4);
			var a = new Uint32Array(b);
			var c = new Uint8Array(b);
			a[0] = 0xdeadbeef;
			return c[0] == 0xde;
		}();

		this.raw = uint8Array;
		this.dataView = new DataView(uint8Array.buffer);
		this.readIndex = 0;
	}

	readFloat32()
	{
		var v = this.dataView.getFloat32(this.readIndex, !this.isBigEndian);
		this.readIndex += 4;
		return v;
	}

	readFloat32Array(ar, length, offset)
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

	readFloat64()
	{
		var v = this.dataView.getFloat64(this.readIndex, !this.isBigEndian);
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
		var v = this.dataView.getInt8(this.readIndex);
		this.readIndex += 1;
		return v;
	}

	readUint16()
	{
		var v = this.dataView.getUint16(this.readIndex, !this.isBigEndian);
		this.readIndex += 2;
		return v;
	}

	readUint16Array(ar, length)
	{
		if (!length)
		{
			length = ar.length;
		}
		for (var i = 0; i < length; i++)
		{
			ar[i] = this.dataView.getUint16(this.readIndex, !this.isBigEndian);
			this.readIndex += 2;
		}
		return ar;
	}

	readInt16()
	{
		var v = this.dataView.getInt16(this.readIndex, !this.isBigEndian);
		this.readIndex += 2;
		return v;
	}

	readUint32()
	{
		var v = this.dataView.getUint32(this.readIndex, !this.isBigEndian);
		this.readIndex += 4;
		return v;
	}

	readInt32()
	{
		var v = this.dataView.getInt32(this.readIndex, !this.isBigEndian);
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
		var length = this.readUint32();
		var ua = new Uint8Array(length);
		for (var i = 0; i < length; i++)
		{
			ua[i] = this.raw[this.readIndex++];
		}
		return this.byteArrayToString(ua);
	}

	readRaw(to, length)
	{
		for (var i = 0; i < length; i++)
		{
			to[i] = this.raw[this.readIndex++];
		}
	}
}

BinaryReader.alignment = 1024;