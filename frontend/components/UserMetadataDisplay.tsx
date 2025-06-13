export default function UserMetadataDisplay({
  metadata,
}: {
  metadata: { email: string; name: string; institution: string };
}) {
  return (
    <div className="mb-2">
      <p className="font-bold">Your Metadata:</p>
      <ul className="bg-card p-2 rounded border border-border">
        <li><span className="font-semibold">Email:</span> {metadata.email}</li>
        <li><span className="font-semibold">Name:</span> {metadata.name}</li>
        <li><span className="font-semibold">Institution:</span> {metadata.institution}</li>
      </ul>
    </div>
  );
}
