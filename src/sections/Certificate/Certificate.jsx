import Reveal from '../../common/Reveal';
import styles from './CertificateStyles.module.css';

function Certificate({ certifications }) {
  return (
    <section id="certification" className={`sectionShell ${styles.container}`}>
      <Reveal>
        <h1 className="sectionTitle">Certifications</h1>
        <p className={styles.intro}>Recognition and professional simulations.</p>
      </Reveal>

      {!certifications?.length ? (
        <p className={styles.loading}>Loading certifications…</p>
      ) : (
        <div className={styles.certificateContainer}>
          {certifications.map((item, index) => (
            <Reveal key={item.id} delay={index * 90}>
              <article className={styles.card}>
                <div className={styles.badge}>Achievement</div>
                <h3>{item.title}</h3>
                <p className={styles.meta}>
                  {item.issuer}
                  {item.date ? ` · ${item.date}` : ''}
                </p>
                <p className={styles.description}>{item.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

export default Certificate;
