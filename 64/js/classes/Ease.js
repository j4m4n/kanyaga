//Ease.pj

class Ease  {
// many of these easing implemtnations from easings(dot)net -jb
static types=[
'linear',
'in-out quart',
'in-out quint',
'in-out sine',
'in back',
'in bounce',
'in cubic',
'in expo',
'in quart',
'out back',
'out bounce',
'out cubic',
'out expo',
'out quart',
'in-out back',
'in-out cubic',
'in-out elastic',
'in-out expo',
];
constructor(type = null){
    this.type = type;
if (!this.type)this.type=Ease.types[0];
}
next(){
let i=Ease.types.indexOf(this.type);
if (i==-1){
this.type=Ease.types[0];
}else {
this.type=Ease.types[(i+1)%Ease.types.length];
}
}
ease(t){
return Ease.byType(this.type,t)
}
static linear=(x)=>x;
static inBack=(x)=>{
let c1=1.70158;
let c3=c1+1;
return c3*x*x*x-c1*x*x;
}
static inBounce=(x)=>1-Ease.outBounce(1-x);
static inCubic=(x)=>x*x*x;
static inExpo=(x)=>x===0?0:Math.pow(2,10*x-10);
static inQuart=(x)=>x*x*x*x;
static outBack=(x)=>{
let c1=1.70158;
let c3=c1+1;
return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);
}
static outBounce=(x)=>{
const n1=7.5625;
const d1=2.75;
if (x<1/d1){
return n1*x*x;
}else if(x<2/d1){
return n1*(x-=1.5/d1)*x+0.75;
}else if(x<2.5/d1){
return n1*(x-=2.25/d1)*x+0.9375;
}else {
return n1*(x-=2.625/d1)*x+0.984375;
}
}
static outCubic=(x)=>1-Math.pow(1-x,3);
static outExpo=(x)=>x===1?1:1-Math.pow(2,-10*x);
static outQuart=(x)=>1-Math.pow(1-x,4);
static inOutBack=(x)=>{
let c1=1.70158;
let c2=c1*1.525;
return x<0.5?
(Math.pow(2*x,2)*((c2+1)*2*x-c2))/2
:(Math.pow(2*x-2,2)*((c2+1)*(x*2-2)+c2)+2)/2;
}
static inOutBounce=(x)=>x<0.5
?(1-Ease.outBounce(1-2*x))/2
:(1+Ease.outBounce(2*x)-1)/2;
static inOutCubic=(x)=>x<0.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
static inOutElastic=(x)=>{
if (x==0||x==1)return x;
let c5=(2*Math.PI)/4.5;
return x<0.5
?-(Math.pow(2,20*x-10)*Math.sin((20*x-11.1125)*c5))/2
:(Math.pow(2,-20*x+10)*Math.sin((20*x-11.125)*c5))/2+1;
}
static inOutExpo=(x)=>{
if (x==0||x==1)return x;
return x<0.5
?Math.pow(2,20*x-10)/2
:(2-Math.pow(2,-20*x+10))/2;
}
static inOutQuart=(x)=>x<0.5?8*x*x*x*x:1-Math.pow(-2*x+2,4)/2;
static inOutQuint=(x)=>x<0.5?16*x*x*x*x*x:1-Math.pow(-2*x+2,5)/2;
static inOutSine=(x)=>-1*(Math.cos(Math.PI*x)-1)/2;
static byType(type,t){
switch(type){
case'linear':return Ease.linear(t);
case'in-out back':return Ease.inOutBack(t);
case'in-out cubic':return Ease.inOutCubic(t);
case'in-out elastic':return Ease.inOutElastic(t);
case'in-out expo':return Ease.inOutExpo(t);
case'in-out quart':return Ease.inOutQuart(t);
case'in-out quint':return Ease.inOutQuint(t);
case'in-out sine':return Ease.inOutSine(t);
case'in back':return Ease.inBack(t);
case'in bounce':return Ease.inBounce(t);
case'in cubic':return Ease.inCubic(t);
case'in expo':return Ease.inExpo(t);
case'in quart':return Ease.inQuart(t);
case'out back':return Ease.outBack(t);
case'out bounce':return Ease.outBounce(t);
case'out cubic':return Ease.outCubic(t);
case'out expo':return Ease.outExpo(t);
case'out quart':return Ease.outQuart(t);
}
throw new Error('Unrecognized ease function name requested: '+name);
}
}