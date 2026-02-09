export default function StaticPrivacy() {
  return (
    <div>
      <h1 className="text-3xl font-semibold">Privacy</h1>
      <p className="mt-2 text-gray-600">
        OmniTool AI stores inputs and outputs for up to 60 minutes, after which
        they are automatically deleted. We do not log raw prompts or file
        contents beyond processing, and signed URLs are used for downloads.
      </p>
    </div>
  );
}
