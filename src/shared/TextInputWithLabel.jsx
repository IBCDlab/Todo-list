import styles from "./TextInputWithLabel.module.css";

export default function TextInputWithLabel({
  elementId,
  labelText,
  onChange,
  ref,
  value,
}) {
  return (
    <>
      <label htmlFor={elementId}>{labelText}</label>
      <input
        className={styles.input}
        type="text"
        id={elementId}
        ref={ref}
        value={value}
        onChange={onChange}
        maxLength={100}
      />
    </>
  );
}
