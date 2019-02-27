const lookup = new Map();
const ordered = [];
const ids = new Map();

export default class BlendMode
{
	constructor(id, legibleId, label)
	{
        this._LegibleID = legibleId;
        this._Label = label;
		this._ID = id;
        lookup.set(label, this);
        ordered.push(this);
        ids.set(id, this);
	}

	get id()
	{
		return this._ID;
    }
    
    get label()
    {
        return this._Label;
    }

    get legibleID()
    {
        return this._LegibleID;
    }

	toString()
	{
		return this._LegibleID;
	}

	static fromString(legibleID)
	{
		return lookup.get(legibleID) || BlendMode.SrcOver;
    }

    static fromID(id)
    {
        return ids.get(id);
    }
    
    static get all()
    {
        return ordered;
    }

    static setCanvasKit(CanvasKit)
    {
        const SkiaBlendMode = CanvasKit.BlendMode;
        BlendMode.Clear.sk = SkiaBlendMode.Clear;
        BlendMode.Src.sk = SkiaBlendMode.Src;
        BlendMode.Dst.sk = SkiaBlendMode.Dst;
        BlendMode.SrcOver.sk = SkiaBlendMode.SrcOver;
        BlendMode.DstOver.sk = SkiaBlendMode.DstOver;
        BlendMode.SrcIn.sk = SkiaBlendMode.SrcIn;
        BlendMode.DstIn.sk = SkiaBlendMode.DstIn;
        BlendMode.SrcOut.sk = SkiaBlendMode.SrcOut;
        BlendMode.DstOut.sk = SkiaBlendMode.DstOut;
        BlendMode.SrcATop.sk = SkiaBlendMode.SrcATop;
        BlendMode.DstATop.sk = SkiaBlendMode.DstATop;
        BlendMode.Xor.sk = SkiaBlendMode.Xor;
        BlendMode.Plus.sk = SkiaBlendMode.Plus;
        BlendMode.Modulate.sk = SkiaBlendMode.Modulate;
        BlendMode.Screen.sk = SkiaBlendMode.Screen;
        BlendMode.Overlay.sk = SkiaBlendMode.Overlay;
        BlendMode.Darken.sk = SkiaBlendMode.Darken;
        BlendMode.Lighten.sk = SkiaBlendMode.Lighten;
        BlendMode.ColorDodge.sk = SkiaBlendMode.ColorDodge;
        BlendMode.ColorBurn.sk = SkiaBlendMode.ColorBurn;
        BlendMode.HardLight.sk = SkiaBlendMode.HardLight;
        BlendMode.SoftLight.sk = SkiaBlendMode.SoftLight;
        BlendMode.Difference.sk = SkiaBlendMode.Difference;
        BlendMode.Exclusion.sk = SkiaBlendMode.Exclusion;
        BlendMode.Multiply.sk = SkiaBlendMode.Multiply;
        BlendMode.Hue.sk = SkiaBlendMode.Hue;
        BlendMode.Saturation.sk = SkiaBlendMode.Saturation;
        BlendMode.Color.sk = SkiaBlendMode.Color;
        BlendMode.Luminosity.sk = SkiaBlendMode.Luminosity;
    }
}

BlendMode.Clear = new BlendMode(0, "clear", "Clear");
BlendMode.Src = new BlendMode(1, "src", "Src");
BlendMode.Dst = new BlendMode(2, "dst", "Dst");
BlendMode.SrcOver = new BlendMode(3, "srcOver", "Src Over");
BlendMode.DstOver = new BlendMode(4, "dstOver", "Dst Over");
BlendMode.SrcIn = new BlendMode(5, "srcIn", "Src In");
BlendMode.DstIn = new BlendMode(6, "dstIn", "Dst In");
BlendMode.SrcOut = new BlendMode(7, "srcOut", "Src Out");
BlendMode.DstOut = new BlendMode(8, "dstOut", "Dst Out");
BlendMode.SrcATop = new BlendMode(9, "srcATop", "Src A Top");
BlendMode.DstATop = new BlendMode(10, "dstATop", "Dst A Top");
BlendMode.Xor = new BlendMode(11, "xor", "Xor");
BlendMode.Plus = new BlendMode(12, "plus", "Plus");
BlendMode.Modulate = new BlendMode(13, "modulate", "Modulate");
BlendMode.Screen = new BlendMode(14, "screen", "Screen");
BlendMode.Overlay = new BlendMode(15, "overlay", "Overlay");
BlendMode.Darken = new BlendMode(16, "darken", "Darken");
BlendMode.Lighten = new BlendMode(17, "lighten", "Lighten");
BlendMode.ColorDodge = new BlendMode(18, "colorDodge", "Color Dodge");
BlendMode.ColorBurn = new BlendMode(19, "colorBurn", "Color Burn");
BlendMode.HardLight = new BlendMode(20, "hardLight", "Hard Light");
BlendMode.SoftLight = new BlendMode(21, "softLight", "Soft Light");
BlendMode.Difference = new BlendMode(22, "difference", "Difference");
BlendMode.Exclusion = new BlendMode(23, "exclusion", "Exclusion");
BlendMode.Multiply = new BlendMode(24, "multiply", "Multiply");
BlendMode.Hue = new BlendMode(25, "hue", "Hue");
BlendMode.Saturation = new BlendMode(26, "saturation", "Saturation");
BlendMode.Color = new BlendMode(27, "color", "Color");
BlendMode.Luminosity = new BlendMode(28, "luminosity", "Luminosity");