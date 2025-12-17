const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Resource = require('../models/resource');
const WorkPackage = require('../models/work_package');
const CapacityService = require('./capacity_service');

class ReportService {
  static async generateCapacityExcel(year, month) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resource Capacity');

    worksheet.columns = [
      { header: 'Resource Name', key: 'name', width: 25 },
      { header: 'Contract Hours', key: 'contract_hours', width: 15 },
      { header: 'Working Days', key: 'working_days', width: 15 },
      { header: 'Monthly Capacity (h)', key: 'monthly_capacity', width: 20 },
      { header: 'Planned Hours (h)', key: 'total_planned_hours', width: 20 },
      { header: 'Available Hours (h)', key: 'available_hours', width: 20 },
      { header: 'Utilization %', key: 'utilization_percentage', width: 15 },
      { header: 'Status', key: 'capacity_status', width: 20 },
    ];

    const utilizations = await Resource.getAllMonthlyUtilization(year, month);
    const enriched = utilizations.map(util =>
      CapacityService.enrichResourceWithCapacity(util, year, month)
    );

    enriched.forEach(resource => {
      const row = worksheet.addRow({
        name: resource.name,
        contract_hours: resource.contract_hours,
        working_days: resource.working_days,
        monthly_capacity: resource.monthly_capacity,
        total_planned_hours: resource.total_planned_hours,
        available_hours: resource.available_hours,
        utilization_percentage: resource.utilization_percentage,
        capacity_status: resource.capacity_status,
      });

      if (resource.is_over_capacity) {
        row.getCell('utilization_percentage').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' },
        };
      }
    });

    worksheet.getRow(1).font = { bold: true };

    return workbook;
  }

  static async generateBudgetExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('WP Budget Status');

    worksheet.columns = [
      { header: 'Project', key: 'project_name', width: 25 },
      { header: 'Work Package', key: 'work_package_name', width: 30 },
      { header: 'RAMS Tag', key: 'rams_tag', width: 20 },
      { header: 'Standard Effort (h)', key: 'standard_effort_hours', width: 20 },
      { header: 'Planned Hours (h)', key: 'total_planned_hours', width: 20 },
      { header: 'Hours Remaining (h)', key: 'hours_remaining', width: 20 },
      { header: 'Status', key: 'budget_status', width: 20 },
    ];

    const budgetStatuses = await WorkPackage.getAllBudgetStatus();

    budgetStatuses.forEach(wp => {
      const row = worksheet.addRow({
        project_name: wp.project_name,
        work_package_name: wp.work_package_name,
        rams_tag: wp.rams_tag,
        standard_effort_hours: parseFloat(wp.standard_effort_hours),
        total_planned_hours: parseFloat(wp.total_planned_hours),
        hours_remaining: parseFloat(wp.hours_remaining),
        budget_status: wp.budget_status,
      });

      if (wp.budget_status === 'OVER_BUDGET') {
        row.getCell('budget_status').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' },
        };
      }
    });

    worksheet.getRow(1).font = { bold: true };

    return workbook;
  }

  static async generateCapacityPDF(year, month) {
    const doc = new PDFDocument();
    const utilizations = await Resource.getAllMonthlyUtilization(year, month);
    const enriched = utilizations.map(util =>
      CapacityService.enrichResourceWithCapacity(util, year, month)
    );

    doc.fontSize(20).text('Resource Capacity Report', { align: 'center' });
    doc.fontSize(12).text(`${year}-${String(month).padStart(2, '0')}`, { align: 'center' });
    doc.moveDown();

    enriched.forEach(resource => {
      doc.fontSize(14).text(resource.name, { underline: true });
      doc.fontSize(10);
      doc.text(`Contract Hours: ${resource.contract_hours}h/week`);
      doc.text(`Working Days: ${resource.working_days}`);
      doc.text(`Monthly Capacity: ${resource.monthly_capacity}h`);
      doc.text(`Planned Hours: ${resource.total_planned_hours}h`);
      doc.text(`Available Hours: ${resource.available_hours}h`);
      doc.text(`Utilization: ${resource.utilization_percentage}%`);
      doc.text(`Status: ${resource.capacity_status}`, {
        color: resource.is_over_capacity ? 'red' : 'black',
      });
      doc.moveDown();
    });

    return doc;
  }

  static async generateBudgetPDF() {
    const doc = new PDFDocument();
    const budgetStatuses = await WorkPackage.getAllBudgetStatus();

    doc.fontSize(20).text('Work Package Budget Report', { align: 'center' });
    doc.moveDown();

    let currentProject = '';

    budgetStatuses.forEach(wp => {
      if (wp.project_name !== currentProject) {
        currentProject = wp.project_name;
        doc.fontSize(16).text(currentProject, { underline: true });
        doc.moveDown(0.5);
      }

      doc.fontSize(12).text(wp.work_package_name, { bold: true });
      doc.fontSize(10);
      doc.text(`RAMS Tag: ${wp.rams_tag}`);
      doc.text(`Standard Effort: ${wp.standard_effort_hours}h`);
      doc.text(`Planned Hours: ${wp.total_planned_hours}h`);
      doc.text(`Hours Remaining: ${wp.hours_remaining}h`);
      doc.text(`Status: ${wp.budget_status}`, {
        color: wp.budget_status === 'OVER_BUDGET' ? 'red' : 'black',
      });
      doc.moveDown();
    });

    return doc;
  }

  static async generateRAMSDistributionExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('RAMS Distribution');

    worksheet.columns = [
      { header: 'RAMS Tag', key: 'rams_tag', width: 20 },
      { header: 'Total Work Packages', key: 'wp_count', width: 20 },
      { header: 'Total Standard Hours', key: 'total_standard_hours', width: 20 },
      { header: 'Total Planned Hours', key: 'total_planned_hours', width: 20 },
      { header: 'Total Resources', key: 'resource_count', width: 20 },
    ];

    const budgetStatuses = await WorkPackage.getAllBudgetStatus();

    const ramsDistribution = {};
    budgetStatuses.forEach(wp => {
      if (!ramsDistribution[wp.rams_tag]) {
        ramsDistribution[wp.rams_tag] = {
          rams_tag: wp.rams_tag,
          wp_count: 0,
          total_standard_hours: 0,
          total_planned_hours: 0,
          resources: new Set(),
        };
      }
      ramsDistribution[wp.rams_tag].wp_count++;
      ramsDistribution[wp.rams_tag].total_standard_hours += parseFloat(wp.standard_effort_hours);
      ramsDistribution[wp.rams_tag].total_planned_hours += parseFloat(wp.total_planned_hours);
    });

    Object.values(ramsDistribution).forEach(dist => {
      worksheet.addRow({
        rams_tag: dist.rams_tag,
        wp_count: dist.wp_count,
        total_standard_hours: dist.total_standard_hours,
        total_planned_hours: dist.total_planned_hours,
        resource_count: dist.resources.size,
      });
    });

    worksheet.getRow(1).font = { bold: true };

    return workbook;
  }
}

module.exports = ReportService;
