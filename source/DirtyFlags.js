export default class DirtyFlags
{
    static get TransformDirty() { return 1<<0; }
    static get WorldTransformDirty() { return 1<<1; }
    static get PaintDirty() { return 1<<2; }
}