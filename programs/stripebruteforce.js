var transitionstable=[18,18,18,19,18,0,19,4,18,0,1,5,2,3,6,11,18,1,18,7,1,8,7,12,19,5,7,10,6,13,14,16,18,2,1,6,0,3,5,11,0,3,8,13,3,9,13,15,19,6,7,14,5,13,10,16,4,11,12,16,11,15,16,17];
//B2c B2k B2n B3c B3i B3n B3q B3r
//B3y B4c B4i B4n B4t B4y B4z B5e
//B5r B6i 0   1

//B0  B1c B1e B2a B1c B2c B2a B3i
//B1c B2c B2k B3n B2n B3c B3q B4n
//B1e B2k B2i B3r B2k B3y B3r B4t
//B2a B3n B3r B4i B3q B4y B4z B5r
//B1c B2n B2k B3q B2c B3c B3n B4n
//B2c B3c B3y B4y B3c B4c B4y B5e
//B2a B3q B3r B4z B3n B4y B4i B5r
//B3i B4n B4t B5r B4n B5e B5r B6i

//Larger than 3 cells: 31, 37, 38, 39, 41, 43, 44, 45, 47, 51, 54, 56, 57, 76, 95, 96, 112, 144, 168, 224
var periods=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,32,33,34,35,36,40,42,60];
var knownperiods={};
for(var i=0;i<periods.length;i++){
  knownperiods[periods[i]]=1;
}
var rule=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
var transitionsinvolved=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var w=process.argv[2];
if(w===undefined){
  console.log("Usage:");
  console.log("node filename.js <width> [iteration count] [backup string]");
  console.log("The program will periodically print out backup strings that you can use to restart it at a certain point. If you do not want it to stop after a certain iteration count, either leave it blank or set it to Infinity.");
  process.exit();
}
w=1*w;
var front=[0,0,0,0];
var back=[0,0,0,0];
for(var i=0;i<w;i++){
  front.push(0);
  back.push(0);
}
var backup=function(){
  if(front[w+2]){
    return;
  }
  var backup="";
  for(var i=0;i<w;i++){
    backup+=".o"[front[w+1-i]];
  }
  for(var i=0;i<=w+1;i++){
    backup+=".o"[back[w+2-i]];
  }
  //console.log(front);
  //console.log(back);
  console.log("");
  console.log("BACKUP STRING");
  console.log(backup);
  if(searched>=maxsearched){
    console.log("Done");
    process.exit();
  }
};
var iterate=function(row){
  var iterated=[0];
  var i=32*front[0]+16*front[1]+8*front[2]+4*row[0]+2*row[1]+row[2];
  var t=transitionstable[i];
  var id=rule[t];
  iterated.push(id);
  transitionsinvolved[t]=1;
  for(var j=0;j<=w;j++){
    i-=32*front[j];//8 operations is better than 10
    i-=4*row[j];
    i*=2;
    i+=8*front[j+3];
    i+=row[j+3];
    t=transitionstable[i];
    id=rule[t];
    iterated.push(id);
    transitionsinvolved[t]=1;
  }
  iterated.push(0);
  return iterated;
};
var txtrule=function(rule){
  //Why is this so long
  var r="B2a";
  if(rule[0]){
    r+="c";
  }
  if(rule[1]){
    r+="k";
  }
  if(rule[2]){
    r+="n";
  }
  var b3c=rule[3];
  var b3i=rule[4];
  var b3n=rule[5];
  var b3q=rule[6];
  var b3r=rule[7];
  var b3y=rule[8];
  if(b3c||b3i||b3n||b3q||b3r||b3y){
    r+="3";
    if(b3c){
      r+="c";
    }
    if(b3i){
      r+="i";
    }
    if(b3n){
      r+="n";
    }
    if(b3q){
      r+="q";
    }
    if(b3r){
      r+="r";
    }
    if(b3y){
      r+="y";
    }
  }
  var b4c=rule[9];
  var b4i=rule[10];
  var b4n=rule[11];
  var b4t=rule[12];
  var b4y=rule[13];
  var b4z=rule[14];
  if(b4c||b4i||b4n||b4t||b4y||b4z){
    r+="4";
    if(b4c){
      r+="c";
    }
    if(b4i){
      r+="i";
    }
    if(b4n){
      r+="n";
    }
    if(b4t){
      r+="t";
    }
    if(b4y){
      r+="y";
    }
    if(b4z){
      r+="z";
    }
  }
  var b5e=rule[15];
  var b5r=rule[16];
  if(b5e||b5r){
    r+="5";
    if(b5e){
      r+="e";
    }
    if(b5r){
      r+="r";
    }
  }
  if(rule[17]){
    r+="6i";
  }
  return r;
};
var rchecked;
var check_period=function(row){
  var r0=row.slice();
  var gens={};
  var p;
  var g=0;
  while(gens[row]===undefined){
    gens[row]=g;
    g+=1;
    row=iterate(row);
    //console.log(row);
    if(row<r0){//Not the "smallest" phase, assuming we started in a phase-either way, this avoids duplicate work, as we will find the same object when we start from the "smaller" phase, if we haven't done so already.
      return -1;
    }
  }
  p=g-gens[row];
  rchecked=row.slice();
  return p;
};
var step_rule=function(){
  rule[0]+=1;
  var i=0;
  while(rule[i]===2){
    rule[i]=0;
    i+=1;
    rule[i]+=1;
  }
};
var rulespaces=[];
var match=function(rule,prule){
  for(var i=0;i<18;i++){
    if(rule[i]!==prule[i]&&prule[i]!==-1){
      return false;
    }
  }
  return true;
};
var matchany=function(rule){
  var result=false;
  for(var i=rulespaces.length-1;i>=0;i--){
    var prule=rulespaces[i];
    if(match(rule,prule)){
      result=true;
      if(prule[18]===1){//This rulespace will never be seen again
        rulespaces.splice(i,1);
      }else{
        prule[18]-=1;
      }
    }
  }
  return result;
};
var mersenne=[0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535,131071,262143];//Let's keep a lookup table to avoid recomputing these.
var check_rule=function(){
  var uninvolved=0;
  var b=back.slice();
  transitionsinvolved=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var p=check_period(b);
  var rulespace=[];
  for(var i=0;i<18;i++){
    if(!transitionsinvolved[i]){
      rulespace.push(-1);
      uninvolved+=1;
    }else{
      rulespace.push(rule[i]);
    }
  }
  if(uninvolved){//We wouldn't see an endemic rule again anyways
    rulespace.push(mersenne[uninvolved]);//We've already seen one rule in the rulespace
    rulespaces.push(rulespace);//We can ignore everything else, since it'll evolve in the same way.
  }
  if(p===-1){
    return false;
  }
  //Ignore known periods
  if(knownperiods[p]===1){
    return false;
  }
  b=rchecked.slice();
  var b0=b.slice();
  transitionsinvolved=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  for(var i=0;i<p;i++){
    b=iterate(b);
    if(b<b0){//Not the "smallest" phase-we'll also find it in that phase anyways
      return false;
    }
  }
  var b1=back.slice();
  for(var i=0;i<p;i++){
    b1=iterate(b1);
  }
  for(var i=1;i<w+3;i++){
    if(back[i]!==b1[i]){
      return false;//Not actually a phase of the oscillation-we'll be able to find it from a phase in the oscillation.
    }
  }
  //console.log(transitionsinvolved);
  var maxrule=rule.slice();
  for(var i=0;i<18;i++){
    if(!transitionsinvolved[i]){
      maxrule[i]=1;//We can add this without affecting anything, this is the minrule anyways since it's the first member of its rulespace
    }
  }
  var r=txtrule(rule);
  var m=txtrule(maxrule);
  console.log("P"+p+" "+r+" to "+m);
  return true;
};
var searched=0;
var frontchanged=false;
var step=function(){
  back[1]+=1;
  var i=1;
  while(back[i]===2){
    back[i]=0;
    i+=1;
    back[i]+=1;
  }
  if(back[w+3]){
    back[w+3]=0;
    front[2]+=1;
    frontchanged=true;
  }
  i=2;
  while(front[i]===2){
    front[i]=0;
    i+=1;
    front[i]+=1;
  }
  searched+=1;
  if(searched>=maxsearched){
    backup();
  }
};
var step_front=function(){
  front[2]+=1;
  var i=2;
  while(front[i]===2){
    front[i]=0;
    i+=1;
    front[i]+=1;
  }
  var psearched=searched;
  searched+=Math.pow(2,w+2);
};
var t0=Date.now();
var t1;
var t2=t0;
var check=function(){
  var found=false;
  rulespaces=[];
  for(var i=0;i<256;i++){
    t1=Date.now();
    if(t1-t0>30000){//This is a critical loop, so we'll do it this way for speed.
      t0=t1;
      backup();
      console.log((i*1024)+"/262144");
      console.log((t0-t2)/1000);
    }
    for(var j=0;j<1024;j++){
      if(!matchany(rule)){
        if(check_rule()){
          found=true;
        }
      }
      step_rule();
    }
  }
  if(found){
    console.log("");
    var f="";
    var b="";
    for(var i=0;i<w+4;i++){ 
      f+=".o"[front[i]];
      b+=".o"[back[i]];
    }
    console.log(f);
    console.log(".".repeat(w+4));
    console.log(b);
  }
  rule=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
};
var hw=Math.floor(w/2);
var minimal=function(){//If the front is asymmetric, then we don't need to search both the front and its reflection. For example, at w4, we only need to search one of o.oo and oo.o
  for(var i=2;i<2+hw;i++){
    var l=front[i];
    var r=front[w+3-i];
    if(l>r){
      return true;
    }
    if(l<r){//Ignore reflections of the "front" row
      return false;
    }
  }
  return true;
};
var disjoint=function(){
  if(!(front[2]||(back[1]&&back[2]))){//This is either thinner than our target width, or this state does not repeat:
    //...?
    //....
    //.?.?

    //...?
    //....
    //..??
    return true;
  }
  var w1=w+1;
  if(!(front[w1]||(back[w1]&&back[w+2]))){//Same but on the other side
    return true;
  }
  for(var i=2;i<=w-2;i++){
    var i1=i+1;
    var i2=i+2;
    if(!(front[i]||front[i1]||front[i2]||front[i+3]||back[i1]||back[i2])){//This implies that we have two noninteracting frontends:
      //?....?
      //......
      //??..??
      return true;
    }
  }
  return false;
};
var start=process.argv[4];
if(start===undefined){//Load a backup string if one is supplied
  start=".".repeat(2*w+2);
}
while(start.length<2*w+2){
  start="."+start;
}
for(var i=0;i<w;i++){
  if(start[i]==="o"){
    front[w+1-i]=1;
  }
}
for(var i=0;i<w+2;i++){
  if(start[i+w]==="o"){
    back[w+2-i]=1;
  }
}
var f="";
var b="";
for(var i=0;i<w+4;i++){ 
  f+=".o"[front[i]];
  b+=".o"[back[i]];
}
console.log(f);
console.log(".".repeat(w+4));
console.log(b);
var maxsearched=process.argv[3];
if(maxsearched===undefined){
  maxsearched=Infinity;
}else{
  maxsearched=1*maxsearched;
}
backup();
while(!front[w+2]){
  while(!minimal()){//The last frontend is symmetric so we won't overstep the main loop condition
    step_front();
  }
  while(!frontchanged){
    while(disjoint()){//This won't overstep either because the last back row fills every cell, making it impossible for disjoint() to be true.
      step();
    }
    check();
    step();
  }
  frontchanged=false;
}
console.log("Done");
