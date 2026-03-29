export default function LegalPage({ title, body }) {
  return (
    <section className="legal-page">
      <div className="surface-card">
        <p className="section-kicker">CampusVote policy</p>
        <h1>{title}</h1>
        <p>{body}</p>
      </div>
    </section>
  )
}
