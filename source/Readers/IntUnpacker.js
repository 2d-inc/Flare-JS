/// Unpacks known variable length integers from a buffer.
export default class IntUnpacker
{
	constructor(buffer)
	{
		this._Buffer = buffer;
		this._ConsumedBits = 0;
	}

	read(bits)
	{
		let { _ConsumedBits, _Buffer } = this;
		let byteIndex = Math.floor(_ConsumedBits / 8);
		let bitIndex = _ConsumedBits % 8;

		let v = 0;
		while (bits > 0)
		{
			let maskBits = Math.min(bits, 8 - bitIndex);
			
			let mask = ~-(1 << maskBits);

			v |= (_Buffer[byteIndex] >> bitIndex) & mask;
			v <<= bits - maskBits;
			byteIndex++;
			bitIndex = 0;
			bits -= maskBits;
			this._ConsumedBits += maskBits;
		}

		return v;
	}
}