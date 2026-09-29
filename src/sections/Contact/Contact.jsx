import { useState } from 'react';
import Reveal from '../../common/Reveal';
import styles from './ContactStyles.module.css';
import { sendContact } from '../../services/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', text: '' });

    try {
      const result = await sendContact(form);
      setStatus({ type: 'success', text: result.message });
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus({
        type: 'error',
        text: error.message || 'Failed to send message.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className={`sectionShell ${styles.container}`}>
      <Reveal>
        <h1 className="sectionTitle">Contact</h1>
        <p className={styles.intro}>
          Have a role, collaboration, or idea in mind? Send a message.
        </p>
      </Reveal>

      <Reveal delay={100}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="message">Message</label>
            <textarea
              name="message"
              id="message"
              placeholder="Tell me about the opportunity..."
              value={form.message}
              onChange={handleChange}
              required
            />
          </div>
          <button
            className={styles.submit}
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Sending…' : 'Send Message'}
          </button>
          {status.text && (
            <p
              className={
                status.type === 'success' ? styles.success : styles.error
              }
            >
              {status.text}
            </p>
          )}
        </form>
      </Reveal>
    </section>
  );
}
