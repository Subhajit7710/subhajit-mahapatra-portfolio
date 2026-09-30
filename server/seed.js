import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';

const FAMILYCARE_LIVE_URL = 'https://family-care-frontend.vercel.app/';

// Keeps project links current on databases that were seeded earlier.
function syncProjectLinks(db) {
  db.prepare(
    "UPDATE projects SET live_url = ? WHERE image_key = 'familycare' AND (live_url IS NULL OR live_url != ?)"
  ).run(FAMILYCARE_LIVE_URL, FAMILYCARE_LIVE_URL);
}

export async function seedIfEmpty(db) {
  const profile = db.prepare('SELECT id FROM profile WHERE id = 1').get();
  if (profile) {
    syncProjectLinks(db);
    return;
  }

  db.prepare(`
    INSERT INTO profile (id, name, title, summary, email, phone, linkedin, github, leetcode, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    1,
    'Subhajit Mahapatra',
    'Aspiring Software Engineer',
    'MCA student and aspiring software engineer skilled in Java, JavaScript, React.js, Node.js, and Express.js. Learning to build REST APIs, authentication flows, and full-stack applications. Also exploring AI with PyTorch, Hugging Face, and related tools, with a focus on practical projects and end-to-end development.',
    'subhajitmahapatra7710@gmail.com',
    '+91 9382100631',
    'https://www.linkedin.com/in/subhajit-mahapatra-452136311/',
    'https://github.com/Subhajit7710',
    'https://leetcode.com/u/Subhajit7710/',
    'India'
  );

  const insertEducation = db.prepare(`
    INSERT INTO education (degree, institution, cgpa, year, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertEducation.run(
    'Master of Computer Applications (MCA)',
    'VIT Vellore',
    '8.12',
    '2027',
    1
  );
  insertEducation.run(
    'Bachelor of Computer Applications (BCA)',
    'IEM Kolkata',
    '7.88',
    '2024',
    2
  );

  db.prepare(`
    INSERT INTO experience (role, company, duration, description, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'Frontend Developer Intern',
    'Techplement',
    'Jun 2024 – Jul 2024',
    'Integrated REST APIs and Stripe, improving checkout success rate by 75%. Used React hooks to manage state and component lifecycle efficiently. Ensured cross-browser compatibility and mobile responsiveness.',
    1
  );

  const insertSkill = db.prepare(
    'INSERT INTO skills (name, category, sort_order) VALUES (?, ?, ?)'
  );

  const skillGroups = [
    { category: 'Languages', items: ['Python', 'Java', 'C', 'JavaScript', 'HTML'] },
    {
      category: 'Web Development',
      items: ['React.js', 'Node.js', 'Express.js', 'CSS3', 'REST API'],
    },
    {
      category: 'Database & Backend',
      items: ['SQL', 'PostgreSQL', 'MongoDB', 'JWT', 'Redis', 'Kafka'],
    },
    {
      category: 'Machine Learning',
      items: ['PyTorch', 'TensorFlow', 'Hugging Face', 'NLP', 'Scikit-learn'],
    },
    { category: 'Tools & Cloud', items: ['Git', 'Docker', 'AWS', 'Postman', 'CI/CD'] },
  ];

  skillGroups.forEach((group, groupIndex) => {
    group.items.forEach((name, itemIndex) => {
      insertSkill.run(name, group.category, groupIndex * 100 + itemIndex);
    });
  });

  const insertProject = db.prepare(`
    INSERT INTO projects (
      title, description, tech_stack, github_url, github_url_secondary, live_url, image_key, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProject.run(
    'FamilyWellcare',
    'Family health management platform with shared dashboards, medication tracking, and real-time updates. Designed API-driven synchronization for medication adherence visibility (~40% fewer information delays). Built an async reminder pipeline with Redis and BullMQ (delayed jobs, retries, exponential backoff) and Socket.IO with Redis Pub/Sub for family-room broadcasts.',
    'React, Express.js, Microservices, API Gateway, REST, JWT, MySQL, Sequelize, BullMQ, Socket.IO, Redis',
    'https://github.com/Subhajit7710/FamilyCareFrontend',
    'https://github.com/Subhajit7710/FamilyCareBackend',
    FAMILYCARE_LIVE_URL,
    'familycare',
    1
  );

  insertProject.run(
    'JustAdvisor AI',
    'AI-powered courtroom simulation that structures legal arguments and produces fact-consistent verdicts (~45% clearer than raw input). Fine-tuned Mistral-7B with LoRA adapters as a neutral AI judge for multi-argument legal reasoning while cutting fine-tuning compute by ~70%.',
    'Python, PyTorch, Hugging Face, Mistral-7B, Legal-BERT, LoRA, System Design',
    'https://github.com/Subhajit7710/JustAdvisor_AI',
    null,
    null,
    'justadvisor',
    2
  );

  db.prepare(`
    INSERT INTO certifications (title, issuer, date, description, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'Accenture Job Simulation',
    'Accenture',
    'Jul 29, 2024',
    'Completed Accenture job simulation. Led a team of 4 members, coordinating preparation and strategy for the technical problem-solving round.',
    1
  );

  console.log('Database seeded with portfolio data.');
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  const db = await initDb();
  db.exec(`
    DELETE FROM certifications;
    DELETE FROM projects;
    DELETE FROM skills;
    DELETE FROM experience;
    DELETE FROM education;
    DELETE FROM profile;
  `);
  await seedIfEmpty(db);
  console.log('Forced reseed complete.');
}
