"""Build public/models/names-zh.json (FJ/FMA id -> Chinese name) from data/anatomy-zh.tsv.
Left/right are stripped before lookup and re-added as a 左/右 prefix."""
import json,re,pathlib
root=pathlib.Path(__file__).resolve().parent.parent
terms=dict(line.rstrip('\n').split('\t',1) for line in open(root/'data/anatomy-zh.tsv',encoding='utf-8'))
atlas=json.load(open(root/'public/models/atlas.json'))
def zh(name):
  side='左' if re.search(r'\bleft\b',name,re.I) else '右' if re.search(r'\bright\b',name,re.I) else ''
  base=re.sub(r'^(left|right) ','',name,flags=re.I)
  base=re.sub(r'\b(of |)(left|right) ',r'\1',base,flags=re.I).strip().lower()
  return side+terms[base] if base in terms else None
out={}
for p in atlas['parts']:
  out[p['id']]=zh(p['name']) or p['name']
for c in atlas['concepts']:
  if (z:=zh(c['name'])):out[c['id']]=z
json.dump(out,open(root/'public/models/names-zh.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(len(out),'names;',sum(1 for p in atlas['parts'] if zh(p['name'])),'/',len(atlas['parts']),'parts translated')
