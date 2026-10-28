import {Card,CardContent,CardDescription,CardHeader,CardTitle} from './ui/card';
import {Label} from './ui/label';import {Input} from './ui/input';import {Button} from './ui/button';
import {Tabs,TabsList,TabsTrigger} from './ui/tabs';import {Calculator,TrendingUp} from 'lucide-react';
import {LoanResults} from './loan-results';import {AmortizationSchedule} from './amortization-schedule';import {ExportButtons} from './export-buttons';
import {useLoanCalculator} from '../../hooks/useLoanCalculator';
import type {LoanDraft} from '../lib/types';
export function LoanCalculator(){
 const {draft,snapshot,error,change,calculate:calculateLoan,reset}=useLoanCalculator();
 const {principal,principalUnit,interestRate,loanTerm,loanTermUnit,gracePeriod,gracePeriodUnit,paymentType}=draft;
 const results=snapshot?.results || null;
 const setPrincipal=(value:string)=>change('principal',value),setPrincipalUnit=(value:LoanDraft['principalUnit'])=>change('principalUnit',value),setInterestRate=(value:string)=>change('interestRate',value),setLoanTerm=(value:string)=>change('loanTerm',value),setLoanTermUnit=(value:LoanDraft['loanTermUnit'])=>change('loanTermUnit',value),setGracePeriod=(value:string)=>change('gracePeriod',value),setGracePeriodUnit=(value:LoanDraft['gracePeriodUnit'])=>change('gracePeriodUnit',value),setPaymentType=(value:LoanDraft['paymentType'])=>change('paymentType',value);
 const handlePrincipalChange=(event:React.ChangeEvent<HTMLInputElement>)=>{const clean=event.target.value.replace(/,/g,'');if(!/^\d*(?:\.\d*)?$/.test(clean)){setPrincipal(event.target.value);return;}const [whole,fraction]=clean.split('.');setPrincipal(whole.replace(/\B(?=(\d{3})+(?!\d))/g,',')+(fraction===undefined?'':'.'+fraction));};
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            대출 정보 입력
          </CardTitle>
          <CardDescription>
            대출 금액, 연이자율, 대출 기간을 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="principal">대출 금액</Label>
            <div className="flex items-center gap-2">
              <Input
                id="principal"
                type="text"
                value={principal}
                onChange={handlePrincipalChange}
                placeholder="예: 5,000"
                className="flex-1"
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  aria-pressed={principalUnit === "만원"}
                  variant={principalUnit === "만원" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPrincipalUnit("만원")}
                  className="whitespace-nowrap"
                >
                  만원
                </Button>
                <Button
                  type="button"
                  aria-pressed={principalUnit === "억원"}
                  variant={principalUnit === "억원" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPrincipalUnit("억원")}
                  className="whitespace-nowrap"
                >
                  억원
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">연 이자율</Label>
            <div className="flex items-center gap-2">
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="예: 3.5"
              />
              <span className="text-muted-foreground whitespace-nowrap">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanTerm">대출 기간</Label>
            <div className="flex items-center gap-2">
              <Input
                id="loanTerm"
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                placeholder="예: 36"
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  aria-pressed={loanTermUnit === "년"}
                  variant={loanTermUnit === "년" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLoanTermUnit("년")}
                  className="whitespace-nowrap"
                >
                  년
                </Button>
                <Button
                  type="button"
                  aria-pressed={loanTermUnit === "개월"}
                  variant={loanTermUnit === "개월" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLoanTermUnit("개월")}
                  className="whitespace-nowrap"
                >
                  개월
                </Button>
                <Button
                  type="button"
                  aria-pressed={loanTermUnit === "일"}
                  variant={loanTermUnit === "일" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLoanTermUnit("일")}
                  className="whitespace-nowrap"
                >
                  일
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gracePeriod">거치 기간</Label>
            <div className="flex items-center gap-2">
              <Input
                id="gracePeriod"
                type="number"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(e.target.value)}
                placeholder="예: 3"
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  aria-pressed={gracePeriodUnit === "년"}
                  variant={gracePeriodUnit === "년" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGracePeriodUnit("년")}
                  className="whitespace-nowrap"
                >
                  년
                </Button>
                <Button
                  type="button"
                  aria-pressed={gracePeriodUnit === "개월"}
                  variant={gracePeriodUnit === "개월" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGracePeriodUnit("개월")}
                  className="whitespace-nowrap"
                >
                  개월
                </Button>
                <Button
                  type="button"
                  aria-pressed={gracePeriodUnit === "일"}
                  variant={gracePeriodUnit === "일" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGracePeriodUnit("일")}
                  className="whitespace-nowrap"
                >
                  일
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>상환 방식</Label>
            <Tabs value={paymentType} onValueChange={(value) => setPaymentType(value as "equalPrincipal" | "equalPayment" | "maturity" | "stepUp")}>
              <TabsList aria-label="상환 방식" className="grid h-auto w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="equalPayment">원리금균등</TabsTrigger>
                <TabsTrigger value="equalPrincipal">원금균등</TabsTrigger>
                <TabsTrigger value="maturity">만기일시</TabsTrigger>
                <TabsTrigger value="stepUp">체증식</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-muted-foreground mt-2">
              {paymentType === "equalPayment" 
                ? "거치 후 매월 같은 상환금을 적용하고 마지막 회차를 조정합니다" 
                : paymentType === "equalPrincipal"
                ? "거치 후 원금을 나누어 상환하고 마지막 회차의 원금 잔여분을 조정합니다"
                : paymentType === "maturity"
                ? "대출 기간 동안 이자만 납부하고 만기일에 원금을 상환합니다"
                : "첫 회차는 이자액으로 시작하고 납부액을 매월 일정액 늘립니다 (상환 1개월은 원금·이자 일시납)"}
            </p>
          </div>

          <p className="text-sm text-muted-foreground">월별 원 단위로 반올림하고 마지막 회차 원금을 조정합니다. 반올림으로 마지막 상환금이 다른 회차보다 커질 수 있습니다. 1년=12개월·30일=1개월이며 정수 개월만 계산합니다. 체증식은 첫 회차 이자액부터 매월 일정액이 증가하는 모형입니다. 실제 상품의 일수·수수료·금리 변동은 포함하지 않습니다.</p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button onClick={calculateLoan} className="w-full">
            <TrendingUp className="w-4 h-4 mr-2" />
            계산하기
          </Button>
          <Button variant="outline" onClick={reset} className="w-full">초기화</Button>
        </CardContent>
      </Card>

      {results && snapshot && (
        <>
          <LoanResults
            totalInterest={results.totalInterest}
            totalPayment={results.totalPayment}
            finalPayment={results.schedule.at(-1)!.payment}
            finalBalance={results.schedule.at(-1)!.remainingBalance}
            monthlyPayment={results.monthlyPayment}
            paymentType={snapshot.loanParams.paymentType}
          />
          <ExportButtons exportData={snapshot} />
          <AmortizationSchedule schedule={results.schedule} paymentType={snapshot.loanParams.paymentType} />
        </>
      )}
    </div>
  );
}