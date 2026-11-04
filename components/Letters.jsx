import { Fragment } from 'react';

/* Text split into letters the saucer can pick up and drop
   (components/UFO.jsx looks for [data-ufo-letter]). Words stay unbreakable
   so a line never wraps mid-word. Callers are responsible for giving
   screen readers the sentence once (sr-only copy, aria-hidden here). */
export default function Letters({ text }) {
  const words = String(text).split(' ');
  return words.map((word, wi) => (
    <Fragment key={wi}>
      <span className="inline-block whitespace-nowrap">
        {[...word].map((ch, i) => (
          <span key={i} data-ufo-letter="" className="ufo-letter">{ch}</span>
        ))}
      </span>
      {wi < words.length - 1 ? ' ' : null}
    </Fragment>
  ));
}

/* A heading whose visible text is made of saucer letters. */
export function LetterHeading({ as: Tag = 'h2', text, className = '', children }) {
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{children || <Letters text={text} />}</span>
    </Tag>
  );
}
