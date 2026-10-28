/**
 * PDF export functionality with Korean support using jsPDF
 * NanumGothic 폰트를 임베드한 텍스트 기반 PDF 생성 (NanumGothic 한글 글꼴 사용)
 */

import {jsPDF} from "jspdf";
import {autoTable} from "jspdf-autotable";
import type { ExportData } from "./types";
import { formatDateTime, formatCurrency, generateFileName, downloadFile } from "./exportUtils";
import { nanumGothicRegular, nanumGothicBold } from "./nanumGothic-font";

/**
 * PDF 파일로 내보내기 (텍스트 선택 가능, NanumGothic 한글 글꼴 사용)
 * @param exportData - 내보내기 데이터
 */
export function buildPDF(exportData: ExportData): Uint8Array {
  const { loanParams, results, generatedAt } = exportData;

  // PDF 문서 생성
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
    putOnlyUsedFonts: true,
  });

  try {
    // NanumGothic 폰트 추가 (Regular + Bold)
    doc.addFileToVFS("NanumGothic.ttf", nanumGothicRegular);
    doc.addFont("NanumGothic.ttf", "NanumGothic", "normal");

    doc.addFileToVFS("NanumGothic-Bold.ttf", nanumGothicBold);
    doc.addFont("NanumGothic-Bold.ttf", "NanumGothic", "bold");

    doc.setFont("NanumGothic", "normal");
  } catch (error) {
    console.error("Font loading error:", error);
    throw new Error("폰트 로딩 실패");
  }

  const marginLeft = 15;
  let currentY = 20;

  // 제목
  doc.setFontSize(16);
  doc.text("대출 이자 계산 결과", marginLeft, currentY);
  currentY += 8;

  // 생성일시
  doc.setFontSize(9);
  doc.text(`생성일시: ${formatDateTime(generatedAt)}`, marginLeft, currentY);
  currentY += 12;

  // 대출 정보 섹션
  doc.setFontSize(12);
  doc.text("대출 정보", marginLeft, currentY);
  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: [
      ["대출 금액", `${formatCurrency(loanParams.principal)} 원`],
      ["연 이자율", `${loanParams.interestRate}%`],
      ["대출 기간", `${loanParams.loanTerm}${loanParams.loanTermUnit}`],
      [
        "거치 기간",
        loanParams.gracePeriod > 0
          ? `${loanParams.gracePeriod}${loanParams.gracePeriodUnit}`
          : "없음",
      ],
      ["상환 방식", loanParams.paymentTypeLabel],
      ["계산 기간", `${loanParams.normalizedMonths}개월 (거치 ${loanParams.normalizedGraceMonths}개월)`],
      ["계산 정책", "월별 원 단위 반올림, 마지막 회차 원금 조정"],
    ],
    margin: { left: marginLeft, right:15 },
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 3,
      font: "NanumGothic",
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: "bold" },
      1: { cellWidth: "auto" },
    },
  });

  currentY = (doc as jsPDF & {lastAutoTable:{finalY:number}}).lastAutoTable.finalY + 10;

  // 계산 결과 섹션
  doc.setFontSize(12);
  doc.text("계산 결과", marginLeft, currentY);
  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: [
      ["거치 후 첫 상환금", `${formatCurrency(results.monthlyPayment)} 원`],
      ["총 이자", `${formatCurrency(results.totalInterest)} 원`],
      ["총 상환금액", `${formatCurrency(results.totalPayment)} 원`],
      ["마지막 상환금", `${formatCurrency(results.schedule.at(-1)!.payment)} 원`],
      ["최종 잔액", `${formatCurrency(results.schedule.at(-1)!.remainingBalance)} 원`],
    ],
    margin: { left: marginLeft, right:15 },
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 3,
      font: "NanumGothic",
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: "bold" },
      1: { cellWidth: "auto" },
    },
  });

  currentY = (doc as jsPDF & {lastAutoTable:{finalY:number}}).lastAutoTable.finalY + 12;

  // 상환 일정표 섹션
  doc.setFontSize(12);
  doc.text("상환 일정표", marginLeft, currentY);
  currentY += 5;

  // 상환 일정표 데이터 준비
  const scheduleData = results.schedule.map((item) => [
    item.month.toString(),
    formatCurrency(item.payment),
    formatCurrency(item.principal),
    formatCurrency(item.interest),
    formatCurrency(item.remainingBalance),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["회차", "상환금액", "원금", "이자", "잔액"]],
    body: scheduleData,
    margin: { left: marginLeft, right: 15 },
    theme: "striped",
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: "right",
      font: "NanumGothic",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 18 },
      1: { cellWidth: 40.5 },
      2: { cellWidth: 40.5 },
      3: { cellWidth: 40.5 },
      4: { cellWidth: 40.5 },
    },
  });

  // 파일 다운로드
  return new Uint8Array(doc.output("arraybuffer"));
}

export async function exportToPDF(data:ExportData):Promise<void> {const bytes=buildPDF(data);downloadFile(new Blob([bytes as BlobPart],{type:'application/pdf'}),generateFileName(data,'pdf'));}
