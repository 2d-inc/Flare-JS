function cuberoot(x) 
{
	const y = Math.pow(Math.abs(x), 1/3);
	return x < 0 ? -y : y;
}	

function yFromT(t, E, F, G, H)
{
	const y = E*(t*t*t) + F*(t*t) + G*t + H;
	return y;
}

// http://stackoverflow.com/questions/27176423/function-to-solve-cubic-equation-analytically
function solveCubic(a, b, c, d) 
{
	if (Math.abs(a) < Number.EPSILON) 
	{ 
		// Quadratic case, ax^2+bx+c=0
		a = b; 
		b = c; 
		c = d;
		if (Math.abs(a) < Number.EPSILON) 
		{ 
			// Linear case, ax+b=0
			a = b; 
			b = c;
			if (Math.abs(a) < Number.EPSILON) // Degenerate case
			{
				return [];
			}
			return [-b/a];
		}
		
		const D = b*b - 4*a*c;
		if (Math.abs(D) < Number.EPSILON)
			return [-b/(2*a)];
		else if (D > 0)
			return [(-b+Math.sqrt(D))/(2*a), (-b-Math.sqrt(D))/(2*a)];
		return [];
	}
	
	// Convert to depressed cubic t^3+pt+q = 0 (subst x = t - b/3a)
	const p = (3*a*c - b*b)/(3*a*a);
	const q = (2*b*b*b - 9*a*b*c + 27*a*a*d)/(27*a*a*a);
	let roots;

	if (Math.abs(p) < Number.EPSILON) 
	{ 
		// p = 0 -> t^3 = -q -> t = -q^1/3
		roots = [cuberoot(-q)];
	} 
	else if (Math.abs(q) < Number.EPSILON) 
	{ 
		// q = 0 -> t^3 + pt = 0 -> t(t^2+p)=0
		roots = [0].concat(p < 0 ? [Math.sqrt(-p), -Math.sqrt(-p)] : []);
	} 
	else 
	{
		const D = q*q/4 + p*p*p/27;
		if (Math.abs(D) < Number.EPSILON) 
		{       // D = 0 -> two roots
			roots = [-1.5*q/p, 3*q/p];
		} 
		else if (D > 0) 
		{
			// Only one real root
			const u = cuberoot(-q/2 - Math.sqrt(D));
			roots = [u - p/(3*u)];
		} 
		else 
		{
			// D < 0, three roots, but needs to use complex numbers/trigonometric solution
			const u = 2*Math.sqrt(-p/3);
			const t = Math.acos(3*q/p/u)/3;  // D < 0 implies p < 0 and acos argument in [-1..1]
			const k = 2*Math.PI/3;
			roots = [u*Math.cos(t), u*Math.cos(t-k), u*Math.cos(t-2*k)];
		}
	}
	
	// Convert back from depressed cubic
	for (let i = 0; i < roots.length; i++)
	{
		roots[i] -= b/(3*a);
	}
	return roots;
}

export default class BezierAnimationCurve
{
	constructor(pos1, control1, control2, pos2)
	{
		const y0a = pos1[1]; // initial y
		const x0a = pos1[0]; // initial x 
		const y1a = control1[1];    // 1st influence y   
		const x1a = control1[0];    // 1st influence x 
		const y2a = control2[1];    // 2nd influence y
		const x2a = control2[0];    // 2nd influence x
		const y3a = pos2[1]; // final y 
		const x3a = pos2[0]; // final x 

		this._E = y3a - 3*y2a + 3*y1a - y0a;    
		this._F = 3*y2a - 6*y1a + 3*y0a;             
		this._G = 3*y1a - 3*y0a;             
		this._H = y0a;

		this._Y0a = y0a;
		this._X0a = x0a;
		this._Y1a = y1a;
		this._X1a = x1a;
		this._Y2a = y2a;
		this._X2a = x2a;
		this._Y3a = y3a;
		this._X3a = x3a;
	}

	get(x)
	{
		const p0 = this._X0a-x;
		const p1 = this._X1a-x;
		const p2 = this._X2a-x;
		const p3 = this._X3a-x;

		const a = p3 - 3 * p2 + 3 * p1 - p0;
		const b = 3 * p2 - 6 * p1 + 3 * p0;
		const c = 3 * p1 - 3 * p0;
		const d = p0;

		const roots = solveCubic(a, b, c, d);
		let t = 0;
		for(let i = 0; i < roots.length; i++)
		{
			const r = roots[i];
			if(r >= 0.0 && r <= 1.0)
			{
				t = r;
				break;
			}
		}
		return yFromT(t, this._E, this._F, this._G, this._H);
	}
}