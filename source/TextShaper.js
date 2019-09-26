import TextAlign from "./TextAlign.js";
import TextOverflow from "./TextOverflow.js";
import { vec2 } from "gl-matrix";

const Return = 10;
const Space = 32;
const Tab = 9;
const MinTextBoxSize = 10;

function isWhiteSpace(t)
{
	switch (t)
	{
		case Space:
		case Tab:
			return true;
		default:
			return false;
	}
}

export default class TextShaper
{
	constructor()
	{
		this._Lines = new Uint16Array([]);
		this._LinesSizes = new Float32Array([]);
		this._Align = TextAlign.Left;
		this._Overflow = TextOverflow.Clip;
		this._MaxSize = 0;
		this._MaxLines = 0;
		this._LineHeight = 0;
		this._NoOrphans = false;
		this._IsLayoutDirty = true;
		this._IsEllipsisVisible = false;
		this._Size = [0, 0];
		this._IsPathDirty = false;
		this._ClipPath = null;
	}

	get align() { return this._Align; }
	set align(value)
	{
		if (value !== this._Align)
		{
			this._Align = value;
			this._IsPathDirty = true;

			//this._IsLayoutDirty = true;
		}
	}

	get overflow() { return this._Overflow; }
	set overflow(value)
	{
		if (value !== this._Overflow)
		{
			this._Overflow = value;
			this._IsLayoutDirty = true;
		}
	}

	get maxSize() { return this._MaxSize; }
	set maxSize(value)
	{
		if (value !== this._MaxSize)
		{
			this._MaxSize = value;
			this._IsLayoutDirty = true;
		}
	}

	get maxLines() { return this._MaxLines; }
	set maxLines(value)
	{
		if (value !== this._MaxLines)
		{
			this._MaxLines = value;
			this._IsLayoutDirty = true;
		}
	}

	get lines() { return this._Lines; }
	get lineSizes() { return this._LinesSizes; }
	get lineHeight() { return this._LineHeight; }
	set lineHeight(value)
	{
		if (value !== this._LineHeight)
		{
			this._LineHeight = value;
			//this._IsLayoutDirty = true;
		}
	}

	get noOrphans() { return this._NoOrphans; }
	set noOrphans(value)
	{
		if (value !== this._NoOrphans)
		{
			this._NoOrphans = value;
			this._IsLayoutDirty = true;
		}
	}

	get isLayoutDirty() { return this._IsLayoutDirty; }
	set isLayoutDirty(value)
	{
		this._IsLayoutDirty = value;
	}

	get isPathDirty() { return this._IsPathDirty; }

	get clipPath() { return this._ClipPath; }

	layout(text, styles, styling)
	{
		if (!this._IsLayoutDirty)
		{
			return true;
		}
		if (styles.length === 0)
		{
			return false;
		}
		const lines = [];
		const linesSizes = [];

		const { _Overflow: overflow, _MaxSize: maxSize, _NoOrphans: noOrphans, _MaxLines } = this;

		const maxWidth = maxSize ? maxSize : Number.MAX_VALUE;
		const useEllipsis = overflow === TextOverflow.Ellipsis;
		const maxLines = _MaxLines || Number.MAX_SAFE_INTEGER;
		this._IsEllipsisVisible = false;

		let stylingIndex = 1;
		let nextStyleChangeIndex = 0;
		let lastStyleChangeIndex = 0;
		let lastStylingIndex = 1;
		// Defaults
		let currentStyle = styles[0];
		let font = currentStyle.font;
		let scale = font.scale(currentStyle.fontSize);
		let lastFont = null;
		let lastScale = scale;
		const stylingLength = styling.length;
		let currentWordIndex = null;
		let lastWordEnd = null;
		let currentWordLineWidth = 0;
		let wordStyleChangeIndex = 0;
		let wordStylingIndex = 1;
		let wordFont = null;
		let wordScale = 1;

		// Last found word 
		let lastWordIndex = null;
		let lastWordLineWidth = 0;
		let secondLastWordLineWidth = 0;
		//let lastWordLine
		// Previous word index
		let prevWordIndex = null;

		let start = 0;
		let x = 0,
			y = 0,
			width = 0;

		let c = 0;
		let lineWordCount = 0;
		let previousLineWordCount = 0;
		let lastLineWrapped = false;
		let line = 1;
		let wordSize = 0;
		let lastWordSize = 0;
		let prevLastWordSize = 0;
		text_layout:
			for (let l = text.length; c < l; c++)
			{
				while (c >= nextStyleChangeIndex)
				{
					currentStyle = styles[styling[stylingIndex]];
					if (!currentStyle)
					{
						console.warn("Missing style for index", styling[stylingIndex]);
						return false;
					}
					lastFont = font;
					lastScale = scale;
					font = currentStyle.font;
					scale = font.scale(currentStyle.fontSize);

					lastStyleChangeIndex = nextStyleChangeIndex;
					lastStylingIndex = stylingIndex;
					// get next style index
					if (stylingIndex + 1 < stylingLength)
					{
						nextStyleChangeIndex = styling[stylingIndex + 1];
					}
					else
					{
						nextStyleChangeIndex = Number.MAX_SAFE_INTEGER;
					}
					stylingIndex += 2;
				}
				const code = text.codePointAt(c);
				switch (code)
				{
					case Return:
						if (
							// we want to remove orphans
							noOrphans &&

							// the last line wrapped due to overflow (not a carriage return)
							lastLineWrapped &&

							// this line has only one word
							lineWordCount === 1 &&

							// the previous line has more than 2 words
							previousLineWordCount > 2)
						{
							// makes previous line wrap at prev word.
							lines[lines.length - 1] = prevWordIndex;

							// update previous width
							let ow = linesSizes[linesSizes.length - 1];
							linesSizes[linesSizes.length - 1] = secondLastWordLineWidth;
							width += ow - secondLastWordLineWidth;
							start = prevWordIndex;
						}

						lines.push(start);
						lines.push(c);
						linesSizes.push(width);

						width = 0;
						// Skip this character.
						start = c + 1;

						// On the max line? go no further
						if (line === maxLines)
						{
							if (useEllipsis)
							{
								const glyph = font.getGlyph(46);
								if (glyph)
								{
									const { advanceX } = glyph;
									const ellipsisWidth = advanceX * 3 * scale;
									let w = linesSizes[linesSizes.length - 1];
									let ec = lines[lines.length - 1];
									let estart = lines[lines.length - 2];
									let rm = 0;
									while (ec >= estart)
									{
										const codePoint = text.codePointAt(ec--);
										if (!isWhiteSpace(codePoint) && maxWidth - w >= ellipsisWidth)
										{
											break;
										}
										const glyph = font.getGlyph(text.codePointAt(ec--));
										if (!glyph)
										{
											continue;
										}

										const { advanceX } = glyph;
										w -= advanceX * scale;
										rm++;
									}
									lines[lines.length - 1] = Math.max(lines[lines.length - 2], lines[lines.length - 1] - rm);
									linesSizes[linesSizes.length - 1] = w + ellipsisWidth;
									this._IsEllipsisVisible = true;
								}
							}
							break text_layout;
						}
						line++;

						lastLineWrapped = false;
						previousLineWordCount = lineWordCount;
						lineWordCount = 0;
						continue;
					case Space:
					case Tab:
						if (currentWordIndex !== null)
						{
							prevLastWordSize = lastWordSize;
							lastWordSize = wordSize;
							lastWordIndex = currentWordIndex;
							secondLastWordLineWidth = lastWordLineWidth;
							lastWordLineWidth = width;
							lastWordEnd = c;
						}
						currentWordIndex = null;
						wordSize = 0;
						break;
					default:
						if (currentWordIndex === null)
						{
							prevWordIndex = lastWordIndex;
							lineWordCount++;

							currentWordIndex = c;
							currentWordLineWidth = lastWordLineWidth;
							wordStyleChangeIndex = nextStyleChangeIndex;
							wordStylingIndex = stylingIndex;
							wordFont = font;
							wordScale = scale;
						}
						break;
				}
				const glyph = font.getGlyph(code);
				if (!glyph)
				{
					continue;
				}

				const { advanceX } = glyph;
				let glyphSize = advanceX * scale;
				if (currentWordIndex !== null)
				{
					wordSize += glyphSize;
				}
				let nextWidth = width + glyphSize;

				if (nextWidth <= maxWidth || c <= start)
				{
					width = nextWidth;
				}
				// wrap the whole word if the line goes further than our max width and we're not at our maxline
				else if (line !== maxLines && lastWordEnd != null && lastWordEnd > start)
				{
					// wrap it.
					lines.push(start);
					lines.push(lastWordEnd);
					let nextCharIndex = lastWordEnd;
					if (nextCharIndex !== null)
					{
						while (isWhiteSpace(text.codePointAt(nextCharIndex)))
						{
							nextCharIndex++;
						}
					}
					line++;
					linesSizes.push(currentWordLineWidth);
					width = 0;

					const wordIndex = currentWordIndex || nextCharIndex || lastWordIndex;
					start = wordIndex;
					// reprocess same character
					c = wordIndex - 1;
					// reset to previous styling
					nextStyleChangeIndex = wordStyleChangeIndex;
					stylingIndex = wordStylingIndex;
					font = wordFont;
					scale = wordScale;
					lastLineWrapped = true;
					// One word falls to next line.
					previousLineWordCount = lineWordCount - 1;
					// This is 1 because we are wrapping word.
					lineWordCount = 1;
				}
				// wrap the character if the line goes further than our max width
				else // if (c > start)
				{
					// wrap it.
					lines.push(start);
					lines.push(c);
					linesSizes.push(width);
					width = 0;

					start = c;
					// reprocess same character
					c--;

					// On the max line? go no further
					if (line === maxLines)
					{
						if (useEllipsis)
						{
							const glyph = font.getGlyph(46);
							if (glyph)
							{
								const { advanceX } = glyph;
								const ellipsisWidth = advanceX * 3 * scale;
								let w = linesSizes[linesSizes.length - 1];
								let ec = lines[lines.length - 1];
								let estart = lines[lines.length - 2];
								let rm = 0;

								while (ec >= estart)
								{
									const codePoint = text.codePointAt(ec--);
									if (!isWhiteSpace(codePoint) && maxWidth - w >= ellipsisWidth)
									{
										break;
									}
									const glyph = font.getGlyph(codePoint);
									if (!glyph)
									{
										continue;
									}

									const { advanceX } = glyph;
									w -= advanceX * scale;
									rm++;
								}

								lines[lines.length - 1] = Math.max(lines[lines.length - 2], lines[lines.length - 1] - rm);
								linesSizes[linesSizes.length - 1] = w + ellipsisWidth;
								this._IsEllipsisVisible = true;
							}
						}
						else
						{
							// Want to clip the last char, so add it in
							lines[lines.length - 1] = lines[lines.length - 1] + 1;
						}
						break;
					}
					line++;
					// reset to previous styling
					nextStyleChangeIndex = lastStyleChangeIndex;
					stylingIndex = lastStylingIndex;
					font = lastFont;
					scale = lastScale;
					lastLineWrapped = true;
					previousLineWordCount = lineWordCount;
					// 1 if we're wrapping a word (have a current word index).
					lineWordCount = /*isWhiteSpace(code)*/ currentWordIndex === null ? 0 : 1;
				}
			}

		// push final line
		if (c >= start)
		{
			if (
				// we want to remove orphans
				noOrphans &&

				// the last line wrapped due to overflow (not a carriage return)
				lastLineWrapped &&

				// this line has only one word
				lineWordCount === 1 &&

				// the previous line has more than 2 words
				previousLineWordCount > 2)
			{
				// makes previous line wrap at prev word.
				lines[lines.length - 1] = prevWordIndex;

				// update previous width
				let ow = linesSizes[linesSizes.length - 1];
				linesSizes[linesSizes.length - 1] = secondLastWordLineWidth;
				width += lastWordSize; // ow - secondLastWordLineWidth;
				start = prevWordIndex;
			}
			lines.push(start);
			lines.push(c);
			linesSizes.push(width);
		}

		this._Lines = new Uint16Array(lines);
		// Measure does this more accurately.
		// this._LineSizes = new Float32Array(linesSizes);
		this._IsLayoutDirty = false;

		this.measure(text, styles, styling);
		this._Size = this.computeSize(styles);
		this._IsPathDirty = true;

		return true;
	}

	// refine measurement based on lines
	measure(text, styles, styling)
	{
		if (styles.length === 0)
		{
			return;
		}

		const { _IsEllipsisVisible, _Lines } = this;
		let sizes = [];

		let stylingIndex = 1;
		let nextStyleChangeIndex = 0;

		// Defaults
		let currentStyle = styles[0];
		let font = currentStyle.font;
		let scale = font.scale(currentStyle.fontSize);

		const stylingLength = styling.length;

		for (let i = 0, l = 0, lc = _Lines.length; i < lc; i += 2, l++)
		{
			let size = 0;
			// Iterate columns in lines.
			for (let c = _Lines[i], e = _Lines[i + 1]; c != e; c++)
			{
				while (c >= nextStyleChangeIndex)
				{
					currentStyle = styles[styling[stylingIndex]];
					if (!currentStyle)
					{
						console.warn("Missing style for index", styling[stylingIndex]);
						return false;
					}
					font = currentStyle.font;

					scale = font.scale(currentStyle.fontSize);

					// get next style index
					if (stylingIndex + 1 < stylingLength)
					{
						nextStyleChangeIndex = styling[stylingIndex + 1];
					}
					else
					{
						nextStyleChangeIndex = Number.MAX_SAFE_INTEGER;
					}
					stylingIndex += 2;
				}
				const code = text.codePointAt(c);
				const glyph = font.getGlyph(code);
				if (!glyph)
				{
					continue;
				}
				const { advanceX } = glyph;
				size += advanceX * scale;
			}
			sizes.push(size);
		}

		if (_IsEllipsisVisible)
		{
			const glyph = font.getGlyph(46);
			if (glyph)
			{
				const { advanceX } = glyph;
				sizes[sizes.length - 1] += advanceX * scale * 3;
			}
		}

		this._LineSizes = new Float32Array(sizes);
	}

	getRenderLineHeight(styles)
	{
		const { _LineHeight } = this;
		if (!_LineHeight)
		{
			return styles.reduce((max, style) => Math.max(max, style.fontSize), 0);
		}
		return _LineHeight;
	}

	// Get dimensions of text area
	computeSize(styles)
	{
		let maxDescender = 0;
		// Ensure all styles are ready.
		for (const style of styles)
		{
			const { font } = style;
			const descender = font.descender * font.scale(style.fontSize);
			if (descender > maxDescender)
			{
				maxDescender = descender;
			}
		}

		const { _Lines, _LineSizes, _MaxSize: maxSize } = this;
		const renderLineHeight = this.getRenderLineHeight(styles);

		// compute max width from line linesSizes
		const maxWidth = Math.min(maxSize ? maxSize : Number.MAX_VALUE,
			_LineSizes.reduce(function(a, b)
			{
				return Math.max(a, b);
			}));

		// compute height from line height * line count + max descender
		return [Math.max(MinTextBoxSize, maxWidth), renderLineHeight * _Lines.length / 2 + maxDescender];
	}

	updatePaths(graphics, text, styles, styling)
	{
		if (!this._IsPathDirty)
		{
			return false;
		}

		// Make sure all styles are ready, and rewind individual paths.
		for (const style of styles)
		{
			if (!style.renderPath)
			{
				style.renderPath = graphics.makePath();
			}
			else
			{
				style.renderPath.rewind();
			}
		}

		const { _IsEllipsisVisible, _Lines, _LineSizes, _Align } = this;
		const renderLineHeight = this.getRenderLineHeight(styles);
		let x = 0,
			y = 0;
		let stylingIndex = 1;
		let nextStyleChangeIndex = 0;
		// Defaults
		let currentStyle = styles[0];
		let font = currentStyle.font;
		let scale = font.scale(currentStyle.fontSize);
		const transform = [scale, 0, 0, 0, scale, 0];

		let renderPath = currentStyle.renderPath;

		const stylingLength = styling.length;

		for (let i = 0, l = 0, lc = _Lines.length; i < lc; i += 2, l++)
		{
			y = l * renderLineHeight;
			switch (_Align)
			{
				case TextAlign.Right:
					//x = size[0] - _LineSizes[l];
					x = -_LineSizes[l];
					break;
				case TextAlign.Center:
					//x = Math.round(size[0] / 2.0 - _LineSizes[l] / 2.0);
					x = Math.round(-_LineSizes[l] / 2.0);
					break;
				default:
					x = 0;
					break;
			}

			// Iterate columns in lines.
			for (let c = _Lines[i], e = _Lines[i + 1]; c != e; c++)
			{
				while (c >= nextStyleChangeIndex)
				{
					currentStyle = styles[styling[stylingIndex]];
					if (!currentStyle)
					{
						console.warn("Missing style for index", styling[stylingIndex]);
						return false;
					}
					font = currentStyle.font;
					renderPath = currentStyle.renderPath;

					scale = font.scale(currentStyle.fontSize);
					transform[0] = scale;
					transform[4] = scale;

					// get next style index
					if (stylingIndex + 1 < stylingLength)
					{
						nextStyleChangeIndex = styling[stylingIndex + 1];
					}
					else
					{
						nextStyleChangeIndex = Number.MAX_SAFE_INTEGER;
					}
					stylingIndex += 2;
				}
				const code = text.codePointAt(c);
				const glyph = font.getGraphicsGlyph(graphics, code);
				if (!glyph)
				{
					continue;
				}

				const { path, advanceX } = glyph;

				if (path)
				{
					transform[2] = x;
					transform[5] = y;
					renderPath.addPath(path, transform);
				}

				x += advanceX * scale;
			}
		}

		if (_IsEllipsisVisible)
		{
			const glyph = font.getGraphicsGlyph(graphics, 46);
			if (glyph)
			{
				const { path, advanceX } = glyph;
				if (path)
				{
					for (let i = 0; i < 3; i++)
					{
						transform[2] = x;
						transform[5] = y;
						renderPath.addPath(path, transform);

						x += advanceX * scale;
					}
				}
			}
		}

		if (!this._ClipPath)
		{
			this._ClipPath = graphics.makePath();
		}
		else
		{
			this._ClipPath.rewind();
		}
		const obb = this.getOBB(null, styles, renderLineHeight);
		this._ClipPath.addRect(obb[0][0], obb[0][1], obb[1][0] - obb[0][0], obb[1][1] - obb[0][1]);

		this._IsPathDirty = false;
		return true;
	}

	getOBB(transform, styles, renderLineHeight)
	{
		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		function addPoint(pt)
		{
			if (transform)
			{
				pt = vec2.transformMat2d(vec2.create(), pt, transform);
			}
			if (pt[0] < min_x)
			{
				min_x = pt[0];
			}
			if (pt[1] < min_y)
			{
				min_y = pt[1];
			}
			if (pt[0] > max_x)
			{
				max_x = pt[0];
			}
			if (pt[1] > max_y)
			{
				max_y = pt[1];
			}
		}

		if (!renderLineHeight)
		{
			renderLineHeight = this.getRenderLineHeight(styles);
		}
		const { _Size, _Align } = this;
		let x0 = 0,
			x1 = 0;
		switch (_Align)
		{
			case TextAlign.Right:
				x0 = -_Size[0];
				x1 = 0;
				break;

			case TextAlign.Center:
				x0 = -_Size[0] / 2;
				x1 = _Size[0] / 2;
				break;
			default:
				x1 = _Size[0];
				break;
		}
		addPoint([x0, -renderLineHeight]);
		addPoint([x1, -renderLineHeight]);
		addPoint([x1, -renderLineHeight + _Size[1]]);
		addPoint([x0, -renderLineHeight + _Size[1]]);
		return [vec2.fromValues(min_x, min_y), vec2.fromValues(max_x, max_y)];
	}
}