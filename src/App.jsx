import { useEffect, useState } from 'react';
import './App.css';
import Hero from './sections/Hero/Hero';
import About from './sections/About/About';
import Projects from './sections/Projects/Projects';
import Skill from './sections/Skill/Skill';
import Certificate from './sections/Certificate/Certificate';
import Contact from './sections/Contact/Contact';
import Footer from './sections/Footer/Footer';
import {
  getProfile,
  getSkills,
  getProjects,
  getCertifications,
} from './services/api';

const NAV_LINKS = [
  { href: '#hero', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#certification', label: 'Certifications' },
  { href: '#contact', label: 'Contact' },
];

function App() {
  const [profile, setProfile] = useState(null);
  const [skillsGrouped, setSkillsGrouped] = useState({});
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const [profileData, skillsData, projectsData, certificationsData] =
          await Promise.all([
            getProfile(),
            getSkills(),
            getProjects(),
            getCertifications(),
          ]);

        setProfile(profileData);
        setSkillsGrouped(skillsData.grouped || {});
        setProjects(projectsData);
        setCertifications(certificationsData);
      } catch (error) {
        console.error('Failed to load portfolio data:', error);
      }
    }

    loadPortfolio();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="topNav" aria-label="Primary">
        <div className="navLinks">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
        <button
          className="menuToggle"
          type="button"
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      <div className={`mobileNav ${menuOpen ? 'open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={closeMenu}>
            {link.label}
          </a>
        ))}
      </div>

      <Hero profile={profile} />
      <About profile={profile} />
      <Projects projects={projects} />
      <Skill skillsGrouped={skillsGrouped} />
      <Certificate certifications={certifications} />
      <Contact />
      <Footer profile={profile} />
    </>
  );
}

export default App;
