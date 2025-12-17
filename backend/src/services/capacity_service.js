const { getDaysInMonth, getDay, isWeekend } = require('date-fns');

class CapacityService {
  static getWorkingDaysInMonth(year, month) {
    const daysInMonth = getDaysInMonth(new Date(year, month - 1));
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      if (!isWeekend(date)) {
        workingDays++;
      }
    }

    return workingDays;
  }

  static calculateMonthlyCapacity(contractHours, year, month, availabilityOverrides = {}) {
    const workingDays = this.getWorkingDaysInMonth(year, month);
    
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    
    if (availabilityOverrides && availabilityOverrides[monthKey]) {
      const override = availabilityOverrides[monthKey];
      if (override.available_days !== undefined) {
        return (contractHours / 5) * override.available_days;
      }
    }
    
    return (contractHours / 5) * workingDays;
  }

  static calculateUtilizationPercentage(plannedHours, capacityHours) {
    if (capacityHours === 0) return 0;
    return (plannedHours / capacityHours) * 100;
  }

  static isOverCapacity(plannedHours, capacityHours) {
    return plannedHours > capacityHours;
  }

  static getCapacityStatus(utilizationPercentage) {
    if (utilizationPercentage > 100) return 'OVER_CAPACITY';
    if (utilizationPercentage >= 90) return 'AT_CAPACITY';
    if (utilizationPercentage >= 70) return 'HIGH_UTILIZATION';
    if (utilizationPercentage >= 40) return 'MODERATE_UTILIZATION';
    return 'LOW_UTILIZATION';
  }

  static enrichResourceWithCapacity(resource, year, month) {
    const totalPlannedHours = parseFloat(resource.total_planned_hours || 0);
    const monthlyCapacity = this.calculateMonthlyCapacity(
      resource.contract_hours,
      year,
      month,
      resource.monthly_availability_overrides
    );
    
    const utilizationPercentage = this.calculateUtilizationPercentage(
      totalPlannedHours,
      monthlyCapacity
    );
    
    return {
      ...resource,
      year,
      month,
      working_days: this.getWorkingDaysInMonth(year, month),
      monthly_capacity: monthlyCapacity,
      total_planned_hours: totalPlannedHours,
      available_hours: monthlyCapacity - totalPlannedHours,
      utilization_percentage: Math.round(utilizationPercentage * 100) / 100,
      capacity_status: this.getCapacityStatus(utilizationPercentage),
      is_over_capacity: this.isOverCapacity(totalPlannedHours, monthlyCapacity),
    };
  }

  static generateCapacityWarnings(enrichedResources) {
    const warnings = [];

    enrichedResources.forEach(resource => {
      if (resource.is_over_capacity) {
        warnings.push({
          type: 'OVER_CAPACITY',
          severity: 'HIGH',
          resource_id: resource.id,
          resource_name: resource.name,
          year: resource.year,
          month: resource.month,
          message: `${resource.name} is over capacity by ${Math.round(resource.total_planned_hours - resource.monthly_capacity)} hours in ${resource.year}-${String(resource.month).padStart(2, '0')}`,
          planned_hours: resource.total_planned_hours,
          capacity_hours: resource.monthly_capacity,
          excess_hours: resource.total_planned_hours - resource.monthly_capacity,
        });
      } else if (resource.utilization_percentage >= 90) {
        warnings.push({
          type: 'HIGH_UTILIZATION',
          severity: 'MEDIUM',
          resource_id: resource.id,
          resource_name: resource.name,
          year: resource.year,
          month: resource.month,
          message: `${resource.name} is at ${Math.round(resource.utilization_percentage)}% capacity in ${resource.year}-${String(resource.month).padStart(2, '0')}`,
          planned_hours: resource.total_planned_hours,
          capacity_hours: resource.monthly_capacity,
          utilization_percentage: resource.utilization_percentage,
        });
      }
    });

    return warnings;
  }
}

module.exports = CapacityService;
