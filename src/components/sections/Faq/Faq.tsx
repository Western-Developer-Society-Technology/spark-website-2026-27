"use client";

import { useState } from "react";
import { FAQ_COLUMNS, FAQ_PLACEHOLDER } from "./faq-data";
import styles from "./Faq.module.css";

export default function Faq() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className={styles.faq} aria-labelledby="faq-heading">
      <h2 className={styles.heading} id="faq-heading" data-node-id="116:258">FAQ</h2>
      <div className={styles.panelArtwork} aria-hidden="true">
        {/* Exact exported hand-drawn outline; Figma's code omits this stroke geometry. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/figma/faq-panel.svg" width="1122" height="836" alt="" />
      </div>
      <div className={styles.panel} data-node-id="116:112">
        {FAQ_COLUMNS.map((questions, column) => (
          <div className={styles.column} key={column}>
            {questions.map(({ id, question, width }) => {
              const isOpen = openId === id;
              const answerId = `answer-${id.replace(":", "-")}`;
              const questionId = `question-${id.replace(":", "-")}`;

              return (
                <div key={id}>
                  <h3 className={styles.question}>
                    <button
                      type="button"
                      id={questionId}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpenId(isOpen ? null : id)}
                      data-node-id={id}
                      style={{ width: `calc(${width} * var(--u))` }}
                    >
                      {question}
                    </button>
                  </h3>
                  <div
                    className={styles.answer}
                    id={answerId}
                    role="region"
                    aria-labelledby={questionId}
                    hidden={!isOpen}
                  >
                    {FAQ_PLACEHOLDER}
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
