export default class Atlas
{
    constructor(bytes)
    {
        this._Bytes = bytes;
        this._Image = null;
    }

    get img()
    {
        return this._Image;
    }

    get width()
    {
        return this._Image.width();
    }

    get height()
    {
        return this._Image.height();
    }

    get paint()
    {
        return this._Paint;
    }

    initialize(graphics)
    {
        const image = graphics.makeImage(this._Bytes);
        const shader = graphics.makeImageShader(image);

        this._Image = image;

        const paint = graphics.makePaint();
        graphics.setPaintShader(paint, shader);
		this._Paint = paint;
    }
}