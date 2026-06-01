const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seed = async () => {
  const client = new Client({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  try {
    await client.connect();
    console.log('Seeding database...');

    const adminPwd = await bcrypt.hash('Admin1234!', 10);
    const staffPwd = await bcrypt.hash('Staff1234!', 10);
    const salesPwd = await bcrypt.hash('Sales1234!', 10);

    const userRes = await client.query(`
      INSERT INTO users (name, email, password, role) VALUES
        ('Salem Gnanga',   'salem@agency.com',   $1, 'admin'),
        ('Sophie Martin',  'sophie@agency.com',  $2, 'staff'),
        ('Lucas Bernard',  'lucas@agency.com',   $2, 'staff'),
        ('Youssef Diallo', 'youssef@agency.com', $3, 'staff'),
        ('Amina Toure',    'amina@agency.com',   $3, 'staff')
      RETURNING id, name, role;
    `, [adminPwd, staffPwd, salesPwd]);

    userRes.rows.forEach(u => console.log('User:', u.name, '(' + u.role + ')'));
    const [adminId, sophieId, lucasId, youssefId, aminaId] = userRes.rows.map(u => u.id);

    const clientRes = await client.query(`
      INSERT INTO clients (name, email, phone, company, status, notes, created_by) VALUES
        ('Thomas Dupont',  'thomas@dupont.fr',   '+33 6 10 11 12 13', 'Dupont & Co',     'active',   'Key client, high priority',             $1),
        ('Aisha Kone',     'aisha@kone.com',     '+225 07 08 09 10',  'KoneTech',        'active',   'Mobile app project in progress',        $1),
        ('Marc Lefevre',   'marc@lefevre.net',   '+33 1 23 45 67 89', 'Lefevre Conseil', 'inactive', 'Contract expired in March',             $2),
        ('Nina Reyes',     'nina@reyes.io',      '+34 600 123 456',   'Reyes Digital',   'prospect', 'Interested in SEO services',            $2),
        ('Jean-Paul Brun', 'jp@brun-sarl.fr',    '+33 4 56 78 90 12', 'Brun SARL',       'active',   'Branding done, loyal client',           $1),
        ('Karim Mansour',  'karim@mansour.dz',   '+213 550 123 456',  'Mansour Group',   'prospect', 'First contact via LinkedIn',            $3),
        ('Chloe Petit',    'chloe@petit.fr',     '+33 6 98 76 54 32', 'Petit Studio',    'active',   'Creative studio, small budget',         $4)
      RETURNING id, name;
    `, [adminId, sophieId, youssefId, aminaId]);

    clientRes.rows.forEach(c => console.log('Client:', c.name));
    const [c1,c2,c3,c4,c5,c6,c7] = clientRes.rows.map(c => c.id);

    const saleRes = await client.query(`
      INSERT INTO sales (title, client_id, amount, status, description, deal_date, created_by) VALUES
        ('Website Redesign',       $1, 12500, 'won',         'Full redesign of the corporate website',    '2026-03-15', $8),
        ('Mobile App Development', $2,  8200, 'in_progress', 'iOS and Android app for KoneTech',          '2026-04-01', $8),
        ('SEO Consulting',         $3,  3400, 'pending',     'Three-month SEO strategy package',          '2026-04-10', $9),
        ('E-commerce Platform',    $4,  5000, 'lost',        'Custom e-commerce platform for Reyes',      '2026-03-20', $9),
        ('Branding Package',       $5,  9800, 'won',         'Logo, brand guidelines and visual charter', '2026-02-28', $8),
        ('Social Media Strategy',  $6,  4200, 'pending',     'Six-month social media strategy plan',      '2026-04-15', $10),
        ('Landing Page Design',    $7,  1800, 'won',         'Sales landing page for main product',       '2026-03-01', $11)
      RETURNING id, title;
    `, [c1,c2,c3,c4,c5,c6,c7, adminId, sophieId, youssefId, aminaId]);

    saleRes.rows.forEach(s => console.log('Sale:', s.title));
    const [s1,s2,s3,s4,s5,s6,s7] = saleRes.rows.map(s => s.id);

    await client.query(`
      INSERT INTO tasks (title, description, status, priority, due_date, client_id, sale_id, assigned_to, created_by) VALUES
        ('Send revised proposal',   'Update quote based on client feedback',      'todo',        'high',   '2026-04-28', $1, $8,  $12, $11),
        ('Design homepage mockup',  'Create Figma mockup for client approval',    'in_progress', 'high',   '2026-04-30', $1, $8,  $12, $11),
        ('Set up staging server',   'Configure pre-production hosting env',       'in_progress', 'medium', '2026-05-02', $2, $9,  $13, $11),
        ('Write API documentation', 'Document all REST endpoints clearly',        'todo',        'low',    '2026-05-10', $2, $9,  $13, $11),
        ('Follow up with client',   'Call Marc about SEO contract renewal',       'todo',        'medium', '2026-04-29', $3, $10, $12, $11),
        ('Deliver brand assets',    'Send final files to Jean-Paul Brun',         'done',        'high',   '2026-03-01', $5, NULL,$13, $11),
        ('Social media audit',      'Full audit of Mansour Group accounts',       'todo',        'medium', '2026-05-05', $6, $11, $14, $11),
        ('Landing page copywriting','Write all text content for landing page',    'done',        'low',    '2026-03-10', $7, $12, $14, $11)
      RETURNING id, title;
    `, [c1,c2,c3,c5,c6,c7, s1,s2,s3,s5,s6,s7, adminId, sophieId, youssefId, aminaId]);

    console.log('Tasks inserted.');
    console.log('\nLogin accounts:');
    console.log('  salem@agency.com   / Admin1234!  (admin)');
    console.log('  sophie@agency.com  / Staff1234!  (staff)');
    console.log('  lucas@agency.com   / Staff1234!  (staff)');
    console.log('  youssef@agency.com / Sales1234!  (staff)');
    console.log('  amina@agency.com   / Sales1234!  (staff)');
  } catch (error) {
    console.error('Seeding failed:', error.message);
  } finally {
    await client.end();
  }
};

seed();
