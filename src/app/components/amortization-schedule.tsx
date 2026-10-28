import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { FileText } from "lucide-react";
import type { PaymentSchedule } from "../lib/types";

interface AmortizationScheduleProps {
  schedule: PaymentSchedule[];
  paymentType: "equalPrincipal" | "equalPayment" | "maturity" | "stepUp";
}

export function AmortizationSchedule({ schedule }: AmortizationScheduleProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          상환 일정표
        </CardTitle>
        <CardDescription>
          월별 상환 내역을 확인하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] max-w-full overflow-auto rounded-md border" role="region" tabIndex={0} aria-label="상환 일정표 세로 스크롤">
          <Table className="min-w-[560px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">회차</TableHead>
                <TableHead className="text-right">상환금액</TableHead>
                <TableHead className="text-right">원금</TableHead>
                <TableHead className="text-right">이자</TableHead>
                <TableHead className="text-right">잔액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((item) => (
                <TableRow key={item.month}>
                  <TableCell>{item.month}개월</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.payment)}원
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.principal)}원
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.interest)}원
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.remainingBalance)}원
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}