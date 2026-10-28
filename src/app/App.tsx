import { LoanCalculator } from "./components/loan-calculator";
import { Toaster } from "sonner";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors style={{transition:"none"}} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="mb-2">대출 이자 계산기</h1>
          <p className="text-muted-foreground">
            대출 금액, 이자율, 대출 기간을 입력하여 상환 계획을 확인하세요
          </p>
        </div>
        <LoanCalculator />
      </div>
    </div>
  );
}
