import { BrandIcon } from "./BrandIcon";
import styles from "./admin-panel.module.css";

export function BrandLogo() {
  return (
    <div className={styles.brandLogo}>
      <BrandIcon />
      <div className={styles.brandText}>
        <span className={styles.brandTitle}>PMTL_VN</span>
        <span className={styles.brandSubtitle}>Quan tri noi dung va cong dong</span>
      </div>
    </div>
  );
}
