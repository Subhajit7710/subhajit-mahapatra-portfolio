import styles from './FooterStyle.module.css';

function Footer({ profile }) {
  const email = profile?.email || 'subhajitmahapatra7710@gmail.com';

  return (
    <footer id="footer" className={styles.container}>
      <p className={styles.handle}>@Subhajit Mahapatra</p>
      <a className={styles.email} href={`mailto:${email}`}>
        {email}
      </a>
    </footer>
  );
}

export default Footer;
