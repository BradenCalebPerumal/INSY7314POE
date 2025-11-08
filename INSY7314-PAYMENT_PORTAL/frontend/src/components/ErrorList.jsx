export default function ErrorList({ errors = [] }) {
    if (!errors.length) return null;
    return (
      <div className="f-error">
        <strong style={{ display: "block", marginBottom: 6 }}>Fix the following:</strong>
        <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>
    );
  }
  