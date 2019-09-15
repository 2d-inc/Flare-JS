import IntUnpacker from "./Readers/IntUnpacker.js";
import GlyphCommands from "./GlyphCommands.js";
const { Move: GlyphCommandMove, Line: GlyphCommandLine, Cubic: GlyphCommandCubic, Quadratic: GlyphCommandQuadratic, Close: GlyphCommandClose } = GlyphCommands;

export class Glyph
{
	constructor()
	{
		this._Unicode = 0;
		this._AdvanceWidth = 0;
		this._Commands = [];
	}

	read(reader)
	{
		this._Unicode = reader.decodeNumber();
		this._AdvanceWidth = reader.decodeNumber();
		
		const commandCount = reader.decodeNumber();
		if (commandCount !== 0)
		{
			const commandBufferByteCount = Math.ceil((commandCount * 3) / 8);
			const buffer = new Uint8Array(commandBufferByteCount);
			reader.readRaw(buffer, commandBufferByteCount);
			const commandBuffer = new IntUnpacker(buffer);
			const commands = new Array(commandCount);

			for (let j = 0; j < commandCount; j++)
			{
				const commandId = commandBuffer.read(3);

				const command = {
					type: commandId,
				};

				switch (commandId)
				{
					case GlyphCommandMove:
					case GlyphCommandLine:
						command.x = reader.decodeNumber();
						command.y = reader.decodeNumber();
						break;
					case GlyphCommandCubic:
						command.x = reader.decodeNumber();
						command.y = reader.decodeNumber();
						command.x1 = reader.decodeNumber();
						command.y1 = reader.decodeNumber();
						command.x2 = reader.decodeNumber();
						command.y2 = reader.decodeNumber();
						break;
					case GlyphCommandQuadratic:
						command.x = reader.decodeNumber();
						command.y = reader.decodeNumber();
						command.x1 = reader.decodeNumber();
						command.y1 = reader.decodeNumber();
						break;
					case GlyphCommandClose:
						break;
					default:
						continue;
				}
				commands[j] = command;
            }
            
            this._Commands = commands;
        }
        
        return true;
	}
}

export class Font
{
	constructor()
	{
        this._Id = -1;
		this._Family = null;
		this._SubFamily = null;
		this._UnitsPerEm = 0;
		this._Ascender = 0;
		this._Descender = 0;
		this._Glyphs = [];
    }
    
    get id()
    {
        return this._Id;
    }

	read(reader)
	{
        this._Id = reader.decodeNumber();
		this._Family = reader.readString("family");
		this._SubFamily = reader.readString("subFamily");
		this._UnitsPerEm = reader.decodeNumber();
		this._Ascender = reader.decodeNumber();
		this._Descender = reader.decodeNumber();

		reader.openArray("glyphs");
		const glyphsCount = reader.decodeNumber();
		console.log("FAMIL", this._Family, this._SubFamily, this._UnitsPerEm, this._Ascender, this._Descender, glyphsCount);
		if (glyphsCount)
		{
			for (let i = 0; i < glyphsCount; i++)
			{
				const glyph = new Glyph();
				if (glyph.read(reader))
				{
					this._Glyphs.push(glyph);
				}
			}
		}
        reader.closeArray();
        
        return true;
	}
}