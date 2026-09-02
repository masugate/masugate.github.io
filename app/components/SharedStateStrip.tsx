import { homepageContent } from "../data/homepage";
import styles from "./SharedStateStrip.module.css";

function SharedStateGlyph({ kind }: { kind: "capacity" | "time" | "work" }) {
  return (
    <span aria-hidden="true" className={styles.glyph} data-state-kind={kind}>
      <i />
      <i />
      <i />
    </span>
  );
}

export function SharedStateStrip() {
  return (
    <ul className={styles.strip}>
      {homepageContent.sharedState.items.map((item, index) => (
        <li className={styles.item} key={item.id}>
          <span className={styles.index}>0{index + 1}</span>
          <SharedStateGlyph kind={item.id} />
          <div>
            <h3>{item.label}</h3>
            <p>{item.caption}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
