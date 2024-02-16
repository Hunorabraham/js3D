
//helper classes
class color{
    constructor(x,y,z,alpha,type){
        this.x = x;
        this.y = y;
        this.z = z;
        this.a = alpha;
        this.type = type;
    }
    ToString(){
        switch(this.type){
            case "rgba":
                return `rgba(${this.x},${this.y},${this.z},${this.a})`;
            case "hsla":
                return `hsla(${this.x},${this.y}%,${this.z}%,${this.a})`;
            case "hsl":
                return `hsl(${this.x},${this.y}%,${this.z}%)`;
        }
    }
    HSLToRGB(){
        this.y /= 100;
        this.z /= 100;
        const k = n => (n + this.x / 30) % 12;
        const a = this.y * Math.min(this.z, 1 - this.z);
        const f = n => this.z - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return new color(255 * f(0), 255 * f(8), 255 * f(4),this.a,"rgba");
    }
}

//math classes
//      bs class
class matrix{
    constructor(){
        this.secret = "go duck your self";
    }
}
class Vec3{
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
let globalLight = new Vec3(0,1,0);
let ambientLight = new color(240,50,30,1,"hsla").HSLToRGB();
let lightColor = new color(255,255,255,1,"rgba");
console.log(ambientLight);
console.log(triLinearBlend2(lightColor,new color(6,50,60,1,"hsla").HSLToRGB(),ambientLight,1));
//object classes
class cube{
    constructor(pos,size,rot){
        this.localVerts = [];
        //generate the 8 local vertecies of the cube
        for(let i = -1; i < 2; i+=2){
            for(let j = -1; j < 2; j+=2){
                for(let k = -1; k < 2; k+=2){
                    this.localVerts.push(new Vec3(size*i/2,size*j/2,size*k/2));
                }
            }
        }
        //generate the 12 triangles, by their vertexes' indexes in localVerts(with a stride of 3)
        //hard coded for now
        this.Triangles = [0,1,2, 1,3,2, 4,5,0, 5,1,0, 1,5,3, 5,7,3, 2,3,6, 3,7,6, 4,0,6, 0,2,6, 6,7,4, 7,5,4];
        this.pos = pos;
        this.rot = rot;//unused for now
    }
    load(){
        let allRot = rotationMatrixAll(this.rot.x,this.rot.y,this.rot.z);
        for(let i = 0; i < this.Triangles.length; i+=3){
            //here should go to rotation calculations
            let vert1 = matrixMult(this.localVerts[this.Triangles[i]],allRot);
            let vert2 = matrixMult(this.localVerts[this.Triangles[i+1]],allRot);
            let vert3 = matrixMult(this.localVerts[this.Triangles[i+2]],allRot);

            // the vectors of two sides(originating from the same point)
            let a = vectorSub(vert3,vert1);
            let b = vectorSub(vert2,vert1);
            let surfaceNormal = normalize(cross(a,b));
            let l = dot(globalLight,surfaceNormal);
            let face = (dot(new Vec3(0,0,1),surfaceNormal)<0)?0:1;
            //now wolrd position and loading
            loadTri(vert1.x+this.pos.x,vert1.y+this.pos.y,vert1.z+this.pos.z,vert2.x+this.pos.x,vert2.y+this.pos.y,vert2.z+this.pos.z,vert3.x+this.pos.x,vert3.y+this.pos.y,vert3.z+this.pos.z,triLinearBlend2(lightColor,new color(6,50,60,face,"hsla").HSLToRGB(),ambientLight,l));
        }
    }
}
class tetrahedron{
    constructor(pos,size,rot){
        this.pos = pos;
        this.rot = rot;
        this.localVerts = [];
        //generate, more accurately hard code the 4 vertecies
        this.localVerts.push(new Vec3(0,size,0));
        let r = size* Math.sqrt(2)*2/3;
        for(let i = 0; i < 3; i++){
            this.localVerts.push(new Vec3(Math.sin(i*Math.PI/3*2)*r,-size/3,Math.cos(i*Math.PI/3*2)*r));
        }
        this.Triangles = [1,3,2, 1,2,0, 3,0,2, 0,3,1];
    }
    load(){
        let allRot = rotationMatrixAll(this.rot.x,this.rot.y,this.rot.z);
        for(let i = 0; i < this.Triangles.length; i+=3){
            //here should go to rotation calculations
            let vert1 = matrixMult(this.localVerts[this.Triangles[i]],allRot);
            let vert2 = matrixMult(this.localVerts[this.Triangles[i+1]],allRot);
            let vert3 = matrixMult(this.localVerts[this.Triangles[i+2]],allRot);

            // the vectors of two sides(originating from the same point)
            let a = vectorSub(vert3,vert1);
            let b = vectorSub(vert2,vert1);
            let surfaceNormal = normalize(cross(a,b));
            let l = dot(globalLight,surfaceNormal);
            let face = (dot(new Vec3(0,0,1),surfaceNormal)<0)?0:1;
            //now wolrd position and loading
            loadTri(vert1.x+this.pos.x,vert1.y+this.pos.y,vert1.z+this.pos.z,vert2.x+this.pos.x,vert2.y+this.pos.y,vert2.z+this.pos.z,vert3.x+this.pos.x,vert3.y+this.pos.y,vert3.z+this.pos.z,triLinearBlend2(lightColor,new color(6,50,60,face,"hsla").HSLToRGB(),ambientLight,l));
        }
    }
}
class octaahedron{
    constructor(pos,size,rot){
        this.pos = pos;
        this.rot = rot;
        this.localVerts = [];
        //generate, more accurately hard code the 4 vertecies
        let r = size/Math.sqrt(3); // compacted equation: [sqrt(3)/2 /3] *2
        let h = size*Math.sqrt(6)/3;
        let sixty = Math.PI/3;
        let onetwenty = Math.PI/3*2;
        for(let i = 0; i < 3; i++){
            this.localVerts.push(new Vec3(Math.sin(i*onetwenty)*r,-h/2,Math.cos(i*onetwenty)*r));
        }
        for(let i = 0; i < 3; i++){
            this.localVerts.push(new Vec3(Math.sin(i*onetwenty+sixty)*r,h/2,Math.cos(i*onetwenty+sixty)*r));
        }
        //[0,1,2, 3,4,5, 0,4,3, 0,3,1, 1,3,5, 1,5,2, 2,5,4, 2,4,0]
        this.Triangles = [0,2,1, 3,4,5, 1,4,3, 0,1,3, 3,5,0, 2,0,5, 2,5,4, 2,4,1];
    }
    load(){
        let allRot = rotationMatrixAll(this.rot.x,this.rot.y,this.rot.z);
        for(let i = 0; i < this.Triangles.length; i+=3){
            //here should go to rotation calculations
            let vert1 = matrixMult(this.localVerts[this.Triangles[i]],allRot);
            let vert2 = matrixMult(this.localVerts[this.Triangles[i+1]],allRot);
            let vert3 = matrixMult(this.localVerts[this.Triangles[i+2]],allRot);

            // the vectors of two sides(originating from the same point)
            let a = vectorSub(vert3,vert1);
            let b = vectorSub(vert2,vert1);
            let surfaceNormal = normalize(cross(a,b));
            let l = dot(globalLight,surfaceNormal);
            let face = (dot(new Vec3(0,0,1),surfaceNormal)<0)?0:1;
            //now wolrd position and loading
            loadTri(vert1.x+this.pos.x,vert1.y+this.pos.y,vert1.z+this.pos.z,vert2.x+this.pos.x,vert2.y+this.pos.y,vert2.z+this.pos.z,vert3.x+this.pos.x,vert3.y+this.pos.y,vert3.z+this.pos.z,triLinearBlend2(lightColor,new color(6,50,60,face,"hsla").HSLToRGB(),ambientLight,l));
        }
    }
}
//draw constants
const can = document.querySelectorAll("canvas")[0];
const draw = can.getContext("2d");
const K1 = can.width*2;

const deltaTime = 16;
const planc = deltaTime/1000;

let vertsScreen = [];
let vertsWorld = [];

let verts5World = [];
let color5Buff = [];

let colorBuff = [];
//draw functions
function drawPrimitive(x1,y1,x2,y2,x3,y3,color){
    draw.beginPath();
    draw.moveTo(x1,y1);
    draw.lineTo(x2,y2);
    draw.lineTo(x3,y3);
    draw.lineTo(x1,y1);
    draw.fillStyle = color;
    draw.fill();
    draw.strokeStyle = color;
    draw.stroke();
    draw.closePath();
}
function drawTris(sorting){
    //not perfect but good enough;
    if(sorting){
        vertsScreen.sort((a,b)=>{
            return -a[2]-a[5]-a[8]+b[2]+b[5]+b[8];
        });
    }
    let fvertsScreen = vertsScreen.flat();
    for(let i = 0; i < fvertsScreen.length; i+=10){
        drawPrimitive(fvertsScreen[i],fvertsScreen[i+1],fvertsScreen[i+3],fvertsScreen[i+4],fvertsScreen[i+6],fvertsScreen[i+7],colorBuff[fvertsScreen[i+9]].ToString());
    }
}
function loadTri(x1,y1,z1,x2,y2,z2,x3,y3,z3,color){
    colorBuff.push(color);
    vertsWorld.push(x1);
    vertsWorld.push(y1);
    vertsWorld.push(z1);
    vertsWorld.push(x2);
    vertsWorld.push(y2);
    vertsWorld.push(z2);
    vertsWorld.push(x3);
    vertsWorld.push(y3);
    vertsWorld.push(z3);
}
function calcBuffer(){
    for(let i = 0;i < vertsWorld.length;i+=9){
        let triTemp = [];
        for(let j = 0; j < 9; j+=3){
            let x = vertsWorld[i+j]*K1/vertsWorld[i+j+2]+can.width/2;
            let y = vertsWorld[i+j+1]*K1/vertsWorld[i+j+2]+can.height/2;
            triTemp.push(x,y,vertsWorld[i+j+2]-K1);
        }
        triTemp.push(i/9);
        vertsScreen.push(triTemp);
    }
}
function clearEverything(){
    vertsScreen = [];
    vertsWorld = [];
    colorBuff = [];
}
//math functions
function matrixMult(v,m){
    let w = new Vec3(0,0,0);
    w.x = m.xx*v.x+m.xy*v.y+m.xz*v.z;
    w.y = m.yx*v.x+m.yy*v.y+m.yz*v.z;
    w.z = m.zx*v.x+m.zy*v.y+m.zz*v.z;
    return w;
}
function matrixXmatrix(m1,m2){
    let m3 = new matrix();
        m3.xx = m1.xx*m2.xx+m1.xy*m2.yx+m1.xz*m2.zx;
        m3.xy = m1.xx*m2.xy+m1.xy*m2.yy+m1.xz*m2.zy;
        m3.xz = m1.xx*m2.xz+m1.xy*m2.yz+m1.xz*m2.zz;
        m3.yx = m1.yx*m2.xx+m1.xy*m2.yx+m1.yz*m2.zx;
        m3.yy = m1.yx*m2.xy+m1.xy*m2.yy+m1.yz*m2.zy;
        m3.yz = m1.yx*m2.xz+m1.xy*m2.yz+m1.yz*m2.zz;
        m3.zx = m1.zx*m2.xx+m1.zy*m2.yx+m1.zz*m2.zx;
        m3.zy = m1.zx*m2.xy+m1.zy*m2.yy+m1.zz*m2.zy;
        m3.zz = m1.zx*m2.xz+m1.zy*m2.yz+m1.zz*m2.zz;
    return m3;
}
function rotationMatrixX(phi){
    let m = new matrix();
    let cosphi = Math.cos(phi);
    let sinphi = Math.sin(phi);
    m.xx = 1;
    m.xy = 0;
    m.xz = 0;
    
    m.yx = 0;
    m.yy = cosphi;
    m.yz = sinphi;
    
    m.zx = 0;
    m.zy = -sinphi;
    m.zz = cosphi;

    return m;
}
function rotationMatrixY(phi){
    let m = new matrix();
    let cosphi = Math.cos(phi);
    let sinphi = Math.sin(phi);
    m.xx = cosphi;
    m.xy = 0;
    m.xz = sinphi;
    
    m.yx = 0;
    m.yy = 1;
    m.yz = 0;
    
    m.zx = -sinphi;
    m.zy = 0;
    m.zz = cosphi;

    return m;
}
function rotationMatrixZ(phi){
    let m = new matrix();
    let cosphi = Math.cos(phi);
    let sinphi = Math.sin(phi);
    m.xx = cosphi;
    m.xy = sinphi;
    m.xz = 0;
    
    m.yx = -sinphi;
    m.yy = cosphi;
    m.yz = 0;
    
    m.zx = 0;
    m.zy = 0;
    m.zz = 1;

    return m;
}
function rotationMatrixAll(aplha,beta,gamma){
    let m = new matrix();
    let sinA = Math.sin(aplha);
    let sinB = Math.sin(beta);
    let sinG = Math.sin(gamma);
    let cosA = Math.cos(aplha);
    let cosB = Math.cos(beta);
    let cosG = Math.cos(gamma);
    m.xx = cosA*cosB*cosG-sinA*sinG;
    m.xy = -cosA*cosB*sinG-sinA*cosG;
    m.xz = -cosA*sinB;
    m.yx = sinA*cosB*cosG+cosA*sinG;
    m.yy = -sinA*cosB*sinG+cosA*cosG;
    m.yz = -sinA*sinB;
    m.zx = sinB*cosG;
    m.zy = -sinB*sinG;
    m.zz = cosB;
    return m;
}
function dot(v,w){
   return v.x*w.x + v.y*w.y + v.z*w.z;
}
function cross(v,w){
    return new Vec3(v.y*w.z -v.z*w.y, v.z*w.x -v.x*w.z, v.x*w.y - v.y*w.x);
}
function vectorSub(v,w){
    return new Vec3(v.x-w.x, v.y-w.y, v.z-w.z);
}
function normalize(v){
    let mag = Math.sqrt(v.x**2+v.y**2+v.z**2);
    return (mag==0)? new Vec3(0,0,0) : new Vec3(v.x/mag,v.y/mag,v.z/mag);
}
//c1, c2 : Color; t : number [0;1];
function linearBlendColorsAlpha(c1,c2,t){
    return (t<0) ? c2 : (t>1)? c1 : new color(c1.x*t+c2.x*(1-t), c1.y*t+c2.y*(1-t), c1.z*t+c2.z*(1-t), c1.a*t+c2.a*(1-t), "rgba");
}
function linearBlendColors(c1,c2,t){
    return (t<0) ? c2 : (t>1)? c1 : new color(c1.x*t+c2.x*(1-t), c1.y*t+c2.y*(1-t), c1.z*t+c2.z*(1-t), c1.a, c1.type);
}
function triLinearBlend2(c1,c2,c3,t){
    return (t<0) ? new color(c2.x*(1+t)+c3.x*(-t), c2.y*(1+t)+c3.y*(-t), c2.z*(1+t)+c3.z*(-t),c2.a,c2.type) : new color(c1.x*t+c2.x*(1-t), c1.y*t+c2.y*(1-t), c1.z*t+c2.z*(1-t),c2.a,c2.type);
}
function clamp(x,min,max){
    return (x<min)? min : (x>max)? max : x;
}
//debug
function loh(){
    console.log(vertsScreen);
    console.log(vertsWorld);
}
//loadTri(-200,200,1600,0,300,1600,200,200,1600,new color(255,255,0,1));

let c = new cube(new Vec3(0,0,1600),200,new Vec3(Math.PI/4,Math.PI/2,0));
let fuck = 0;
let ID = setInterval(() => {
    c.load();
    calcBuffer();
    draw.fillStyle = "hsl(240,50%,60%)";
    draw.fillRect(0,0,can.width,can.height);
    drawTris(true);
    c.rot.x += Math.PI*planc/2;
    c.rot.y -= Math.PI*planc/2;
    c.rot.z += Math.PI/2*planc/2;
    //c.pos.y += 16/1000*-1000;
    clearEverything();
}, deltaTime);
