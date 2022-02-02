#This is pretty much the same as the JS version, but with Python's syntax instead. The comments here are Python-specific.
transitionstable=[18,18,18,19,18,0,19,4,18,0,1,5,2,3,6,11,18,1,18,7,1,8,7,12,19,5,7,10,6,13,14,16,18,2,1,6,0,3,5,11,0,3,8,13,3,9,13,15,19,6,7,14,5,13,10,16,4,11,12,16,11,15,16,17]
input_=0#"input" is not a valid variable name
isjson=False
backupfile="./backup.json"
import sys
args=sys.argv
for i in range(len(args)):
  arg=args[i]
  if arg[0:6]=="input=":
    input_=arg[6:]
  elif arg=="json=true":
    isjson=True
  elif arg[0:7]=="backup=":
    backupfile=arg[7:]
if not input_:
  print("Required arguments:")
  print("input=filename")
  print("  Tells the program where to find the input file.")
  print("Optional arguments:")
  print("json=true/false")
  print("  If this is true, then the program will read the input file as a JSON backup. False by default.")
  print("backup=filename")
  print("  If specified, save backups to this file. ./backup.json by defaule.")
  exit()
f=open(input_,"r")
input_="".join(f.read().split("\r")).split("\n")
f.close()
if input_[len(input_)-1]=="":
  input_.pop()
def iterate(r0,r1):
  nextrow=[0]
  n=0
  for i in range(2,w4):
    n&=27
    n<<=1#Python doesn't have this bit shift problem, so we can use <<1 instead of *2.
    n+=r0[i]<<3#Same idea
    n+=r1[i]
    nextrow.append(transitionstable[n])
  nextrow.append(0)
  return nextrow
def pequal(p0,p1):
  for di in range(0,p):
    for i in range(0,p):
      idi=(i+di)%p
      if p0[i]!=p1[idi]:#JS can't do this
        break#This doesn't trigger the "else" so we just continue the outer loop
    else:
      return True
  return False
def inlist(p,plist):
  for i in range(len(plist)):
    if pequal(p,plist[i]):
      return True
  return False
def r2p(p0,r1):
  panel=[r1[:]]
  for i in range(p):
    r1=iterate(p0[i],r1)
    if r1[1] or r1[w2]:
      return False
    panel.append(r1)
  image=panel.pop()
  if panel[0]!=image:
    return False
  return panel
def parserow(str):
  row=[0,0]
  for i in range(w):
    if str[i]==".":
      row.append(0)
    else:
      row.append(1)
  row+=[0,0]#Append
  return row
tree=None
p=None
w=None
w2=None
w4=None
rule=None
import json
if isjson:
  input_=json.loads(input_[0])#JS appears to be able to parse a JSON string in the form of ["JSON"] instead of "JSON". Python requires "JSON".
  tree=input_["tree"]
  p=input_["p"]
  w=input_["w"]
  rule=input_["rule"]
  w2=w+2
  w4=w+4
  for i in range(64):
    transitionstable[i]=rule[transitionstable[i]]
else:
  p=int(input_[0])
  w=int(input_[1])
  w2=w+2
  w4=w+4
  rule=list(input_[2])
  for i in range(18):
    rule[i]=int(rule[i])
  rule+=[0,1]#Append
  for i in range(64):
    transitionstable[i]=rule[transitionstable[i]]
  ri=3
  p0=[]
  for i in range(p):
    p0.append(parserow(input_[ri]))
    ri+=1
  startingpanels=[p0]
  while ri<len(input_):
    startingpanels.append(parserow(input_[ri]))
    ri+=1
  sl=len(startingpanels)
  for i in range(1,sl):
    panel=r2p(startingpanels[i-1],startingpanels[i])
    if panel:
      startingpanels[i]=panel
    else:
      print("Invalid row")
      exit()
  tree=[startingpanels[sl-1]]
  for i in range(sl-2,-1,-1):
    tree=[startingpanels[i],[tree]]
def printpanels(panels):
  height=len(panels)
  print("x="+str(w4)+",y="+str(2*height-1))
  for i in range(height):
    line=""
    for j in range(w4):
      line+=".o"[panels[i][0][j]]
    if i<height-1:
      line+="$$"
    else:
      line+="!"
    print(line)
searched=0
eliminated=0
currnode=tree
nodestack=[]
panels=[currnode[0]]
def search():
  global currnode
  global searched
  global eliminated
  while len(currnode)==2:
    viable=[]
    branches=currnode[1]
    for i in range(len(branches)):
      child=branches[i]
      if len(child)==1 or len(child[1]):
        viable.append(child)
      else:
        eliminated+=1
    currnode[1]=viable
    if len(viable):
      nodestack.append(currnode)
      currnode=viable[0]
      panels.append(currnode[0])
    else:
      panels.pop()
      if len(nodestack):#The stack is empty once we run out of search space. JS won't care, but Python throws an error.
        currnode=nodestack.pop()
      return
  searched+=1
  branches=[]
  row=[0]*w4#Expand into a blank row
  panel=currnode[0]
  solutions=[]
  zero=r2p(panel,row)
  if zero:
    for i in range(p):
      for j in range(w2):
        if zero[i][j]:
          if not inlist(zero,panels):
            solutions.append(zero)
            branches.append([zero])
          break#This then skips the "else"
      else:
        continue
      break#This then also skips the "else"
    else:#We get here only if zero is blank
      print("Spaceship found")
      printpanels(panels)
  for k in range((1<<w)-1):#We're not bound by floating-point precision errors
    i=2
    while row[i]:
      row[i]=0
      i+=1
    row[i]=1
    newpanel=r2p(panel,row)
    if newpanel and not (inlist(newpanel,panels) or inlist(newpanel,solutions)):
      solutions.append(newpanel)
      branches.append([newpanel])
  currnode.append(branches)
def gettreesize():
  size=0
  stack=[tree]
  while len(stack):
    node=stack.pop()
    size+=1
    if len(node)==2:
      stack+=node[1]#This concatenates the lists
  return size
def backuptree():
  backup='{"rule":'+str(rule)+',"p":'+str(p)+',"w":'+str(w)+',"tree":'
  stack=[tree]
  strtype=type("")
  while len(stack):
    item=stack.pop()
    if type(item)==strtype:
      backup+=item
      continue
    backup+="["+str(item[0])
    if len(item)==1:
      backup+="]"
    else:
      backup+=",["
      branches=item[1]
      length=len(branches)
      stack.append("]]")
      for i in range(length-1,-1,-1):
        stack.append(branches[i])
        stack.append(",")
      if length:
        stack.pop()
  backup+="}"
  f=open(backupfile,"w")
  f.write(backup)
  f.close()
iterations=0
def statusreport():
  global searched
  global eliminated
  print("Iterations completed: "+str(iterations))
  print("Tree size: "+str(gettreesize()))
  print("Nodes searched: " +str(searched))
  print("Nodes eliminated: "+str(eliminated))
  #I don't know how to get the memory usage
  searched=0
  eliminated=0
statusreport()
import time
t0=time.time()
while True:
  search()
  iterations+=1
  if not len(tree[1]):
    statusreport()
    print("No more objects")
    exit()
  if time.time()-30>=t0:
    statusreport()
    backuptree()
    t0=time.time()
