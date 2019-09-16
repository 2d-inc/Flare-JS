import IntUnpacker from "./Readers/IntUnpacker.js";
import GlyphCommands from "./GlyphCommands.js";
const { Move: GlyphCommandMove, Line: GlyphCommandLine, Cubic: GlyphCommandCubic, Quadratic: GlyphCommandQuadratic, Close: GlyphCommandClose } = GlyphCommands;

export class Glyph
{
	constructor()
	{
		this._Unicode = 0;
		this._AdvanceWidth = 0;
        this._Paths = [];
        this.path = null;
	}

    get unicode() { return this._Unicode; }
    get advanceX() { return this._AdvanceWidth; }
    get paths() { return this._Paths; }

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

			const paths = [];
			let points = [];
			const pen = { x: 0, y: 0 };

			for (let j = 0; j < commandCount; j++)
			{
				const commandId = commandBuffer.read(3);


				switch (commandId)
				{
					case GlyphCommandMove:
					{
						if (points.length)
						{
							paths.push({ closed: false, points: points });
							points = [];
						}

						pen.x = reader.decodeNumber();
						pen.y = reader.decodeNumber();
						points.push({ x: pen.x, y: pen.y });
						break;
					}

					case GlyphCommandLine:
					{
						pen.x = reader.decodeNumber();
						pen.y = reader.decodeNumber();
						points.push({ x: pen.x, y: pen.y });
						break;
					}
					case GlyphCommandCubic:
					{
						pen.x = reader.decodeNumber();
						pen.y = reader.decodeNumber();
						const prevOutX = reader.decodeNumber();
						const prevOutY = reader.decodeNumber();
						const inX = reader.decodeNumber();
						const inY = reader.decodeNumber();

						points.push({ x: pen.x, y: pen.y, prevOut: { x: prevOutX, y: prevOutY }, in: { x: inX, y: inY } });
						break;
					}
					case GlyphCommandQuadratic:
					{
						pen.x = reader.decodeNumber();
						pen.y = reader.decodeNumber();
						const prevOutX = reader.decodeNumber();
						const prevOutY = reader.decodeNumber();
						points.push({ x: pen.x, y: pen.y, prevOut: { x: prevOutX, y: prevOutY } });
						break;
					}
					case GlyphCommandClose:
					{
						paths.push({ closed: true, points: points });
						points = [];
						break;
					}
					default:
						continue;
				}
			}
			if (points.length)
			{
				paths.push({ closed: false, points: points });
			}

            this._Paths = paths;
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
		this._Glyphs = new Map();
		this._GraphicsGlyphs = new Map();
	}

	get id()
	{
		return this._Id;
	}

	scale(size)
	{
		return 1.0 / this._UnitsPerEm * size;
	}

	getGlyph(code)
	{
		return this._Glyphs.get(code);
    }
    
    getGraphicsGlyph(graphics, code)
    {
        const { _GraphicsGlyphs } = this;
        const cached = _GraphicsGlyphs.get(code);
        if (cached !== undefined)
        {
            return cached;
        }

        const glyph = this.getGlyph(code);
        if (!glyph)
        {
            _GraphicsGlyphs.set(code, null);
            return null;
        }

        const { paths } = glyph;

        _GraphicsGlyphs.set(code, glyph);

        if (graphics)
        {
            const rootPath = graphics.makePath();
            glyph.path = rootPath;

            for (const path of paths)
            {
                const { points, closed } = path;
                if (!points.length) { continue; }
                let firstPoint = points[0];
                const subPath = graphics.makePath();
                subPath.moveTo(firstPoint.x, -firstPoint.y);
                for (let i = 0, l = closed ? points.length : points.length - 1, pl = points.length; i < l; i++)
                {
                    let point = points[i];
                    let nextPoint = points[(i + 1) % pl];
                    let cin = nextPoint.in || null;
                    let cout = nextPoint.prevOut || null;
                    if (cin === null && cout === null)
                    {
                        subPath.lineTo(nextPoint.x, -nextPoint.y);
                    }
                    else if (cin === null)
                    {
                        subPath.quadTo(
                            cout.x, -cout.y,

                            nextPoint.x, -nextPoint.y);
                    }
                    else
                    {
                        subPath.cubicTo(
                            cout.x, -cout.y,

                            cin.x, -cin.y,

                            nextPoint.x, -nextPoint.y);
                    }
                }
                if (closed)
                {
                    subPath.close();
                }

                rootPath.addPath(subPath, [1, 0, 0, 0, 1, 0]);
            }
        }
        return glyph;
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
					this._Glyphs.set(glyph.unicode, glyph);
				}
			}
		}
		reader.closeArray();

		return true;
	}
}