import test from 'node:test';import assert from 'node:assert/strict';
import {calculateLoan,calculateDraft,DEFAULT_LOAN_DRAFT,toMonths} from '../src/app/lib/loanCalculation.ts';
import type {PaymentType} from '../src/app/lib/types.ts';
const types:PaymentType[]=['equalPayment','equalPrincipal','maturity','stepUp'];
// Independent oracle: iterative unrounded cash flow with bisection for payment/slope;
// exact BigInt rational rounding for each monthly interest amount.
function interest(balance:number,rate:number):number {const scaled=BigInt(Math.round(rate*1e6)),den=1_200_000_000n;return Number((BigInt(balance)*scaled+den/2n)/den);}
function reference(P:number,rate:number,n:number,g:number,type:PaymentType){
 const r=rate/1200,m=n-g,first=P*r;let fixed=0,slope=0;
 if(type==='equalPayment'){
  if(!r)fixed=Math.round(P/m);
  else {let low=0,high=P*(1+r);for(let k=0;k<90;k++){const payment=(low+high)/2;let balance=P;for(let j=0;j<m;j++)balance=balance*(1+r)-payment;if(balance>0)low=payment;else high=payment;}fixed=Math.round((low+high)/2);}
 }
 if(type==='stepUp'&&m>1){let low=0,high=P;for(let k=0;k<90;k++){const d=(low+high)/2;let balance=P;for(let i=0;i<m;i++)balance=balance*(1+r)-(first+d*i);if(balance>0)low=d;else high=d;}slope=(low+high)/2;}
 let balance=P;const rows=[];
 for(let month=1;month<=n;month++){const i=interest(balance,rate);let principal=0;if(month===n)principal=balance;else if(month>g&&type!=='maturity'){const payment=type==='equalPayment'?fixed:Math.round(first+slope*(month-g-1));principal=type==='equalPrincipal'?Math.floor(P/m):Math.max(0,Math.min(balance,payment-i));}balance-=principal;rows.push({month,payment:principal+i,principal,interest:i,remainingBalance:balance});}
 return rows;
}
test('all four repayment modes match independent reference with and without grace',()=>{
 for(const paymentType of types)for(const graceMonths of [0,2])for(const [principal,interestRate,months] of [[120000,12,12],[50000000,3.5,36]] as const){
  const result=calculateLoan({principal,interestRate,months,graceMonths,paymentType});assert.deepEqual(result.schedule,reference(principal,interestRate,months,graceMonths,paymentType),`${paymentType} grace${graceMonths}`);
 }
});
test('zero APR and single repayment month always repay exact principal',()=>{
 for(const paymentType of types)for(const months of [1,2,12])for(const graceMonths of [0,months-1]){
  const r=calculateLoan({principal:12345,interestRate:0,months,graceMonths,paymentType});assert.equal(r.totalInterest,0);assert.equal(r.totalPayment,12345);assert.equal(r.schedule.at(-1)?.remainingBalance,0);assert.equal(r.schedule.reduce((s,x)=>s+x.principal,0),12345);
 }
});
test('integer KRW rounding, large balances and 600 months keep every accounting identity',()=>{
 for(const paymentType of types)for(const graceMonths of [0,599]){
  const r=calculateLoan({principal:1_000_000_000_000,interestRate:100,months:600,graceMonths,paymentType});let balance=1_000_000_000_000;
  for(const row of r.schedule){assert.equal(row.interest,interest(balance,100));assert.equal(row.payment,row.principal+row.interest);assert.equal(row.remainingBalance,balance-row.principal);assert.ok(Object.values(row).every(Number.isSafeInteger));assert.ok(row.remainingBalance>=0);balance=row.remainingBalance;}
  assert.equal(balance,0);assert.equal(r.totalPayment-r.totalInterest,1_000_000_000_000);
 }
 const half=calculateLoan({principal:10000,interestRate:.06,months:1,graceMonths:0,paymentType:'maturity'});assert.equal(half.totalInterest,1);
});
test('finite/safe periods and grace cannot be bypassed with NaN, Infinity, fractions or trailing text',()=>{
 const base={principal:100000,interestRate:3.5,months:12,graceMonths:0,paymentType:'equalPayment' as const};
 for(const field of ['principal','interestRate','months','graceMonths'] as const)for(const value of [NaN,Infinity,-Infinity])assert.throws(()=>calculateLoan({...base,[field]:value}));
 for(const months of [0,-1,1.5,601,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>calculateLoan({...base,months}));
 for(const graceMonths of [-1,.5,12,100])assert.throws(()=>calculateLoan({...base,graceMonths}));
 for(const principal of [0,-1,.5,1e12+1])assert.throws(()=>calculateLoan({...base,principal}));
 for(const field of ['principal','interestRate','loanTerm','gracePeriod'] as const)assert.throws(()=>calculateDraft({...DEFAULT_LOAN_DRAFT,[field]:'12junk'}));
 assert.throws(()=>calculateDraft({...DEFAULT_LOAN_DRAFT,gracePeriod:'NaN'}));assert.throws(()=>toMonths(31,'일'));assert.throws(()=>toMonths(1.5,'개월'));assert.equal(toMonths(.5,'년'),6);assert.equal(toMonths(60,'일'),2);
});
test('tiny APR is finite and decimal unit conversion remains exact in KRW',()=>{
 for(const interestRate of [.000001,1e-20,1e-30,1e-40,1e-45,1e-46,1e-47,1e-48,1e-100,Number.MIN_VALUE])for(const paymentType of types){const r=calculateLoan({principal:100000,interestRate,months:600,graceMonths:0,paymentType});assert.equal(r.schedule.at(-1)?.remainingBalance,0);assert.ok(Number.isFinite(r.totalPayment));if(interestRate<1e-19)assert.deepEqual(r,calculateLoan({principal:100000,interestRate:0,months:600,graceMonths:0,paymentType}));}
 for(const paymentType of types)assert.deepEqual(calculateLoan({principal:1e12,interestRate:1e-45,months:600,graceMonths:0,paymentType}),calculateLoan({principal:1e12,interestRate:0,months:600,graceMonths:0,paymentType}));
 assert.equal(calculateDraft({...DEFAULT_LOAN_DRAFT,principal:'0.0003'}).loanParams.principal,3);
});

test('principal is an exact whole won within the cap before Number conversion',()=>{
 for(const principal of ['0.000100000000000000000001','0.000099999999999999999999','100000000.000000000001','99999999.999999999999','0.0001'+'0'.repeat(80)+'1','100000000.'+'0'.repeat(80)+'1'])assert.throws(()=>calculateDraft({...DEFAULT_LOAN_DRAFT,principal}));
 for(const principal of ['0.000000010000000000000001','10000.0000000000000001'])assert.throws(()=>calculateDraft({...DEFAULT_LOAN_DRAFT,principal,principalUnit:'억원'}));
 for(const [principal,principalUnit,expected] of [['0.0001000','만원',1],['100000000','만원',1e12],['0.00000001','억원',1],['10000','억원',1e12]] as const)assert.equal(calculateDraft({...DEFAULT_LOAN_DRAFT,principal,principalUnit}).loanParams.principal,expected);
});

test('raw period decimals and APR caps are checked before Number rounding',()=>{
 for(const [loanTerm,loanTermUnit] of [['1.00000000000000000001','개월'],['30.00000000000000000001','일'],['0.50000000000000000000001','년'],['1.'+'0'.repeat(80)+'1','개월']] as const)assert.throws(()=>calculateDraft({...DEFAULT_LOAN_DRAFT,loanTerm,loanTermUnit}));
 assert.throws(()=>calculateDraft({...DEFAULT_LOAN_DRAFT,gracePeriod:'1.00000000000000000001'}));
 assert.throws(()=>calculateDraft({...DEFAULT_LOAN_DRAFT,interestRate:'100.000000000000000000001'}));
 assert.throws(()=>calculateDraft({...DEFAULT_LOAN_DRAFT,interestRate:'0.'+'0'.repeat(400)+'1'}));
 for(const [loanTerm,loanTermUnit,months] of [['0.25','년',3],['0.5','년',6],['0.75','년',9],['60.0000','일',2],['12.000','개월',12]] as const)assert.equal(calculateDraft({...DEFAULT_LOAN_DRAFT,loanTerm,loanTermUnit}).loanParams.normalizedMonths,months);
});

test('APR raw Decimal roundtrip rejects lost precision at an exact half-won boundary',()=>{
 const base={...DEFAULT_LOAN_DRAFT,principal:'1',loanTerm:'1',gracePeriod:'',paymentType:'maturity' as const};
 // Independent exact rational APR parser and half-up interest, with no Number cast.
 const exactInterest=(apr:string)=>{const [whole,fraction='']=apr.split('.');const numerator=BigInt(whole+fraction)*10000n,denominator=1200n*10n**BigInt(fraction.length);return Number((2n*numerator+denominator)/(2n*denominator));};
 const lossy='0.059999999999999999999';assert.equal(exactInterest(lossy),0);assert.equal(exactInterest(Number(lossy).toString()),1);
 assert.throws(()=>calculateDraft({...base,interestRate:lossy}),/정밀도/);
 for(const interestRate of ['0.05999999999999999','0.06','0.06000000000000001','0.1'])assert.equal(calculateDraft({...base,interestRate}).results.totalInterest,exactInterest(interestRate));
 assert.equal(calculateDraft({...base,interestRate:'0.'+'0'.repeat(44)+'1'}).loanParams.interestRate,1e-45);
 assert.equal(calculateDraft({...base,interestRate:'00.1000'}).loanParams.interestRate,.1);
});
