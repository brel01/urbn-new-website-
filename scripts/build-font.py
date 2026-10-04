import sys, freetype
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib.tables._c_m_a_p import CmapSubtable
SRC=sys.argv[1]; OUT=sys.argv[2]; EMB=int(sys.argv[3]); FAMILY_STYLE=sys.argv[4]; WEIGHT=int(sys.argv[5])
f=TTFont(SRC); glyf=f['glyf']; hmtx=f['hmtx']
cmap=f['cmap'].getBestCmap().copy()
# --- add missing punctuation built from the 'i' tittle and stem metrics
idot=[(103,606),(72,606),(40,638),(40,662),(40,686),(72,719),(103,719),(133,719),(166,686),(166,662),(166,638),(133,606)]
def dot(pen,dx,dy):
    pts=[(x+dx,y+dy) for x,y in idot]
    pen.moveTo(pts[0]); pen.qCurveTo(pts[1],pts[2],pts[3]); pen.qCurveTo(pts[4],pts[5],pts[6]); pen.qCurveTo(pts[7],pts[8],pts[9]); pen.qCurveTo(pts[10],pts[11],pts[0]); pen.closePath()
def rect(pen,x0,y0,x1,y1):
    pen.moveTo((x0,y0)); pen.lineTo((x0,y1)); pen.lineTo((x1,y1)); pen.lineTo((x1,y0)); pen.closePath()
def poly(pen,pts):
    pen.moveTo(pts[0]); [pen.lineTo(p) for p in pts[1:]]; pen.closePath()
new={}
def add(name,uni,adv,draw):
    pen=TTGlyphPen(None); draw(pen); new[name]=(uni,adv,pen.glyph())
add('period',0x2E,226,lambda p:dot(p,10,-606))
add('colon',0x3A,226,lambda p:(dot(p,10,-606),dot(p,10,-606+400)))
add('comma',0x2C,226,lambda p:poly(p,[(60,113),(176,113),(130,-120),(40,-120)]))
add('semicolon',0x3B,226,lambda p:(dot(p,10,-606+400),poly(p,[(60,113),(176,113),(130,-120),(40,-120)])))
add('hyphen',0x2D,400,lambda p:rect(p,50,250,350,345))
add('endash',0x2013,560,lambda p:rect(p,40,250,520,345))
add('emdash',0x2014,1000,lambda p:rect(p,40,250,960,345))
add('quotesingle',0x27,206,lambda p:rect(p,50,470,156,712))
add('quoteright',0x2019,226,lambda p:poly(p,[(70,712),(186,712),(140,480),(50,480)]))
add('quoteleft',0x2018,226,lambda p:poly(p,[(86,480),(176,480),(156,712),(40,712)]))
add('quotedbl',0x22,380,lambda p:(rect(p,50,470,150,712),rect(p,230,470,330,712)))
add('slash',0x2F,420,lambda p:poly(p,[(10,-60),(110,-60),(410,770),(310,770)]))
add('plus',0x2B,600,lambda p:(rect(p,252,110,348,590),rect(p,60,302,540,398)))

import math
def question(pen):
    # centerline: arc over the top, then down into the stem
    cx, cy, r, w = 250, 512, 150, 104
    pts = [(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))) for a in range(170, -61, -10)]
    end = pts[-1]
    pts += [(cx + 10, cy - 175), (cx, 236)]
    def offs(sign):
        out = []
        for i, (x, y) in enumerate(pts):
            x0, y0 = pts[max(i - 1, 0)]; x1, y1 = pts[min(i + 1, len(pts) - 1)]
            dx, dy = x1 - x0, y1 - y0; L = math.hypot(dx, dy) or 1
            out.append((round(x - sign * dy / L * w / 2), round(y + sign * dx / L * w / 2)))
        return out
    left, right = offs(1), offs(-1)
    poly(pen, left + right[::-1])
    dot(pen, cx - 103, -606)
add('question',0x3F,500,question)
order=f.getGlyphOrder()
for name,(uni,adv,g) in new.items():
    if uni in cmap: continue
    order.append(name); glyf.glyphs[name]=g; g.recalcBounds(glyf); hmtx.metrics[name]=(adv,g.xMin if g.numberOfContours else 0); cmap[uni]=name
f.setGlyphOrder(order); glyf.glyphOrder=order
f['maxp'].numGlyphs=len(order)
# --- embolden via freetype
if EMB:
    f.save('/tmp/_tmp.ttf'); face=freetype.Face('/tmp/_tmp.ttf')
    for gi,name in enumerate(order):
        g=glyf[name]
        if not g.numberOfContours or g.isComposite(): continue
        face.load_glyph(gi, freetype.FT_LOAD_NO_SCALE|freetype.FT_LOAD_NO_HINTING)
        ol=face.glyph.outline; freetype.raw.FT_Outline_Embolden(freetype.ctypes.byref(face.glyph._FT_GlyphSlot.contents.outline), EMB)
        pen=TTGlyphPen(None)
        # decompose freetype outline
        start=0
        pts=ol.points; tags=ol.tags
        for end in ol.contours:
            c=list(range(start,end+1)); start=end+1
            P=[(pts[i][0]+EMB//4,pts[i][1]+EMB//4) for i in c]  # shift so sidebearing grows evenly, baseline compensated
            T=[tags[i]&1 for i in c]
            # rotate so first point is on-curve
            k=T.index(1); P=P[k:]+P[:k]; T=T[k:]+T[:k]
            pen.moveTo(P[0]); offs=[]
            for p,t in zip(P[1:]+[P[0]],T[1:]+[1]):
                if t: 
                    (pen.qCurveTo(*offs,p) if offs else pen.lineTo(p)); offs=[]
                else: offs.append(p)
            pen.closePath()
        ng=pen.glyph(); glyf.glyphs[name]=ng; ng.recalcBounds(glyf)
        adv,lsb=hmtx[name]; hmtx.metrics[name]=(adv+EMB//2, ng.xMin)
# baseline shift fix: moved y by EMB//4 upward; emboldening grows both ways so net fine.
# --- cmap
sub=CmapSubtable.newSubtable(4); sub.platformID=3; sub.platEncID=1; sub.language=0; sub.cmap=cmap
sub0=CmapSubtable.newSubtable(4); sub0.platformID=0; sub0.platEncID=3; sub0.language=0; sub0.cmap=cmap
f['cmap'].tables=[sub0,sub]
fam,style=FAMILY_STYLE.split(':')
name=f['name']
for nid,val in {1:fam,2:style,4:f"{fam} {style}",6:(fam+'-'+style).replace(' ','')}.items():
    name.setName(val,nid,3,1,0x409); name.setName(val,nid,1,0,0)
f['OS/2'].usWeightClass=WEIGHT
f['post'].formatType=3.0
f.flavor='woff2'; f.save(OUT); print('saved',OUT,len(order))
