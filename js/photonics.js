//See definitions.txt for definitions and notes
var fs=require("fs");
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
if(process.version==="v15.14.0"){
  console.log("WARNING: RUNNING THIS PROGRAM WITH THIS VERSION OF NODE.JS IS KNOWN TO CAUSE MEMORY LEAKS. TRY v12.22.9 OR v16.13.2 INSTEAD.");
}
var input=0;
var isjson=false;
var backupfile="./backup.json";
var args=process.argv;
for(var i=0;i<args.length;i++){
  var arg=args[i];
  if(arg.substring(0,6)==="input="){
    input=arg.substring(6);
  }else if(arg==="json=true"){
    isjson=true;
  }else if(arg.substring(0,7)==="backup="){
    backupfile=arg.substring(7);
  }
}
if(!input){
  console.log("Required arguments:");
  console.log("input=filename");
  console.log("  Tells the program where to read the input file.");
  console.log("Optional arguments:");
  console.log("json=true/false");
  console.log("  If this is true, then the program will read the input file as a JSON backup. False by default.");
  console.log("backup=filename");
  console.log("  If specified, save backups to this file. ./backup.json by default.");
  process.exit();
}
input=fs.readFileSync(input,"utf-8").split("\r").join("").split("\n");
if(input[input.length-1]===""){
  input.pop();
}
var iterate=function(r0,r1){
  //0 1 2 3 4 ...   w   w+2
  //              w-1 w+1 w+3
  //0 0 ? ? ? ... ? ? ? 0 0
  var nextrow=[0];
  var n=0;//It's currently centered at index 0
  for(var i=2;i<w4;i++){//We loop this way because it lands us right on top of the row indices that we need.
    n&=27;//Discard the left two bits of the neighborhood, since we aren't going to look at them again.
    n*=2;//Shift left
    n+=8*r0[i];//Insert the new bits on the right
    n+=r1[i];
    nextrow.push(transitionstable[n]);
  }
  nextrow.push(0);
  return nextrow;
};
var requal=function(r0,r1){//Test row equality because === doesn't work
  for(var i=2;i<w2;i++){//Don't test the padding bits
    if(r0[i]!==r1[i]){
      return false;
    }
  }
  return true;
};
var pequal=function(p0,p1){//Test panel equality up to rotation.
  rotation:
  for(var di=0;di<p;di++){
    for(var i=0;i<p;i++){
      var idi=(i+di)%p;
      if(!requal(p0[i],p1[idi])){//No, it's not equal
        continue rotation;
      }
    }
    return true;//Every row has to be equal for us to get here
  }
  return false;//No rotation matches
};
var inlist=function(p,plist){//Test if a panel is in a list of panels, up to rotation
  for(var i=0;i<plist.length;i++){
    if(pequal(p,plist[i])){
      return true;
    }
  }
  return false;
};
var r2p=function(p0,r1){//Convert r1 into a panel, where p0 "is" the top row. Returns false if r1 won't reappear after p generations.
  var panel=[r1.slice()];
  for(var i=0;i<p;i++){
    r1=iterate(p0[i],r1);
    if(r1[1]||r1[w2]){//We expanded out of our width
      return false;
    }
    panel.push(r1);
  }
  var image=panel.pop();
  if(!requal(panel[0],image)){//This doesn't work
    return false;
  }
  return panel;
};
var parserow=function(str){
  var row=[0,0];
  for(var i=0;i<w;i++){
    if(str[i]==="."){
      row.push(0);
    }else{
      row.push(1);
    }
  }
  row.push(0);
  row.push(0);
  return row;
}
var tree;
var p;
var w;
var w2;
var w4;
var rule;
if(isjson){
  input=JSON.parse(input);
  tree=input.tree;
  p=input.p;
  w=input.w;
  rule=input.rule;
  w2=w+2;
  w4=w+4;
  for(var i=0;i<64;i++){
    transitionstable[i]=rule[transitionstable[i]];
  }
}else{
  p=1*input[0];
  w=1*input[1];
  w2=w+2;
  w4=w+4;
  rule=input[2].split("");
  for(var i=0;i<18;i++){
    rule[i]*=1;
  }
  rule.push(0);//Pad for unconditional transitions
  rule.push(1);
  for(var i=0;i<64;i++){//Since the rule is constant, we can make transitionstable directly into a lookup table instead of first looking up the transition then looking up its status.
    transitionstable[i]=rule[transitionstable[i]];
  }
  var ri=3;
  var p0=[];
  for(var i=0;i<p;i++){
    p0.push(parserow(input[ri]));
    ri+=1;
  }
  var startingpanels=[p0];
  while(ri<input.length){//Get the rest of the rows
    startingpanels.push(parserow(input[ri]));
    ri+=1;
  }
  var sl=startingpanels.length;
  for(var i=1;i<sl;i++){//Build the rest of the panels
    var panel=r2p(startingpanels[i-1],startingpanels[i]);
    if(panel){
      startingpanels[i]=panel;
    }else{
      console.log("Invalid row");
      process.exit();
    }
  }
  tree=[startingpanels[sl-1]];
  for(var i=sl-2;i>=0;i--){//Now build the tree
    tree=[startingpanels[i],[tree]];
  }
}
var printpanels=function(panels){
  var height=panels.length;
  console.log("x="+w4+",y="+(2*height-1));
  for(var i=0;i<height;i++){
    if(i){
      console.log("$$");
    }
    for(var j=0;j<w4;j++){
      process.stdout.write(".o"[panels[i][0][j]]);
    }
  }
  console.log("!");
};
var searched=0;
var eliminated=0;
var currnode=tree;
var nodestack=[];
var panels=[currnode[0]];//For deduping purposes
var search=function(){//Do one iteration of DFS
  //First, we try to find the first unsearched node on the tree. On the way, we may be able to clean some things up.
  var count=0;
  while(currnode.length===2){
    var viable=[];
    var branches=currnode[1];//We know that this exists, since node.length===2.
    for(var i=0;i<branches.length;i++){//Sift through the branches on this node, and find the viable ones.
      var child=branches[i];
      if(child.length===1||child[1].length>0){
        //The first condition means that the child hasn't been searched yet, so it could be viable.
        //Iff the second condition is FALSE, then we've ruled out all extensions from that child, so the child is not viable.
        viable.push(child);
      }else{
        eliminated+=1;
      }
    }
    currnode[1]=viable;
    if(viable.length){
      nodestack.push(currnode);
      currnode=viable[0];//Move up the tree
      panels.push(currnode[0]);
    }else{//We're stuck here since we don't know how far back we might have to go, so let's return and try again
      currnode=nodestack.pop();//But we can still go back one layer
      panels.pop();
      return;
    }
  }//At this point, we've reached a node whose children we haven't computed yet.
  searched+=1;
  var branches=[];
  var row=[0,0,0,0];
  for(var i=0;i<w;i++){
    row.push(0);//Fill the row up with zeroes
  }//Compute the panel for the blank row separately. If the entire panel is blank, we've got a spaceship.
  var panel=currnode[0];
  var solutions=[];
  var zero=r2p(panel,row);
  if(zero){//Test for blankness
    blank:{
      for(var i=0;i<p;i++){
        for(var j=2;j<w2;j++){//Should be faster than calling requal(zero[i],row) because we know that row will be blank, and requal doesn't
          if(zero[i][j]){
            if(!inlist(zero,panels)&&!inlist(zero,solutions)){
              solutions.push(zero);//We add this solution panel, so that if a different rotation shows up, we know to skip it. This kind of stuff can show up if a higher-period part follows a lower-period part.
              branches.push([zero]);
            }
            break blank;
          }
        }
      }
      console.log("Spaceship found");//It's blank! We found a spaceship!
      printpanels(panels);
    }
  }
  while(true){//Now brute-force the rest of the possible rows
    var i=2;//First non-padding bit
    while(row[i]){
      row[i]=0;//Carry over
      i+=1;
    }
    if(i===w2){//First right padding bit
      break;
    }
    row[i]=1;//Then we know this one is zero, so we can just increment it to 1
    var newpanel=r2p(panel,row);
    if(newpanel&&!inlist(newpanel,panels)&&!inlist(newpanel,solutions)){
      solutions.push(newpanel);
      branches.push([newpanel]);
    }
  }
  currnode.push(branches);//We're done, so let's add the branches to the node
};
var gettreesize=function(){
  var size=0;
  var stack=[tree];
  while(stack.length){
    var node=stack.pop();
    size+=1;
    if(node.length===2){
      stack=stack.concat(node[1]);
    }
  }
  return size;
};
var backuptree=function(){
  fs.writeFileSync(backupfile,'{"rule":'+JSON.stringify(rule)+',"p":'+p+',"w":'+w+',"tree":');
  var stack=[tree];
  while(stack.length>0){
    var item=stack.pop();
    if(typeof item==="string"){//We can just add it directly
      fs.appendFileSync(backupfile,item);
      continue;
    }
    fs.appendFileSync(backupfile,"["+JSON.stringify(item[0]));//First part of node
    if(item.length===1){
      fs.appendFileSync(backupfile,"]");//Termination of node
    }else{//But there's a bunch of other stuff to add first
      fs.appendFileSync(backupfile,",[");//Start the list of children
      var branches=item[1];
      var length=branches.length;
      stack.push("]]");//Termination for the list and for the node
      for(var i=length-1;i>=0;i--){//We push items onto the stack in reverse order, because popping them will give them to us in the correct order.
        stack.push(branches[i]);
        stack.push(",");
      }
      if(length){
        stack.pop();
      }
    }
  }
  fs.appendFileSync(backupfile,"}");
};
var iterations=0;
var statusreport=function(){
  console.log("Iterations completed: "+iterations);
  console.log("Tree size: "+gettreesize());
  console.log("Nodes searched: "+searched);
  console.log("Nodes eliminated: "+eliminated);
  console.log("Memory usage: "+process.memoryUsage().rss/1000000+" MB");
  searched=0;
  eliminated=0;
};
statusreport();
var t0=Date.now();
while(true){
  search();
  iterations+=1;
  if(tree[1].length===0){
    statusreport();
    console.log("No more objects");
    process.exit();
  }
  if(Date.now()-15000>=t0){
    t0=Date.now();
    statusreport();
    backuptree();
  }
}
