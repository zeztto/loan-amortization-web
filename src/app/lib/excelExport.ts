import writeExcelFile,{type SheetData,type CellObject} from 'write-excel-file/universal';
import type {ExportData} from './types';
import {formatDateTime,downloadFile,generateFileName} from './exportUtils';
const KRW='"₩"#,##0;[Red]-"₩"#,##0';
const money=(value:number):CellObject=>({value,type:Number,format:KRW});
export async function buildExcel(data:ExportData):Promise<Uint8Array> {
 const {loanParams:p,results:r}=data;
 const summary:SheetData=[['대출 상환 계산 결과'],['생성일시',formatDateTime(data.generatedAt)],['대출 금액',money(p.principal)],['연 이자율',`${p.interestRate}%`],['입력 대출 기간',`${p.loanTerm}${p.loanTermUnit}`],['계산 개월',p.normalizedMonths],['거치 개월',p.normalizedGraceMonths],['상환 방식',p.paymentTypeLabel],['거치 후 첫 상환금',money(r.monthlyPayment)],['총 이자',money(r.totalInterest)],['총 상환금액',money(r.totalPayment)],['계산 정책','월별 원 단위 반올림, 마지막 회차 원금 조정'],['기간 환산','1년=12개월, 30일=1개월; 정수 개월만 지원']];
 const schedule:SheetData=[['회차','상환금액','원금','이자','잔액'].map(value=>({value,fontWeight:'bold'})),...r.schedule.map(row=>[row.month,money(row.payment),money(row.principal),money(row.interest),money(row.remainingBalance)])];
 const blob=await writeExcelFile([{data:summary,sheet:'요약',columns:[{width:24},{width:48}]},{data:schedule,sheet:'상환일정표',columns:[{width:10},{width:22},{width:22},{width:22},{width:22}],stickyRowsCount:1}]).toBlob();
 return new Uint8Array(await blob.arrayBuffer());
}
export async function exportToExcel(data:ExportData):Promise<void> {const bytes=await buildExcel(data);downloadFile(new Blob([bytes as BlobPart],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),generateFileName(data,'xlsx'));}
