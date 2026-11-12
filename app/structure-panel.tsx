import {useMemo,useState} from 'react';
import {ChevronDown,ChevronRight,Eye} from 'lucide-react';
import {Button} from '@/components/ui/button';
import type {Atlas} from './anatomy';
import {buildTree,QUICK_ORGANS,quickOrganParts} from './structure-tree';

interface Props {
 atlas:Atlas;
 onGroup:(name:string,ids:string[])=>void;
 onPart:(id:string)=>void;
 onSystem:(id:string)=>void;
}

/** Expandable system → region → structure tree. Every row is a button. */
export function StructurePanel({atlas,onGroup,onPart,onSystem}:Props){
 const tree=useMemo(()=>buildTree(atlas),[atlas]);
 const quick=useMemo(()=>QUICK_ORGANS.map(o=>({...o,ids:quickOrganParts(atlas,o.concepts)})).filter(o=>o.ids.length>0),[atlas]);
 const [open,setOpen]=useState<Record<string,boolean>>({});
 const flip=(key:string)=>setOpen(o=>({...o,[key]:!o[key]}));
 return <div className="structure-tree">
  <div className="tree-label">常用器官 · 点一下单独查看</div>
  <div className="quick-organs">{quick.map(o=><Button variant="ghost" key={o.name} onClick={()=>onGroup(o.name,o.ids)}>{o.name}</Button>)}</div>
  <div className="tree-label">按系统和部位展开</div>
  {tree.map(s=><div className="tree-system" key={s.id}>
   <div className="tree-row level-0">
    <Button variant="ghost" className="tree-toggle" aria-expanded={!!open[s.id]} onClick={()=>flip(s.id)}>
     {open[s.id]?<ChevronDown size={14}/>:<ChevronRight size={14}/>}<span className="system-dot" style={{background:s.color}}/>{s.name}<span className="system-count">{s.parts.length}</span>
    </Button>
    <Button variant="ghost" className="tree-eye" title={`只显示${s.name}`} aria-label={`只显示${s.name}`} onClick={()=>onSystem(s.id)}><Eye size={14}/></Button>
   </div>
   {open[s.id]&&s.regions.map(r=>{const key=`${s.id}/${r.id}`;return <div key={key}>
    <div className="tree-row level-1">
     <Button variant="ghost" className="tree-toggle" aria-expanded={!!open[key]} onClick={()=>flip(key)}>
      {open[key]?<ChevronDown size={13}/>:<ChevronRight size={13}/>}{r.name}<span className="system-count">{r.parts.length}</span>
     </Button>
     <Button variant="ghost" className="tree-eye" title={`单独查看${s.name}·${r.name}`} aria-label={`单独查看${s.name}·${r.name}`} onClick={()=>onGroup(`${s.name} · ${r.name}`,r.parts.map(p=>p.id))}><Eye size={13}/></Button>
    </div>
    {open[key]&&<div className="tree-leaves">{r.parts.map(p=><Button variant="ghost" key={p.id} className="tree-leaf" onClick={()=>onPart(p.id)} title={p.name}>{p.zh??p.name}</Button>)}</div>}
   </div>;})}
  </div>)}
 </div>;
}
