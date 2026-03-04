type Props = {
  title?: string;
};

export default function AppLoading({ title = "Memuat..." }: Props) {
  return (
    <div className="loading-shell" aria-live="polite" aria-busy="true">
      <h2>{title}</h2>
      <div className="loading-card">
        <div className="loading-row" style={{ width: "62%" }} />
        <div className="loading-row" style={{ width: "88%" }} />
        <div className="loading-row" style={{ width: "76%" }} />
      </div>
      <div className="loading-card">
        <div className="loading-row" style={{ width: "48%" }} />
        <div className="loading-row" style={{ width: "92%" }} />
        <div className="loading-row" style={{ width: "71%" }} />
      </div>
    </div>
  );
}
