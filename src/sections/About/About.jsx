import Reveal from '../../common/Reveal';
import styles from './AboutStyles.module.css';

const DEFAULT_SUMMARY =
  'MCA student and aspiring software engineer skilled in Java, JavaScript, React.js, Node.js, and Express.js. Learning to build REST APIs, authentication flows, and full-stack applications. Also exploring AI with PyTorch, Hugging Face, and related tools, with a focus on practical projects and end-to-end development.';

const DEFAULT_EDUCATION = [
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
];

const DEFAULT_EXPERIENCE = [
  {
    id: 1,
    role: 'Frontend Developer Intern',
    company: 'Techplement',
    duration: 'Jun 2024 – Jul 2024',
    description:
      'Integrated REST APIs and Stripe, improving checkout success rate by 75%. Used React hooks to manage state and component lifecycle efficiently. Ensured cross-browser compatibility and mobile responsiveness.',
  },
];

function About({ profile }) {
  const summary = profile?.summary || DEFAULT_SUMMARY;
  const education = profile?.education || DEFAULT_EDUCATION;
  const experience = profile?.experience || DEFAULT_EXPERIENCE;

  return (
    <section id="about" className={`sectionShell ${styles.container}`}>
      <Reveal>
        <h1 className="sectionTitle">About</h1>
        <p className={styles.summary}>{summary}</p>
      </Reveal>

      <div className={styles.grid}>
        <Reveal delay={80}>
          <article className={styles.panel}>
            <h3>Education</h3>
            <ul className={styles.list}>
              {education.map((item) => (
                <li key={item.id}>
                  <strong>{item.degree}</strong>
                  <span>
                    {item.institution} · CGPA {item.cgpa} · {item.year}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>

        <Reveal delay={160}>
          <article className={styles.panel}>
            <h3>Experience</h3>
            <ul className={styles.list}>
              {experience.map((item) => (
                <li key={item.id}>
                  <strong>
                    {item.role} · {item.company}
                  </strong>
                  <span className={styles.meta}>{item.duration}</span>
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

export default About;
