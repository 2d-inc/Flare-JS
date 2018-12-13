import * as SVG from '@svgdotjs/svg.js/dist/svg.node.js'

export default function make(transform)
{
    const matrix = new SVG.Matrix();
    matrix.a = transform[0];
    matrix.b = transform[1];
    matrix.c = transform[2];
    matrix.d = transform[3];
    matrix.e = transform[4];
    matrix.f = transform[5];

    return matrix;
}