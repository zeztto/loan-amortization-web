import Decimal from 'decimal.js';
import type {LoanInput,LoanDraft,LoanParams,LoanResults,PaymentSchedule,PeriodUnit} from './types';
import {getPaymentTypeLabel} from './exportUtils';
const D=Decimal.clone({precision:50,rounding:Decimal.ROUND_HALF_UP});
export const DEFAULT_LOAN_DRAFT:LoanDraft={principal:'5000',principalUnit:'만원',interestRate:'3.5',loanTerm:'36',loanTermUnit:'개월',gracePeriod:'',gracePeriodUnit:'개월',paymentType:'equalPayment'};
const integer=(value:number)=>Number.isSafeInteger(value);
const whole=(value:Decimal)=>value.toDecimalPlaces(0,Decimal.ROUND_HALF_UP).toNumber();
export function validateLoanInput(input:LoanInput):void {
 if(!integer(input.principal)||input.principal<=0||input.principal>1_000_000_000_000)throw new Error('대출 금액은 원 단위의 양수이며 최대 1조 원입니다.');
 if(!Number.isFinite(input.interestRate)||input.interestRate<0||input.interestRate>100)throw new Error('연 이자율은 0~100%의 유한한 숫자여야 합니다.');
 if(!integer(input.months)||input.months<1||input.months>600)throw new Error('대출 기간은 1~600개월의 정수여야 합니다.');
 if(!integer(input.graceMonths)||input.graceMonths<0||input.graceMonths>=input.months)throw new Error('거치 기간은 0 이상이며 대출 기간보다 짧은 정수 개월이어야 합니다.');
 if(!['equalPayment','equalPrincipal','maturity','stepUp'].includes(input.paymentType))throw new Error('지원하는 상환 방식을 선택해 주세요.');
}
export function calculateLoan(input:LoanInput):LoanResults {
 validateLoanInput(input);const {principal:P,months:n,graceMonths:g,paymentType:type}=input;
 const rawRate=new D(input.interestRate.toString()).div(1200);
 // Below this limit, max principal × monthly rate < 1e-18 won.
 // Interest rounds to zero; nominal-payment changes are also far below the
 // nearest half-won boundary for <=600 periods. The zero-rate limit avoids
 // cancellation in 1-(1+r)^(-m) without changing whole-won cash flows.
 const rate=rawRate.lt('1e-30')?new D(0):rawRate,m=n-g,amount=new D(P),schedule:PaymentSchedule[]=[];
 const annuityDenominator=new D(1).sub(new D(1).add(rate).pow(-m));
 let balance=P;const annuity=annuityDenominator.isZero()?amount.div(m):amount.mul(rate).div(annuityDenominator);
 const first=amount.mul(rate);let slope=new D(0);
 if(type==='stepUp'&&m>1){let factors=new D(0),weighted=new D(0);for(let i=0;i<m;i++){const discount=new D(1).add(rate).pow(-(i+1));factors=factors.add(discount);weighted=weighted.add(discount.mul(i));}slope=amount.sub(first.mul(factors)).div(weighted);}
 for(let month=1;month<=n;month++){
  const interest=whole(new D(balance).mul(rate));let paidPrincipal=0;
  if(month===n)paidPrincipal=balance;
  else if(month>g&&type!=='maturity'){
   if(type==='equalPrincipal')paidPrincipal=Math.floor(P/m);
   else {const requested=type==='equalPayment'?whole(annuity):whole(first.add(slope.mul(month-g-1)));paidPrincipal=Math.max(0,Math.min(balance,requested-interest));}
  }
  balance-=paidPrincipal;const payment=paidPrincipal+interest;
  if(![payment,paidPrincipal,interest,balance].every(integer))throw new Error('계산 결과가 안전한 원 단위 범위를 벗어났습니다.');
  schedule.push({month,payment,principal:paidPrincipal,interest,remainingBalance:balance});
 }
 const totalInterest=schedule.reduce((sum,row)=>sum+row.interest,0),totalPayment=schedule.reduce((sum,row)=>sum+row.payment,0);
 if(!integer(totalInterest)||!integer(totalPayment)||balance!==0||schedule.reduce((sum,row)=>sum+row.principal,0)!==P)throw new Error('상환표 검증에 실패했습니다.');
 return {totalInterest,totalPayment,monthlyPayment:schedule[g].payment,schedule};
}
function parse(text:string,name:string,emptyZero=false):number {
 const clean=text.trim().replace(/,/g,'');if(emptyZero&&clean==='')return 0;
 if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(clean))throw new Error(`${name}에 유효한 숫자를 입력해 주세요.`);
 const value=Number(clean);if(!Number.isFinite(value)||(value===0&&/[1-9]/.test(clean)))throw new Error(`${name}의 숫자 범위를 확인해 주세요.`);return value;
}
export function toMonths(value:number,unit:PeriodUnit):number {
 const months=unit==='년'?value*12:unit==='일'?value/30:unit==='개월'?value:NaN;
 if(!Number.isSafeInteger(months))throw new Error('월 단위로 나누어떨어지는 기간을 입력해 주세요. 1년=12개월, 30일=1개월로 계산합니다.');return months;
}
function draftMonths(text:string,unit:PeriodUnit):number {
 const clean=text.trim().replace(/,/g,'')||'0',fraction=(clean.split('.')[1]||'').replace(/0+$/,'');
 // A finite decimal year can convert to whole months only at quarter-year steps.
 // Months/days must already be whole numbers; days must also be divisible by30.
 if(unit==='년'?!['','25','5','75'].includes(fraction):fraction!=='')throw new Error('월 단위로 나누어떨어지는 기간을 입력해 주세요. 1년=12개월, 30일=1개월로 계산합니다.');
 const value=new D(clean),months=unit==='년'?value.mul(12):unit==='일'?value.div(30):value;
 if(!months.isInteger())throw new Error('월 단위로 나누어떨어지는 기간을 입력해 주세요. 1년=12개월, 30일=1개월로 계산합니다.');
 return months.toNumber();
}
export function calculateDraft(draft:LoanDraft):{loanParams:LoanParams;results:LoanResults} {
 parse(draft.principal,'대출 금액');
 const principalText=draft.principal.trim().replace(/,/g,''),scale=draft.principalUnit==='만원'?4:8;
 // Check exact decimal digits before arithmetic can round a long fractional tail.
 // Only trailing zeros may remain after the unit's power-of-ten shift.
 if(/[1-9]/.test((principalText.split('.')[1]||'').slice(scale)))throw new Error('대출 금액은 원 단위의 양수이며 최대 1조 원입니다.');
 const principalDecimal=new D(principalText).mul(scale===4?10000:100000000);
 if(!principalDecimal.isInteger()||!principalDecimal.gt(0)||principalDecimal.gt('1000000000000'))throw new Error('대출 금액은 원 단위의 양수이며 최대 1조 원입니다.');
 const principal=principalDecimal.toNumber(),interestRate=parse(draft.interestRate,'연 이자율'),loanTerm=parse(draft.loanTerm,'대출 기간'),gracePeriod=parse(draft.gracePeriod,'거치 기간',true);
 const rawAPR=new D(draft.interestRate.trim().replace(/,/g,''));
 if(rawAPR.gt(100))throw new Error('연 이자율은 0~100%의 유한한 숫자여야 합니다.');
 if(!rawAPR.eq(new D(interestRate.toString())))throw new Error('연 이자율의 정밀도가 지원 범위를 벗어났습니다. 소수 자릿수를 줄여 주세요.');
 const months=draftMonths(draft.loanTerm,draft.loanTermUnit),graceMonths=draftMonths(draft.gracePeriod,draft.gracePeriodUnit);
 const results=calculateLoan({principal,interestRate,months,graceMonths,paymentType:draft.paymentType});
 return {loanParams:{principal,principalDisplay:`${draft.principal}${draft.principalUnit}`,interestRate,loanTerm,loanTermUnit:draft.loanTermUnit,gracePeriod,gracePeriodUnit:draft.gracePeriodUnit,paymentType:draft.paymentType,paymentTypeLabel:getPaymentTypeLabel(draft.paymentType),normalizedMonths:months,normalizedGraceMonths:graceMonths},results};
}
