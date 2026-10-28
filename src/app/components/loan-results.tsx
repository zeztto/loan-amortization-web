import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { DollarSign, CreditCard, TrendingDown } from "lucide-react";

interface LoanResultsProps {
  totalInterest: number;
  totalPayment: number;
  monthlyPayment: number;
  finalPayment:number;
  finalBalance:number;
  paymentType: "equalPrincipal" | "equalPayment" | "maturity" | "stepUp";
}

export function LoanResults({ totalInterest, totalPayment, monthlyPayment, paymentType, finalPayment, finalBalance }: LoanResultsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentTypeLabel = () => {
    switch (paymentType) {
      case "equalPayment":
        return "원리금균등상환";
      case "equalPrincipal":
        return "원금균등상환";
      case "maturity":
        return "만기일시상환";
      case "stepUp":
        return "체증식상환";
      default:
        return "";
    }
  };

  const getMonthlyPaymentLabel = () => {
    switch (paymentType) {
      case "equalPayment":
        return "거치 후 첫 상환금";
      case "equalPrincipal":
        return "거치 후 첫 상환금";
      case "maturity":
        return "거치 후 첫 상환금";
      case "stepUp":
        return "거치 후 첫 상환금";
      default:
        return "거치 후 첫 상환금";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>계산 결과</CardTitle>
        <CardDescription>
          {getPaymentTypeLabel()} 방식 기준
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-secondary rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="w-4 h-4" />
              <span>
                {getMonthlyPaymentLabel()}
              </span>
            </div>
            <p className="text-primary">
              {formatCurrency(monthlyPayment)} 원
            </p>
          </div>

          <div className="bg-secondary rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="w-4 h-4" />
              <span>총 이자</span>
            </div>
            <p className="text-primary">
              {formatCurrency(totalInterest)} 원
            </p>
          </div>

          <div className="bg-secondary rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>총 상환금액</span>
            </div>
            <p className="text-primary">
              {formatCurrency(totalPayment)} 원
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">마지막 상환금: {formatCurrency(finalPayment)}원 · 최종 잔액: {formatCurrency(finalBalance)}원</p>
      </CardContent>
    </Card>
  );
}