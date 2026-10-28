import type {ExportData,PaymentType} from './types';
export function getPaymentTypeLabel(type:PaymentType):string {return {equalPayment:'원리금균등',equalPrincipal:'원금균등',maturity:'만기일시',stepUp:'체증식'}[type];}
export function generateFileName(data:ExportData,format:'xlsx'|'pdf'):string {
 const d=data.generatedAt;const time=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0'),String(d.getHours()).padStart(2,'0'),String(d.getMinutes()).padStart(2,'0'),String(d.getSeconds()).padStart(2,'0')].join('');
 return `대출상환_${getPaymentTypeLabel(data.loanParams.paymentType)}_${time}.${format}`;
}
export function formatDateTime(date:Date):string {return new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(date);}
export function formatCurrency(amount:number):string {return new Intl.NumberFormat('ko-KR',{maximumFractionDigits:0}).format(amount);}
export function downloadFile(blob:Blob,fileName:string):void {
 const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=fileName;
 try{document.body.appendChild(link);link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
}
