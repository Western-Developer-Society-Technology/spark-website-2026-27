"use client";

import { useState } from "react";
import { FAQ_COLUMNS } from "./faq-data";
import styles from "./FaqPanel.module.css";

export default function FaqPanel() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className={styles.faq} aria-labelledby="faq">
      <h2 className={styles.heading} id="faq" data-node-id="116:258">FAQ</h2>
      <div className={styles.panelArtwork} aria-hidden="true">
        {/* Exact exported hand-drawn outline; Figma's code omits this stroke geometry. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/figma/faq-panel.svg" width="1122" height="996" alt="" />
      </div>
      <div className={styles.panel} data-node-id="116:112">
        {FAQ_COLUMNS.map((questions, column) => (
          <div className={styles.column} key={column}>
            {questions.map(({ id, question, answer }) => {
              const isOpen = openId === id;
              const answerId = `answer-${id.replace(":", "-")}`;
              const questionId = `question-${id.replace(":", "-")}`;

              return (
                <div className={styles.item} key={id}>
                  <h3 className={styles.question}>
                    <button
                      type="button"
                      id={questionId}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpenId(isOpen ? null : id)}
                      data-node-id={id}
                    >
                      <span>{question}</span>
                      <svg
                        className={styles.toggleIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M5 12h14" />
                        <path className={styles.iconStem} d="M12 5v14" />
                      </svg>
                    </button>
                  </h3>
                  <div
                    className={styles.answer}
                    id={answerId}
                    role="region"
                    aria-labelledby={questionId}
                    aria-hidden={!isOpen}
                    inert={!isOpen}
                    data-open={isOpen}
                  >
                    <div className={styles.answerContent}>
                      <p className={styles.answerText}>{answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
