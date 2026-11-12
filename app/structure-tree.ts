import {SYSTEMS,type Atlas,type Part,type SystemId} from './anatomy';

/** Body regions used to break each system into small, browsable groups. */
export type RegionId='head'|'neck'|'thorax'|'abdomen'|'pelvis'|'upper-left'|'upper-right'|'lower-left'|'lower-right';
export const REGIONS:{id:RegionId;name:string}[]=[
 {id:'head',name:'头部'},{id:'neck',name:'颈部'},{id:'thorax',name:'胸部'},{id:'abdomen',name:'腹部'},{id:'pelvis',name:'盆部'},
 {id:'upper-left',name:'左上肢'},{id:'upper-right',name:'右上肢'},{id:'lower-left',name:'左下肢'},{id:'lower-right',name:'右下肢'},
];

/** Classify a mesh by the centre of its bounding box (model units are metres; +x is the body's left). */
export function regionOf(p:Part):RegionId{
 const x=(p.bounds[0][0]+p.bounds[1][0])/2,y=(p.bounds[0][1]+p.bounds[1][1])/2;
 if(y>1.4&&/^(atlas|axis)$|cervical|hyoid/i.test(p.name))return 'neck';
 if(y>1.5)return 'head';
 if(y>1.4)return 'neck';
 if(Math.abs(x)>.18&&y>.7)return x>0?'upper-left':'upper-right';
 if(y>1.15)return 'thorax';
 if(y>.95)return 'abdomen';
 if(y>.8)return 'pelvis';
 return x>0?'lower-left':'lower-right';
}

export interface RegionGroup {id:RegionId;name:string;parts:Part[]}
export interface SystemGroup {id:SystemId;name:string;color:string;parts:Part[];regions:RegionGroup[]}

export function buildTree(atlas:Atlas):SystemGroup[]{
 return SYSTEMS.map(s=>{
  const parts=atlas.parts.filter(p=>p.system===s.id).sort((a,b)=>(a.zh??a.name).localeCompare(b.zh??b.name,'zh-CN'));
  const regions=REGIONS.map(r=>({...r,parts:parts.filter(p=>regionOf(p)===r.id)})).filter(r=>r.parts.length>0);
  return {id:s.id,name:SYSTEM_ZH[s.id],color:s.color,parts,regions};
 }).filter(s=>s.parts.length>0);
}

export const SYSTEM_ZH:Record<SystemId,string>={
 skeletal:'骨骼',muscular:'肌肉',cardiac:'心脏',sensory:'感觉器官',arterial:'动脉',venous:'静脉',nervous:'神经系统',respiratory:'呼吸系统',
 digestive:'消化系统',urinary:'泌尿系统',lymphatic:'淋巴系统',endocrine:'内分泌',reproductive:'生殖系统',integumentary:'体表',connective:'结缔组织',
};

/** One-tap organ shortcuts. Each entry unions the named BodyParts3D concepts. */
export const QUICK_ORGANS:{name:string;concepts:string[]}[]=[
 {name:'心脏',concepts:['heart']},{name:'大脑',concepts:['brain']},{name:'肺',concepts:['right lung','left lung']},
 {name:'肝',concepts:['liver']},{name:'胃',concepts:['stomach']},{name:'肾',concepts:['kidney']},
 {name:'脾',concepts:['spleen']},{name:'胰腺',concepts:['pancreas']},{name:'胆囊',concepts:['gallbladder']},
 {name:'食管',concepts:['esophagus']},{name:'小肠',concepts:['small intestine']},{name:'大肠',concepts:['large intestine']},
 {name:'膀胱',concepts:['urinary bladder']},{name:'气管',concepts:['trachea']},{name:'膈肌',concepts:['diaphragm']},
 {name:'眼球',concepts:['left eyeball']},{name:'脊髓',concepts:['spinal cord']},{name:'小脑',concepts:['cerebellum']},
 {name:'颅骨',concepts:['skull']},{name:'脊柱',concepts:['vertebral column']},{name:'胸廓',concepts:['rib cage']},
 {name:'骨盆',concepts:['pelvis']},{name:'牙齿',concepts:['tooth']},{name:'主动脉',concepts:['aorta']},
];

export function quickOrganParts(atlas:Atlas,concepts:string[]){
 const ids=new Set<string>(),known=new Set(atlas.parts.map(p=>p.id));
 for(const name of concepts)atlas.concepts.find(c=>c.name.toLowerCase()===name)?.elements.forEach(id=>{if(known.has(id))ids.add(id);});
 return [...ids];
}
