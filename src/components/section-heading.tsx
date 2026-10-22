export function SectionHeading({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="section-heading">
      <span aria-hidden>{number} /</span>
      <h2>{title}</h2>
    </div>
  );
}
