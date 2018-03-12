import {mat2d} from "gl-matrix";

export function Decompose(m, result)
{
	let m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3];

	let rotation = Math.atan2(m1, m0);
	let denom = m0*m0 + m1*m1;
	let scaleX = Math.sqrt(denom);
	let scaleY = (m0 * m3 - m2 * m1) / scaleX;
	let skewX = Math.atan2(m0 * m2 + m1 * m3, denom);

	result[0] = m[4];
	result[1] = m[5];
	result[2] = scaleX;
	result[3] = scaleY;
	result[4] = rotation;
	result[5] = skewX;
}

export function Compose(m, result)
{
	let r = result[4];

	if(r !== 0)
	{
		mat2d.fromRotation(m, r);
	}
	else
	{
		mat2d.identity(m);
	}
	m[4] = result[0];
	m[5] = result[1];
	mat2d.scale(m, m, [result[2], result[3]]);

	let sk = result[5];
	if(sk !== 0.0)
	{
		m[2] = m[0] * sk + m[2];
		m[3] = m[1] * sk + m[3];
	}
}