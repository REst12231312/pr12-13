// Самопроверка №4: запустите при работающем Expo. Проверка создаёт одну учебную находку.
import { readFileSync,writeFileSync,readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { campusClock } from '../src/lib/clock.ts';
const root=fileURLToPath(new URL('..',import.meta.url));
const base=(process.argv[2]??'http://localhost:8081').replace(/\/$/,'');
const number=JSON.parse(readFileSync(join(root,'variant.json'),'utf8')).variant;
const data=JSON.parse(readFileSync(join(root,'src/data/seed.json'),'utf8')).variants[number];
const rows=[];let failed=0;
function report(ok,name,detail=''){rows.push({ok,name,detail});if(!ok)failed++;console.log(`${ok?'[OK]':'[!!]'} ${name}${detail?': '+detail:''}`)}
async function request(path,body){try{let r=await fetch(base+path,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return{status:r.status,body:await r.json().catch(()=>null)}}catch{return{status:0,body:null}}}
report(Boolean(data),'Вариант',String(number));
if(data){
 const health=await request('/api/health');report(health.status===200,'Готовый сервер №3',String(health.status));
 if(health.status===200){
  console.log('[INFO] Хранилище: '+health.body.store+'. Реальный SecureStore проверяется на телефоне.');
  const before=await request('/api/items');const ids=new Set(before.body?.items?.map(x=>x._id)??[]);
  report(before.status===200&&data.items.every(x=>ids.has(x._id)),'Исходные находки №3 не потеряны');
  const valid={title:'Самопроверка заявки',category:data.categories[0].id,description:'Учебный предмет для проверки формы',extra:number===1?'214':number===4?'00:00':'А-101',foundAt:campusClock().date,detail:number===2?'INV-001':'',phone:'+70000000000',handedToOffice:false};
  const large=await request('/api/items',{...valid,description:'x'.repeat(9000)});
  report(large.status===413,'Ограничение размера заявки',String(large.status));
  const missing=await request('/api/items/P04-MISSING');report(missing.status===404,'Несуществующая находка',String(missing.status));
  const bad=await request('/api/items',{...valid,phone:'123'});
  report(bad.status===400&&typeof bad.body?.fieldErrors?.phone==='string','Повторная проверка сервера',`${bad.status}${bad.body?.todo?' '+bad.body.todo:''}`);
  const same=await request('/api/items');report(same.body?.items?.length===before.body?.items?.length,'Отказ не добавляет находку');
  const result=await request('/api/items',valid);report(result.status===201&&result.body?.item?.status==='stored','Создание находки',String(result.status));
  if(result.status===201){
   const detail=await request('/api/items/'+encodeURIComponent(result.body.item._id));
   report(detail.status===200&&detail.body?.item?.title===valid.title,'Чтение новой карточки',String(detail.status));
   const list=await request('/api/items');
   report(!JSON.stringify([result.body,detail.body,list.body]).includes(valid.phone),'Контакт не раскрыт в ответах API');
   console.log('[INFO] Создана учебная находка '+result.body.item._id+'. Она видна в списке.');
  }
 }
 function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)])}
 const source=files(join(root,'src')).filter(f=>/\.(ts|tsx)$/.test(f));
 for(const code of ['P04-SCHEMA','P04-FORM','P04-SERVER','P04-DRAFT','P04-CONTACT']){
  const pending=source.filter(f=>readFileSync(f,'utf8').includes('TODO '+code));report(!pending.length,code,pending.map(f=>f.slice(root.length)).join(', '));
 }
 const leaked=source.filter(f=>/mongodb(?:\+srv)?:\/\/[^\s:@/]+:[^\s@/]+@/.test(readFileSync(f,'utf8')));report(!leaked.length,'В исходниках нет пароля MongoDB');
 try{const tracked=execFileSync('git',['ls-files','--','.'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).split('\n').filter(Boolean);report(!tracked.some(f=>/(^|\/)\.env/.test(f)),'.env не отслеживается Git')}catch{report(false,'Git-репозиторий','Выполните git init и сохраните проект в репозитории.')}
}
writeFileSync(join(root,'check-result.md'),['# Самопроверка практической 04','',`Вариант: ${number}. Адрес: ${base}.`,'','| Результат | Проверка |','|---|---|',...rows.map(r=>`| ${r.ok?'OK':'!!'} | ${r.name} |`),'',`Не пройдено: ${failed}.`,'','Отдельно покажите на телефоне восстановление черновика, серверную ошибку поля, сохранение и удаление контакта.'].join('\n'));
console.log(`Не пройдено: ${failed}. Результат: check-result.md`);process.exitCode=failed?1:0;
