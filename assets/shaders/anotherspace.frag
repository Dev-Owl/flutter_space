// https://www.shadertoy.com/view/XtGGRt
// Auroras by nimitz 2017 (twitter: @stormoid)
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
// Contact the author for other licensing options
/*
	
	There are two main hurdles I encountered rendering this effect. 
	First, the nature of the texture that needs to be generated to get a believable effect
	needs to be very specific, with large scale band-like structures, small scale non-smooth variations
	to create the trail-like effect, a method for animating said texture smoothly and finally doing all
	of this cheaply enough to be able to evaluate it several times per fragment/pixel.

	The second obstacle is the need to render a large volume while keeping the computational cost low.
	Since the effect requires the trails to extend way up in the atmosphere to look good, this means
	that the evaluated volume cannot be as constrained as with cloud effects. My solution was to make
	the sample stride increase polynomially, which works very well as long as the trails are lower opcaity than
	the rest of the effect. Which is always the case for auroras.

	After that, there were some issues with getting the correct emission curves and removing banding at lowered
	sample densities, this was fixed by a combination of sample number influenced dithering and slight sample blending.

	N.B. the base setup is from an old shader and ideally the effect would take an arbitrary ray origin and
	direction. But this was not required for this demo and would be trivial to fix.
*/
/*
    The code was adjusted to work with the current Shader support of Flutter.
    Star field code from: https://www.shadertoy.com/view/lsfGWH
*/

#version 320 es
precision highp float;
layout(location=0)out vec4 fragColor;
layout(location=0)uniform vec2 iResolution;
layout(location=1)uniform float time;
layout(location=2)uniform vec2 iMouse;



mat2 mm2(in float a){float c = cos(a), s = sin(a);return mat2(c,s,-s,c);}
mat2 m2 = mat2(0.95534, 0.29552, -0.29552, 0.95534);
float tri(in float x){return clamp(abs(fract(x)-.5),0.01,0.49);}
vec2 tri2(in vec2 p){return vec2(tri(p.x)+tri(p.y),tri(p.y+tri(p.x)));}

float triNoise2d(in vec2 p, float spd)
{
    float z=1.8;
    float z2=2.5;
	float rz = 0.;
    p *= mm2(p.x*0.06);
    vec2 bp = p;
	for (float i=0.; i<5.; i++ )
	{
        vec2 dg = tri2(bp*1.85)*.75;
        dg *= mm2(time*spd);
        p -= dg/z2;

        bp *= 1.3;
        z2 *= .45;
        z *= .42;
		p *= 1.21 + (rz-1.0)*.02;
        
        rz += tri(p.x+tri(p.y))*z;
        p*= -m2;
	}
    return clamp(1./pow(rz*29., 1.3),0.,.55);
}

float hash21(in vec2 n){ return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }
vec4 aurora(vec4 ro, vec4 rd)
{
    vec4 col = vec4(0);
    vec4 avgCol = vec4(0);
    
    for(float i=0.;i<50.;i++)
    {
        float of = 0.006*hash21(gl_FragCoord.xy)*smoothstep(0.,15., i);
        float pt = ((.8+pow(i,1.4)*.002)-ro.y)/(rd.y*2.+0.4);
        pt -= of;
    	vec4 bpos = ro + pt*rd;
        vec2 p = bpos.zx;
        float rzt = triNoise2d(p, 0.06);
        vec4 col2 = vec4(0,0,0, rzt);
        col2 = (sin(1.-vec4(2.15,-.5, 1.2,1)+i*0.043)*0.5+0.5)*rzt;
        avgCol =  mix(avgCol, col2, .5);
        col += avgCol*exp2(-i*0.065 - 2.5)*smoothstep(0.,5., i);
        
    }
    
    col *= (clamp(rd.y*15.+.4,0.,1.));
    return col*1.8;
}


//-------------------Background and Stars--------------------
#define M_PI 3.1415926535897932384626433832795

float rand(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}


vec4 bg(in vec4 rd)
{
    float sd = dot(normalize(vec4(-0.5, -0.6, 0.9,1)), rd)*0.5+0.5;
    sd = pow(sd, 5.);
    vec4 col = mix(vec4(0.05,0.1,0.2,1), vec4(0.1,0.05,0.2,1), sd);
    return col*.63;
}
//-----------------------------------------------------------


void main()
{
    vec2 fragCoord = gl_FragCoord.xy;
	vec2 q = fragCoord.xy / iResolution.xy;
    vec2 p = q - 0.5;
	p.x*=iResolution.x/iResolution.y;
    
    vec4 ro = vec4(0,0,-6.7,1);
    vec4 rd = normalize(vec4(p,1.3,1));
    vec2 mo = iMouse.xy / iResolution.xy-.5;
    mo = (mo==vec2(-.5))?mo=vec2(-0.1,0.1):mo;
	mo.x *= iResolution.x/iResolution.y;
    rd.yz *= mm2(mo.y);
    rd.xz *= mm2(mo.x + sin(time*0.05)*0.2);
    
    vec4 col = vec4(0.);
    vec4 brd = rd;
    float fade = smoothstep(0.,0.01,abs(brd.y))*0.1+0.9;
    float prob = 0.95;
    col = bg(rd)*fade;
    
    float size = 30.0;

	
	vec2 pos = floor(1.0 / size * fragCoord.xy);
	
	float color = 0.0;
	float starValue = rand(pos);
    if (rd.y > 0.){
        vec4 aur = smoothstep(0.,1.5,aurora(ro,rd))*fade;
        col = col*(1.-aur.a) + aur.rgba;
    }
    else //Reflections
    {
        rd.y = abs(rd.y);
        col = bg(rd)*fade*0.6;
        vec4 aur = smoothstep(0.0,2.5,aurora(ro,rd));
        if (starValue > prob)
	    {
	    	vec2 center = size * pos + vec2(size, size) * 0.5;
		
    		float t = 0.9 + 0.2 * sin(time + (starValue - prob) / (1.0 - prob) * 45.0);
				
		    color = 1.0 - distance(fragCoord.xy, center) / (0.5 * size);
		    color = color * t / (abs(fragCoord.y - center.y)) * t / (abs(fragCoord.x - center.x));
            col += vec4(color,color,color,1);
	    }
	    else if (rand(fragCoord.xy / iResolution.xy) > 0.996)
	    {
		    float r = rand(fragCoord.xy);
		    color = r * (0.25 * sin(time * (r * 5.0) + 720.0 * r) + 0.75);
            col += vec4(color,color,color,1);
	    }
        col = col*(1.-aur.a) + aur.rgba;
        vec4 pos = ro + ((0.5-ro.y)/rd.y)*rd;
        float nz2 = triNoise2d(pos.xz*vec2(.5,.7), 0.);
        col += mix(vec4(0.2,0.25,0.5,1)*0.08,vec4(0.3,0.3,0.5,1)*0.7, nz2*0.4);
    }
    
	fragColor = col;
}
