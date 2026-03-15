import styles from "./admin-panel.module.css";

export function BrandIcon() {
  return (
    <img
      src="/favicon.png"
      alt="PMTL Icon"
      className={styles.brandMark}
      style={{ objectFit: 'contain', padding: '4px' }}
    />
  );
}
