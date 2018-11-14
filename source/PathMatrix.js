const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

export default function make(transform)
{
    const matrix = svg.createSVGMatrix();
    matrix.a = transform[0];
    matrix.b = transform[1];
    matrix.c = transform[2];
    matrix.d = transform[3];
    matrix.e = transform[4];
    matrix.f = transform[5];

    return matrix;
}