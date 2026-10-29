import styles from "./About.module.css";

export default function About() {
  return (
    <section className={styles.about} aria-labelledby="about-heading">
      <h2 id="about-heading" className={styles.heading} data-node-id="111:191">
        Every great idea<br />starts with a spark.
      </h2>
      <p className={styles.copy} data-node-id="111:190">
        The world doesn&apos;t change through ideas alone. It changes when people dare to build,
        challenge what&apos;s possible, and turn imagination into action. Spark brings together the
        next generation of creators, thinkers, and problem-solvers to build technology that means
        something, because the future isn&apos;t something we wait for. It&apos;s something we create.
      </p>
    </section>
  );
}
