export type PaymentType='equalPrincipal'|'equalPayment'|'maturity'|'stepUp';
export type PeriodUnit='년'|'개월'|'일';
export interface PaymentSchedule {month:number;payment:number;principal:number;interest:number;remainingBalance:number;}
export interface LoanInput {principal:number;interestRate:number;months:number;graceMonths:number;paymentType:PaymentType;}
export interface LoanDraft {principal:string;principalUnit:'만원'|'억원';interestRate:string;loanTerm:string;loanTermUnit:PeriodUnit;gracePeriod:string;gracePeriodUnit:PeriodUnit;paymentType:PaymentType;}
export interface LoanParams {principal:number;principalDisplay:string;interestRate:number;loanTerm:number;loanTermUnit:PeriodUnit;gracePeriod:number;gracePeriodUnit:PeriodUnit;paymentType:PaymentType;paymentTypeLabel:string;normalizedMonths:number;normalizedGraceMonths:number;}
export interface LoanResults {totalInterest:number;totalPayment:number;monthlyPayment:number;schedule:PaymentSchedule[];}
export interface ExportData {generatedAt:Date;loanParams:LoanParams;results:LoanResults;}
export interface ExportOptions {format:'xlsx'|'pdf';fileName?:string;}
