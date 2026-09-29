import styles from './HeroStyle.module.css';
import heroImg from '../../assets/assets/hero-img.png';
import sun from '../../assets/assets/sun.svg';
import moon from '../../assets/assets/moon.svg';
import githubLight from '../../assets/assets/github-light.svg';
import githubDark from '../../assets/assets/github-dark.svg';
import LinkedinLight from '../../assets/assets/linkedin-light.svg';
import LinkedinDark from '../../assets/assets/linkedin-dark.svg';
import CV from '../../assets/assets/resume.pdf';
import { useTheme } from '../../common/ThemeContext';

function Hero({ profile }) {
  const { theme, toggleTheme } = useTheme();
  const themeIcon = theme === 'light' ? sun : moon;
  const githubIcon = theme === 'light' ? githubLight : githubDark;
  const LinkedinIcon = theme === 'light' ? LinkedinLight : LinkedinDark;

  const name = profile?.name || 'Subhajit Mahapatra';
  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ');
  const title = profile?.title || 'Aspiring Software Engineer';
  const summary =
    profile?.summary ||
    'MCA student and aspiring software engineer skilled in Java, JavaScript, React.js, Node.js, and Express.js. Learning to build REST APIs, authentication flows, and full-stack applications. Also exploring AI with PyTorch, Hugging Face, and related tools, with a focus on practical projects and end-to-end development.';

  return (
    <section id="hero" className={styles.container}>
      <div className={styles.info}>
        <p className={styles.eyebrow}>Available for opportunities</p>
        <h1>
          {firstName}{' '}
          <span className={styles.lastName}>{lastName}</span>
        </h1>
        <h2>{title}</h2>
        <p className={styles.description}>{summary}</p>

        <div className={styles.actions}>
          <a href={CV} download="Subhajit_Mahapatra_Resume.pdf">
            <button className={styles.primaryBtn} type="button">
              Download Resume
            </button>
          </a>
          <a href="#projects" className={styles.secondaryBtn}>
            View Projects
          </a>
        </div>

        <div className={styles.socials}>
          <a
            href={profile?.github || 'https://github.com/Subhajit7710'}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className={styles.iconBtn}
          >
            <img src={githubIcon} alt="" />
          </a>
          <a
            href={
              profile?.linkedin ||
              'https://www.linkedin.com/in/subhajit-mahapatra-452136311/'
            }
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className={styles.iconBtn}
          >
            <img src={LinkedinIcon} alt="" />
          </a>
          <a
            className={styles.contactLink}
            href={`mailto:${profile?.email || 'subhajitmahapatra7710@gmail.com'}`}
          >
            {profile?.email || 'subhajitmahapatra7710@gmail.com'}
          </a>
          <a
            className={styles.contactLink}
            href={`tel:${(profile?.phone || '+91 9382100631').replace(/\s/g, '')}`}
          >
            {profile?.phone || '+91 9382100631'}
          </a>
        </div>
      </div>

      <div className={styles.visual}>
        <div className={styles.colorModeContainer}>
          <img
            className={styles.hero}
            src={heroImg}
            alt="Portrait of Subhajit Mahapatra"
          />
          <button
            className={styles.colorMode}
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
          >
            <img src={themeIcon} alt="" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
