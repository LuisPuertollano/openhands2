const db = require('../src/config/database');
require('dotenv').config();

const RAMS_TAGS = ['FMECA', 'Hazard Log', 'SIL', 'Risk Assessment', 'Safety Case'];

async function seedDatabase() {
  try {
    console.log('Seeding database with mock data...');

    console.log('Creating 15 mock resources...');
    const resources = [];
    const resourceNames = [
      'Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown',
      'Emma Davis', 'Frank Miller', 'Grace Wilson', 'Henry Moore',
      'Iris Taylor', 'Jack Anderson', 'Karen Thomas', 'Leo Jackson',
      'Mary White', 'Nathan Harris', 'Olivia Martin'
    ];

    for (let i = 0; i < 15; i++) {
      const contractHours = i % 3 === 0 ? 35 : 40;
      const result = await db.query(
        `INSERT INTO resources (name, contract_hours, monthly_availability_overrides) 
         VALUES ($1, $2, $3) RETURNING *`,
        [
          resourceNames[i],
          contractHours,
          i === 0 ? JSON.stringify({ '2024-01': { available_days: 15, reason: 'vacation' } }) : '{}'
        ]
      );
      resources.push(result.rows[0]);
      console.log(`  Created resource: ${resourceNames[i]} (${contractHours}h/week)`);
    }

    console.log('\nCreating 3 mock projects...');
    const projects = [];
    const projectData = [
      { name: 'Railway Signaling System', start_date: '2024-01-01', end_date: '2024-12-31' },
      { name: 'Metro Train Control Platform', start_date: '2024-02-01', end_date: '2024-11-30' },
      { name: 'Safety Critical Software Upgrade', start_date: '2024-03-01', end_date: '2024-10-31' }
    ];

    for (const proj of projectData) {
      const result = await db.query(
        `INSERT INTO projects (name, start_date, end_date) 
         VALUES ($1, $2, $3) RETURNING *`,
        [proj.name, proj.start_date, proj.end_date]
      );
      projects.push(result.rows[0]);
      console.log(`  Created project: ${proj.name}`);
    }

    console.log('\nCreating 5 work packages per project...');
    const workPackages = [];
    
    for (const project of projects) {
      for (let i = 0; i < 5; i++) {
        const ramsTag = RAMS_TAGS[i % RAMS_TAGS.length];
        const standardEffort = 100 + (i * 50) + Math.random() * 100;
        
        const result = await db.query(
          `INSERT INTO work_packages (project_id, name, rams_tag, standard_effort_hours) 
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [
            project.id,
            `${project.name.substring(0, 20)}-WP${i + 1}`,
            ramsTag,
            standardEffort.toFixed(2)
          ]
        );
        workPackages.push(result.rows[0]);
        console.log(`  Created WP: ${result.rows[0].name} (${ramsTag}, ${standardEffort.toFixed(2)}h)`);
      }
    }

    console.log('\nCreating activities (linking resources to work packages)...');
    let activityCount = 0;
    
    for (const wp of workPackages) {
      const numActivities = 2 + Math.floor(Math.random() * 4);
      const assignedResources = new Set();
      
      for (let i = 0; i < numActivities; i++) {
        let resourceIdx;
        do {
          resourceIdx = Math.floor(Math.random() * resources.length);
        } while (assignedResources.has(resourceIdx) && assignedResources.size < resources.length);
        
        assignedResources.add(resourceIdx);
        const resource = resources[resourceIdx];
        
        const plannedHours = 20 + Math.random() * 80;
        const startDate = new Date('2024-01-01');
        startDate.setMonth(startDate.getMonth() + Math.floor(Math.random() * 6));
        
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1 + Math.floor(Math.random() * 2));
        
        await db.query(
          `INSERT INTO activities (work_package_id, resource_id, planned_hours, start_date, end_date) 
           VALUES ($1, $2, $3, $4, $5)`,
          [
            wp.id,
            resource.id,
            plannedHours.toFixed(2),
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          ]
        );
        activityCount++;
      }
    }
    console.log(`  Created ${activityCount} activities`);

    console.log('\nDatabase seeding completed successfully!');
    console.log(`Summary:`);
    console.log(`  - Resources: ${resources.length}`);
    console.log(`  - Projects: ${projects.length}`);
    console.log(`  - Work Packages: ${workPackages.length}`);
    console.log(`  - Activities: ${activityCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
