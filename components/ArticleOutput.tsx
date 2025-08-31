export default function ArticleOutput({ content }: { content: string }) {
  if (!content) return null;

  return (
    <div className="mt-6 p-6 bg-gray-100 rounded-2xl shadow-inner whitespace-pre-wrap">
      <h2 className="text-xl font-bold mb-4">Generated Article:</h2>
      <p>{content}</p>
    </div>
  );
}
