import test from 'node:test';import assert from 'node:assert/strict';import {unzipSync,strFromU8} from 'fflate';import {mkdir,writeFile} from 'node:fs/promises';
import {calculateDraft,DEFAULT_LOAN_DRAFT} from '../src/app/lib/loanCalculation.ts';
import {buildExcel} from '../src/app/lib/excelExport.ts';import {buildPDF} from '../src/app/lib/pdfExport.ts';
import {generateFileName,downloadFile} from '../src/app/lib/exportUtils.ts';
import type {ExportData} from '../src/app/lib/types.ts';
const data:ExportData={generatedAt:new Date('2026-01-01T00:00:00.000Z'),...calculateDraft({...DEFAULT_LOAN_DRAFT,principal:'12',interestRate:'12',loanTerm:'12',gracePeriod:'2'})};
async function preserve(name:string,bytes:Uint8Array){const directory=process.env.EXPORT_EVIDENCE_DIR;if(directory){await mkdir(directory,{recursive:true});await writeFile(`${directory}/${name}`,bytes);}}
function textCell(files:Record<string,Uint8Array>,xml:string,address:string):string {const match=xml.match(new RegExp(`<c\\b[^>]*\\br="${address}"[^>]*>([\\s\\S]*?)</c>`));assert.ok(match);assert.match(match[0],/\bt="s"/);const index=Number(match[1].match(/<v>([^<]+)<\/v>/)![1]);const strings=[...strFromU8(files['xl/sharedStrings.xml']).matchAll(/<si>([\s\S]*?)<\/si>/g)].map(item=>[...item[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map(t=>t[1]).join(''));return strings[index];}
function numberCell(xml:string,address:string):number {const match=xml.match(new RegExp(`<c\\b[^>]*\\br="${address}"[^>]*>([\\s\\S]*?)</c>`));assert.ok(match,`missing ${address}`);assert.doesNotMatch(match[0],/\bt="(?:s|inlineStr)"/);const value=match[1].match(/<v>([^<]+)<\/v>/);assert.ok(value);return Number(value[1]);}
test('actual XLSX ZIP/OpenXML contains numeric KRW schedule cells and truthful .xlsx filename',async()=>{
 const bytes=await buildExcel(data);assert.deepEqual([...bytes.subarray(0,4)],[0x50,0x4b,3,4]);assert.match(generateFileName(data,'xlsx'),/\.xlsx$/);
 const files=unzipSync(bytes);const workbook=strFromU8(files['xl/workbook.xml']);assert.match(workbook,/요약/);assert.match(workbook,/상환일정표/);
 const sheet=strFromU8(files['xl/worksheets/sheet2.xml']),summary=strFromU8(files['xl/worksheets/sheet1.xml']),styles=strFromU8(files['xl/styles.xml']);
 assert.equal(numberCell(sheet,'A2'),1);assert.equal(numberCell(sheet,'B2'),1200);assert.equal(numberCell(sheet,'C2'),0);assert.equal(numberCell(sheet,'D2'),1200);assert.equal(numberCell(sheet,'E13'),0);
 let principal=0,total=0,interest=0;for(let row=2;row<=13;row++){principal+=numberCell(sheet,`C${row}`);total+=numberCell(sheet,`B${row}`);interest+=numberCell(sheet,`D${row}`);}
 assert.equal(principal,120000);assert.equal(total,data.results.totalPayment);assert.equal(interest,data.results.totalInterest);assert.equal(numberCell(summary,'B3'),120000);assert.equal(numberCell(summary,'B10'),interest);assert.match(styles,/₩/);assert.match(sheet,/pane/);
 assert.equal(textCell(files,summary,'B4'),'12%');
 const tiny=await buildExcel({generatedAt:data.generatedAt,...calculateDraft({...DEFAULT_LOAN_DRAFT,interestRate:'0.'+'0'.repeat(44)+'1'})});const tinyFiles=unzipSync(tiny),tinySummary=strFromU8(tinyFiles['xl/worksheets/sheet1.xml']);assert.equal(textCell(tinyFiles,tinySummary,'B4'),'1e-45%');
 await preserve('loan-reference.xlsx',bytes);
});
test('actual PDF has PDF header, embedded Unicode TTF mapping and a valid page tree',async()=>{
 const bytes=buildPDF(data);assert.equal(new TextDecoder().decode(bytes.subarray(0,5)),'%PDF-');const text=new TextDecoder('latin1').decode(bytes);assert.match(text,/\/Type\s*\/Catalog/);assert.match(text,/\/Type\s*\/Page\b/);assert.match(text,/\/ToUnicode/);assert.match(text,/\/FontFile2/);assert.match(generateFileName(data,'pdf'),/\.pdf$/);await preserve('loan-reference.pdf',bytes);
});
test('download helper uses the Blob URL/filename and cleans up after success or click failure',()=>{
 // Test-only minimal document; actual UI-triggered downloads are checked separately.
 const previousDocument=Object.getOwnPropertyDescriptor(globalThis,'document');
 const originalTimer=globalThis.setTimeout, originalRevoke=URL.revokeObjectURL;
 const callbacks:Array<()=>void>=[],revoked:string[]=[];
 let clicks=0,removals=0,appends=0,fail=false;
 const anchor={href:'',download:'',click(){clicks++;if(fail)throw new Error('test-only denied click');},remove(){removals++;}};
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement(name:string){assert.equal(name,'a');return anchor;},body:{appendChild(node:unknown){assert.equal(node,anchor);appends++;}}}});
 globalThis.setTimeout=((callback:()=>void,delay:number)=>{assert.equal(delay,1000);callbacks.push(callback);return 0;}) as unknown as typeof setTimeout;
 URL.revokeObjectURL=(url:string)=>{revoked.push(url);originalRevoke(url);};
 try {
  downloadFile(new Blob(['synthetic export bytes']), 'synthetic.xlsx');
  const firstURL=anchor.href;assert.match(firstURL,/^blob:/);assert.equal(anchor.download,'synthetic.xlsx');assert.equal(clicks,1);assert.equal(removals,1);assert.equal(appends,1);assert.equal(revoked.length,0);callbacks.shift()!();assert.deepEqual(revoked,[firstURL]);
  fail=true;assert.throws(()=>downloadFile(new Blob(['synthetic PDF bytes']),'synthetic.pdf'),/denied click/);
  const secondURL=anchor.href;assert.equal(anchor.download,'synthetic.pdf');assert.equal(removals,2);assert.equal(clicks,2);callbacks.shift()!();assert.deepEqual(revoked,[firstURL,secondURL]);
 }finally{
  globalThis.setTimeout=originalTimer;URL.revokeObjectURL=originalRevoke;
  if(previousDocument)Object.defineProperty(globalThis,'document',previousDocument);else Reflect.deleteProperty(globalThis,'document');
 }
});
