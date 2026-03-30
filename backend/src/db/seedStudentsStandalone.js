const { Student } = require('../models/index.js');
const { initializeDatabases, closeDatabases } = require('./index.js');

async function seed() {
    process.env.USE_SQLITE = 'true';
    process.env.NODE_ENV = 'development';
    
    try {
        await initializeDatabases();
        
        const departments = ['CS', 'EE', 'ME', 'CE', 'MATH', 'PHYS'];
        const courses = ['B.Tech', 'M.Tech', 'Ph.D'];
        const programs = ['Regular', 'Distance', 'Executive'];
        const names = [
            'Arjun Sharma', 'Priya Singh', 'Amit Patel', 'Sneha Gupta', 'Rahul Verma',
            'Ananya Iyer', 'Vikram Joshi', 'Kavita Reddy', 'Rohan Mishra', 'Ishani Das',
            'Manish Kumar', 'Deepika Rao', 'Sahil Khan', 'Tanya Bajaj', 'Vivek Chopra',
            'Divya Chauhan', 'Siddharth Patil', 'Riya Malik', 'Akash Nair', 'Shruti Saxena'
        ];

        const sampleStudents = [];
        for (let i = 1; i <= 100; i++) {
            const randomName = names[Math.floor(Math.random() * names.length)] + ' ' + (i);
            sampleStudents.push({
                roll_number: `STU${String(i).padStart(4, '0')}`,
                name: randomName,
                department: departments[Math.floor(Math.random() * departments.length)],
                course: courses[Math.floor(Math.random() * courses.length)],
                program: programs[Math.floor(Math.random() * programs.length)]
            });
        }

        await Student.sync();
        await Student.destroy({ where: {}, truncate: true });
        await Student.bulkCreate(sampleStudents);
        
        console.log('✅ Successfully seeded 100 students into the database.');
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    } finally {
        await closeDatabases();
        process.exit(0);
    }
}

seed();
