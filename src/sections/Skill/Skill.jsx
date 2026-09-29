import Reveal from '../../common/Reveal';
import styles from './SkillStyles.module.css';

function Skill({ skillsGrouped }) {
  const categories = Object.entries(skillsGrouped || {});

  return (
    <section id="skills" className={`sectionShell ${styles.container}`}>
      <Reveal>
        <h1 className="sectionTitle">Skills</h1>
        <p className={styles.intro}>
          Tools and technologies I use to design, build, and ship products.
        </p>
      </Reveal>

      {!categories.length ? (
        <p className={styles.loading}>Loading skills…</p>
      ) : (
        <div className={styles.grid}>
          {categories.map(([category, skills], index) => (
            <Reveal key={category} delay={index * 80}>
              <article className={styles.panel}>
                <h3 className={styles.category}>{category}</h3>
                <div className={styles.skillList}>
                  {skills.map((skill) => (
                    <span key={skill} className={styles.skillChip}>
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

export default Skill;
