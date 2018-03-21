export default class AnimatedProperty
{
	constructor(type)
	{
		this._Type = type;
		this._KeyFrames = [];
	}
}

AnimatedProperty.Properties = 
{
	Unknown:0,
	PosX:1,
	PosY:2,
	ScaleX:3,
	ScaleY:4,
	Rotation:5,
	Opacity:6,
	DrawOrder:7,
	Length:8,
	VertexDeform:9,
	ConstraintStrength:10,
	Trigger:11,
	IntProperty:12,
	FloatProperty:13,
	StringProperty:14,
	BooleanProperty:15,
	IsCollisionEnabled:16,
	Sequence:17,
	ActiveChildIndex: 18,
	Paths:19,
	FillColor:20,
	FillGradient:21,
	FillRadial:22,
	StrokeColor:23,
	StrokeGradient:24,
	StrokeRadial:25,
	StrokeWidth:26
};