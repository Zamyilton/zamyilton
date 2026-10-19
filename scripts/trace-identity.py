"""Read the approved logo's alpha contour as mesh data; never modify its pixels."""
from pathlib import Path
import json
import numpy as np
from PIL import Image

root=Path(__file__).resolve().parents[1]
image=Image.open(root/'dist/assets/zamyilton-dragon-gold-purple.png')
mask=np.asarray(image.getchannel('A'))>=128
h,w=mask.shape
edges={}
def add(x,y,xx,yy):
    edges.setdefault((int(x),int(y)),[]).append((int(xx),int(yy)))

above=np.zeros_like(mask);above[1:]=mask[:-1]
right=np.zeros_like(mask);right[:,:-1]=mask[:,1:]
below=np.zeros_like(mask);below[:-1]=mask[1:]
left=np.zeros_like(mask);left[:,1:]=mask[:,:-1]
for y,x in np.argwhere(mask & ~above):add(x,y,x+1,y)
for y,x in np.argwhere(mask & ~right):add(x+1,y,x+1,y+1)
for y,x in np.argwhere(mask & ~below):add(x+1,y+1,x,y+1)
for y,x in np.argwhere(mask & ~left):add(x,y+1,x,y)

def area(points):
    return sum(x*yy-xx*y for (x,y),(xx,yy) in zip(points,points[1:]+points[:1]))/2

def simplify(points,epsilon=1.5):
    if len(points)<3:return points
    a,b=np.asarray(points[0]),np.asarray(points[-1])
    line=b-a
    data=np.asarray(points)
    if np.dot(line,line)==0:dist=np.linalg.norm(data-a,axis=1)
    else:
        t=np.clip(((data-a)@line)/np.dot(line,line),0,1)
        dist=np.linalg.norm(data-(a+t[:,None]*line),axis=1)
    index=int(np.argmax(dist))
    if dist[index]<=epsilon:return [points[0],points[-1]]
    return simplify(points[:index+1],epsilon)[:-1]+simplify(points[index:],epsilon)

loops=[]
while edges:
    first=next(iter(edges));point=first;points=[];previous=None
    while True:
        points.append(point)
        choices=edges[point]
        if len(choices)>1 and previous:
            dx,dy=point[0]-previous[0],point[1]-previous[1]
            def turn(end):
                nx,ny=end[0]-point[0],end[1]-point[1]
                return (dx*ny-dy*nx,dx*nx+dy*ny)
            end=max(choices,key=turn);choices.remove(end)
        else:end=choices.pop()
        if not choices:del edges[point]
        previous,point=point,end
        if point==first:break
    if abs(area(points))>35:loops.append(points)

outlines=sorted([points for points in loops if area(points)>35],key=area,reverse=True)
holes=[points for points in loops if area(points)<-35]
def commands(points):
    # Split a closed loop at its farthest vertex for stable line simplification.
    far=max(range(len(points)),key=lambda i:(points[i][0]-points[0][0])**2+(points[i][1]-points[0][1])**2)
    points=simplify(points[:far+1])[:-1]+simplify(points[far:]+[points[0]])[:-1]
    return [["M" if i==0 else "L",round(x/w*270,3),round(y/h*270,3)] for i,(x,y) in enumerate(points)]+[["Z"]]

def contains(polygon,point):
    x,y=point;inside=False
    for (ax,ay),(bx,by) in zip(polygon,polygon[1:]+polygon[:1]):
        if (ay>y)!=(by>y) and x<(bx-ax)*(y-ay)/(by-ay)+ax:inside=not inside
    return inside

shapes=[{'outline':commands(outer),'holes':[commands(points) for points in holes if contains(outer,points[0])]} for outer in outlines]
source='''// Contour of the user's selected FIRST dragon, sampled from the unchanged PNG alpha.
// The full-color PNG remains the visible artwork and the 3D face texture.
export const dragonAsset = "assets/zamyilton-dragon-gold-purple.png";
export const dragonShapes = SHAPES;
export const dragonPath = dragonShapes.flatMap(shape=>[shape.outline,...shape.holes]).flat().map(([command,...points])=>command+points.join(" ")).join(" ");

export function identitySVG({background=false,dark=false}={}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 270" role="img" aria-labelledby="title"><title id="title">Zamyilton first dragon sigil</title><defs><linearGradient id="finish" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e8bd62"/><stop offset=".5" stop-color="#9563d5"/><stop offset="1" stop-color="#e8bd62"/></linearGradient></defs>${background?'<rect width="270" height="270" rx="58" fill="#101014"/>':""}<path d="${dragonPath}" fill="${dark?"#3b2948":"url(#finish)"}" fill-rule="evenodd"/></svg>\\n`;
}
'''.replace('SHAPES',json.dumps(shapes,separators=(',',':')))
(root/'dist/identity.mjs').write_text(source)
print(json.dumps({'components':len(shapes),'outline_vertices':sum(len(shape['outline']) for shape in shapes),'cutouts':sum(len(shape['holes']) for shape in shapes)}))
