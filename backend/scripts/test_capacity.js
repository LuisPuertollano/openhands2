const Resource = require('../src/models/resource');
const CapacityService = require('../src/services/capacity_service');
require('dotenv').config();

async function testCapacity() {
  try {
    console.log('='.repeat(70));
    console.log('CAPACITY VALIDATION TEST');
    console.log('='.repeat(70));
    console.log();

    const year = 2024;
    const months = [1, 2, 3, 4, 5, 6];
    
    for (const month of months) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`Month: ${year}-${String(month).padStart(2, '0')}`);
      console.log('='.repeat(70));
      
      const utilizations = await Resource.getAllMonthlyUtilization(year, month);
      const enriched = utilizations.map(util =>
        CapacityService.enrichResourceWithCapacity(util, year, month)
      );

      const warnings = CapacityService.generateCapacityWarnings(enriched);

      console.log(`\nTotal Resources: ${enriched.length}`);
      console.log(`Working Days: ${enriched[0]?.working_days || 'N/A'}`);
      console.log();

      enriched.forEach(resource => {
        const icon = resource.is_over_capacity ? '❌' : 
                     resource.utilization_percentage >= 90 ? '⚠️' : '✅';
        
        console.log(`${icon} ${resource.name.padEnd(20)} | Contract: ${resource.contract_hours}h | Capacity: ${resource.monthly_capacity.toFixed(0)}h | Planned: ${resource.total_planned_hours.toFixed(0)}h | Utilization: ${resource.utilization_percentage.toFixed(1)}% | Status: ${resource.capacity_status}`);
      });

      if (warnings.length > 0) {
        console.log(`\n${'*'.repeat(70)}`);
        console.log('WARNINGS DETECTED:');
        console.log('*'.repeat(70));
        warnings.forEach(warning => {
          console.log(`\n[${warning.severity}] ${warning.type}:`);
          console.log(`  ${warning.message}`);
          if (warning.excess_hours) {
            console.log(`  Excess hours: ${warning.excess_hours.toFixed(1)}h`);
          }
        });
      } else {
        console.log('\n✅ No capacity warnings for this month');
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY STATISTICS');
    console.log('='.repeat(70));

    for (const month of months) {
      const utilizations = await Resource.getAllMonthlyUtilization(year, month);
      const enriched = utilizations.map(util =>
        CapacityService.enrichResourceWithCapacity(util, year, month)
      );

      const overCapacity = enriched.filter(r => r.is_over_capacity).length;
      const atCapacity = enriched.filter(r => r.utilization_percentage >= 90 && !r.is_over_capacity).length;
      const highUtil = enriched.filter(r => r.utilization_percentage >= 70 && r.utilization_percentage < 90).length;
      const avgUtil = enriched.reduce((sum, r) => sum + r.utilization_percentage, 0) / enriched.length;

      console.log(`\n${year}-${String(month).padStart(2, '0')}:`);
      console.log(`  Over Capacity: ${overCapacity} resources`);
      console.log(`  At Capacity (>=90%): ${atCapacity} resources`);
      console.log(`  High Utilization (70-90%): ${highUtil} resources`);
      console.log(`  Average Utilization: ${avgUtil.toFixed(1)}%`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('TEST COMPLETED');
    console.log('='.repeat(70));

    process.exit(0);
  } catch (error) {
    console.error('Error testing capacity:', error);
    process.exit(1);
  }
}

testCapacity();
