function block(id, key) { return {id,key}; }

const Blocks = 
{
	Nodes: block(1, "nodes"),
	ActorNode: block(2, "node"),
	ActorBone: block(3, "bone"),
	ActorRootBone: block(4, "rootBone"),
	ActorImage: block(5, "image"),
	View: block(6, "view"),
	Animation: block(7, "animation"),
	Animations: block(8, "animations"),
	Atlases: block(9, "atlases"),
	Atlas: block(10, "atlas"),
	ActorEvent: block(12, "event"),
	CustomIntProperty: block(13, "customInt"),
	CustomFloatProperty: block(14, "customFloat"),
	CustomStringProperty: block(15, "customString"),
	CustomBooleanProperty: block(16, "customBool"),
	ActorImageSequence: block(22, "imageSequence"),
	ActorNodeSolo: block(23, "solo"),
	JellyComponent: block(28, "jelly"),
	ActorJellyBone:  block(29, "jellyBone"),
	ActorIKConstraint: block(30, "ikConstraint"),
	ActorDistanceConstraint: block(31, "distanceConstraint"),
	ActorTranslationConstraint: block(32, "translationConstraint"),
	ActorRotationConstraint: block(33, "rotationConstraint"),
	ActorScaleConstraint: block(34, "scaleConstraint"),
	ActorTransformConstraint: block(35, "transformConstraint"),

	ActorShape: block(100, "shape"),
	ActorPath: block(101, "path"),
	ColorFill: block(102, "colorFill"),
	ColorStroke: block(103, "colorStroke"),
	GradientFill: block(104, "gradientFill"),
	GradientStroke: block(105, "gradientStroke"),
	RadialGradientFill: block(106, "radialGradientFill"),
	RadialGradientStroke: block(107, "radialGradientStroke"),
	ActorEllipse: block(108, "ellipse"),
	ActorRectangle: block(109, "rectangle"),
	ActorTriangle: block(110, "triangle"),
	ActorStar: block(111, "star"),
	ActorPolygon: block(112, "polygon"),
	ActorSkin: block(113, "skin"),
	ActorArtboard: block(114, "artboard"),
	Artboards: block(115, "artboards"),
	ActorCacheNode: block(116, "cacheNode"),
	ActorTargetNode: block(117, "targetNode"),
	ActorLayerNode: block(118, "layerNode"),
	FlareNode: block(24, "flareNode"),
	EmbeddedAssets: block(25, "embeddedAssets"),
	FlareAsset: block(26, "flareAsset")
};

const _Types = {};
const _Map = new Map();
for(const key in Blocks)
{
	const value = Blocks[key];
	_Types[key] = value.id;
	_Map.set(value.key, value.id);
}


export default class Block
{
    static get Types()
    {
        return _Types;
    }

    static fromString(label)
    {
        return _Map.get(label) || 0;
    }
}