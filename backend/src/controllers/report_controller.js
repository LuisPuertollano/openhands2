const ReportService = require('../services/report_service');

class ReportController {
  static async exportCapacityExcel(req, res) {
    try {
      const { year, month } = req.query;

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          error: 'Year and month query parameters are required',
        });
      }

      const workbook = await ReportService.generateCapacityExcel(
        parseInt(year),
        parseInt(month)
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=capacity-report-${year}-${month}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error generating capacity Excel:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async exportBudgetExcel(req, res) {
    try {
      const workbook = await ReportService.generateBudgetExcel();

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=budget-report.xlsx'
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error generating budget Excel:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async exportCapacityPDF(req, res) {
    try {
      const { year, month } = req.query;

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          error: 'Year and month query parameters are required',
        });
      }

      const doc = await ReportService.generateCapacityPDF(
        parseInt(year),
        parseInt(month)
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=capacity-report-${year}-${month}.pdf`
      );

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error('Error generating capacity PDF:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async exportBudgetPDF(req, res) {
    try {
      const doc = await ReportService.generateBudgetPDF();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=budget-report.pdf'
      );

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error('Error generating budget PDF:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async exportRAMSDistributionExcel(req, res) {
    try {
      const workbook = await ReportService.generateRAMSDistributionExcel();

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=rams-distribution-report.xlsx'
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error generating RAMS distribution Excel:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ReportController;
