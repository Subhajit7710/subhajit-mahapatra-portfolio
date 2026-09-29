import Reveal from '../../common/Reveal';
import styles from './ProjectsStyles.module.css';

function Projects({ projects }) {
  return (
    <section id="projects" className={`sectionShell ${styles.container}`}>
      <Reveal>
        <h1 className="sectionTitle">Projects</h1>
        <p className={styles.intro}>
          Selected work spanning full-stack systems and applied AI.
        </p>
      </Reveal>

      {!projects?.length ? (
        <p className={styles.loading}>Loading projects…</p>
      ) : (
        <div className={styles.projectsContainer}>
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={index * 100}>
              <article className={styles.projectCard}>
                <div className={styles.cardTop}>
                  <span className={styles.index}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3>{project.title}</h3>
                </div>
                <p className={styles.description}>{project.description}</p>
                <div className={styles.techList}>
                  {String(project.tech_stack)
                    .split(',')
                    .map((tech) => tech.trim())
                    .filter(Boolean)
                    .map((tech) => (
                      <span key={tech} className={styles.techChip}>
                        {tech}
                      </span>
                    ))}
                </div>
                <div className={styles.links}>
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {project.github_url_secondary ? 'Frontend →' : 'GitHub →'}
                    </a>
                  )}
                  {project.github_url_secondary && (
                    <a
                      href={project.github_url_secondary}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Backend →
                    </a>
                  )}
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noreferrer">
                      Live →
                    </a>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

export default Projects;
