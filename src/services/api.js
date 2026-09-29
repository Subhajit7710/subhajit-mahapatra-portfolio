const rawBase = import.meta.env.VITE_API_URL?.trim();
const API_BASE = (rawBase || '/api').replace(/\/$/, '');
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || '2b35be06-1ee1-4770-9d0d-ec44a3311680'; // Web3Forms free key fallback

const FALLBACK_PROFILE = {
  id: 1,
  name: 'Subhajit Mahapatra',
  title: 'Aspiring Software Engineer',
  summary:
    'MCA student and aspiring software engineer skilled in Java, JavaScript, React.js, Node.js, and Express.js. Learning to build REST APIs, authentication flows, and full-stack applications. Also exploring AI with PyTorch, Hugging Face, and related tools, with a focus on practical projects and end-to-end development.',
  email: 'subhajitmahapatra7710@gmail.com',
  phone: '+91 9382100631',
  linkedin: 'https://www.linkedin.com/in/subhajit-mahapatra-452136311/',
  github: 'https://github.com/Subhajit7710',
  leetcode: 'https://leetcode.com/u/Subhajit7710/',
  location: 'India',
  education: [
    {
      id: 1,
      degree: 'Master of Computer Applications (MCA)',
      institution: 'VIT Vellore',
      cgpa: '8.12',
      year: '2027',
    },
    {
      id: 2,
      degree: 'Bachelor of Computer Applications (BCA)',
      institution: 'IEM Kolkata',
      cgpa: '7.88',
      year: '2024',
    },
  ],
  experience: [
    {
      id: 1,
      role: 'Frontend Developer Intern',
      company: 'Techplement',
      duration: 'Jun 2024 – Jul 2024',
      description:
        'Integrated REST APIs and Stripe, improving checkout success rate by 75%. Used React hooks to manage state and component lifecycle efficiently. Ensured cross-browser compatibility and mobile responsiveness.',
    },
  ],
};

const FALLBACK_SKILLS = {
  skills: [],
  grouped: {
    Languages: ['Python', 'Java', 'C', 'JavaScript', 'HTML'],
    'Web Development': [
      'React.js',
      'Node.js',
      'Express.js',
      'CSS3',
      'REST API',
    ],
    'Database & Backend': [
      'SQL',
      'PostgreSQL',
      'MongoDB',
      'JWT',
      'Redis',
      'Kafka',
    ],
    'Machine Learning': [
      'PyTorch',
      'TensorFlow',
      'Hugging Face',
      'NLP',
      'Scikit-learn',
    ],
    'Tools & Cloud': ['Git', 'Docker', 'AWS', 'Postman', 'CI/CD'],
  },
};

const FALLBACK_PROJECTS = [
  {
    id: 1,
    title: 'FamilyWellcare',
    description:
      'Family health management platform with shared dashboards, medication tracking, and real-time updates. Designed API-driven synchronization for medication adherence visibility (~40% fewer information delays). Built an async reminder pipeline with Redis and BullMQ (delayed jobs, retries, exponential backoff) and Socket.IO with Redis Pub/Sub for family-room broadcasts.',
    tech_stack:
      'React, Express.js, Microservices, API Gateway, REST, JWT, MySQL, Sequelize, BullMQ, Socket.IO, Redis',
    github_url: 'https://github.com/Subhajit7710/FamilyCareFrontend',
    github_url_secondary: 'https://github.com/Subhajit7710/FamilyCareBackend',
    live_url: null,
  },
  {
    id: 2,
    title: 'JustAdvisor AI',
    description:
      'AI-powered courtroom simulation that structures legal arguments and produces fact-consistent verdicts (~45% clearer than raw input). Fine-tuned Mistral-7B with LoRA adapters as a neutral AI judge for multi-argument legal reasoning while cutting fine-tuning compute by ~70%.',
    tech_stack:
      'Python, PyTorch, Hugging Face, Mistral-7B, Legal-BERT, LoRA, System Design',
    github_url: 'https://github.com/Subhajit7710/JustAdvisor_AI',
    github_url_secondary: null,
    live_url: null,
  },
];

const FALLBACK_CERTIFICATIONS = [
  {
    id: 1,
    title: 'Accenture Job Simulation',
    issuer: 'Accenture',
    date: 'Jul 29, 2024',
    description:
      'Completed Accenture job simulation. Led a team of 4 members, coordinating preparation and strategy for the technical problem-solving round.',
  },
];

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong. Please try again.');
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export const getProfile = () =>
  request('/profile').catch(() => FALLBACK_PROFILE);

export const getSkills = () =>
  request('/skills').catch(() => FALLBACK_SKILLS);

export const getProjects = () =>
  request('/projects').catch(() => FALLBACK_PROJECTS);

export const getCertifications = () =>
  request('/certifications').catch(() => FALLBACK_CERTIFICATIONS);

export const sendContact = async (payload) => {
  // First try local/configured Express backend
  try {
    const result = await request('/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return result;
  } catch (backendError) {
    console.warn('Backend contact API unavailable, trying Web3Forms static mail handler...', backendError.message);
  }

  // Fallback to Web3Forms (works on GitHub Pages / static Vercel without backend server)
  if (WEB3FORMS_KEY) {
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: payload.name,
          email: payload.email,
          message: payload.message,
          subject: `Portfolio Contact from ${payload.name}`,
          from_name: payload.name,
          to_email: 'subhajitmahapatra7710@gmail.com',
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        return {
          success: true,
          message: 'Thanks for reaching out! Your message has been delivered to my inbox.',
        };
      }
    } catch (web3Error) {
      console.warn('Web3Forms fallback failed:', web3Error.message);
    }
  }

  // Final fallback: mailto link construct
  throw new Error(
    'Unable to send automatically. Please email me directly at subhajitmahapatra7710@gmail.com'
  );
};

