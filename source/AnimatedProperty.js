function block(id, key) { return {id,key}; }

const Blocks = 
{
	Unknown: block(0, "unknown"),
	PosX: block(1, "posX"),
	PosY: block(2, "posY"),
	ScaleX: block(3, "scaleX"),
	ScaleY: block(4, "scaleY"),
	Rotation: block(5, "rotation"),
	Opacity: block(6, "opacity"),
	DrawOrder: block(7, "drawOrder"),
	Length: block(8, "length"),
	ImageVertices: block(9, "imageVertices"),
	ConstraintStrength: block(10, "strength"),
	Trigger: block(11, "trigger"),
	IntProperty: block(12, "intValue"),
	FloatProperty: block(13, "floatValue"),
	StringProperty: block(14, "stringValue"),
	BooleanProperty: block(15, "boolValue"),
	IsCollisionEnabled: block(16, "isCollisionEnabled"),
	Sequence: block(17, "sequence"),
	ActiveChildIndex: block(18, "activeChild"),
	PathVertices: block(19, "pathVertices"),
	FillColor: block(20, "fillColor"),
	FillGradient: block(21, "fillGradient"),
	FillRadial: block(22, "fillRadial"),
	StrokeColor: block(23, "strokeColor"),
	StrokeGradient: block(24, "strokeGradient"),
	StrokeRadial: block(25, "strokeRadial"),
	StrokeWidth: block(26, "strokeWidth"),
	StrokeOpacity: block(27, "strokeOpacity"),
	FillOpacity: block(28, "fillOpacity"),
	ShapeWidth: block(29, "width"),
	ShapeHeight: block(30, "height"),
	CornerRadius: block(31, "cornerRadius"),
	InnerRadius: block(32, "innerRadius"),
	StrokeStart: block(33, "strokeStart"),
	StrokeEnd: block(34, "strokeEnd"),
	StrokeOffset: block(35, "strokeOffset")
};

const _Types = {};
const _Map = new Map();
for(const key in Blocks)
{
	const value = Blocks[key];
	_Types[key] = value.id;
	_Map.set(value.key, value.id);
}

export default class AnimatedProperty
{
	constructor(type)
	{
		this._Type = type;
		this._KeyFrames = [];
	}

    static get Types()
    {
        return _Types;
    }

    static fromString(label)
    {
        return _Map.get(label) || 0;
    }
}


AnimatedProperty.Properties = 
{
	
};