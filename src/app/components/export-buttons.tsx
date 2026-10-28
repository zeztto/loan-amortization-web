/**
 * Export buttons component
 * 내보내기 버튼 컴포넌트
 */

import { useState } from "react";
import { Button } from "./ui/button";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ExportData } from "../lib/types";

interface ExportButtonsProps {
  exportData: ExportData;
  disabled?: boolean;
}

export function ExportButtons({ exportData, disabled = false }: ExportButtonsProps) {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);

      const {exportToExcel}=await import("../lib/excelExport");
      await exportToExcel(exportData);
      toast.success("Excel 파일 다운로드를 요청했습니다.");
    } catch (error) {
      console.error("Excel export failed:", error);
      toast.error("Excel 파일 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);

      // PDF 생성 및 다운로드 (완료될 때까지 대기)
      const {exportToPDF}=await import("../lib/pdfExport");
      await exportToPDF(exportData);

      toast.success("PDF 파일 다운로드를 요청했습니다.");
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("PDF 파일 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="flex justify-center gap-3 my-4">
      <Button
        variant="outline"
        disabled={disabled || isExportingExcel}
        onClick={handleExportExcel}
        className="gap-2"
      >
        {isExportingExcel ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            내보내는 중...
          </>
        ) : (
          <>
            <FileSpreadsheet className="w-4 h-4" />
            XLSX 다운로드
          </>
        )}
      </Button>

      <Button
        variant="outline"
        disabled={disabled || isExportingPDF}
        onClick={handleExportPDF}
        className="gap-2"
      >
        {isExportingPDF ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            내보내는 중...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            PDF 다운로드
          </>
        )}
      </Button>
    </div>
  );
}
