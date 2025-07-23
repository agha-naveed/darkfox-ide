export default function TabBar({ fileName }) {
  return (
    <div className="flex items-center bg-zinc-800 px-2 h-10 text-sm">
      {fileName && (
        <div className="mr-4 px-2 py-1 bg-gray-800 rounded">{fileName}</div>
      )}
    </div>
  );
}
