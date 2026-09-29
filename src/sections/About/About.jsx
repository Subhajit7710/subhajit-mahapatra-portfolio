import Reveal from '../../common/Reveal';
import styles from './AboutStyles.module.css';

function About({ profile }) {
  if (!profile) {
    return (
      <section id="about" className={`sectionShell ${styles.container}`}>
        <h1 className="sectionTitle">About</h1>
        <p className={styles.loading}>Loading profile…</p>
      </section>
    );
  }

  return (
    <section id="about" className={`sectionShell ${styles.container}`}>
      <Reveal>
        <h1 className="sectionTitle">About</h1>
        <p className={styles.summary}>{profile.summary}</p>
      </Reveal>

      <div className={styles.grid}>
        <Reveal delay={80}>
          <article className={styles.panel}>
            <h3>Education</h3>
            <ul className={styles.list}>
              {(profile.education || []).map((item) => (
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
              {(profile.experience || []).map((item) => (
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
