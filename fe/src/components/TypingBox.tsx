export default function TypingBox() {
  return (
    <div className="flex flex-row items-center mx-4 mb-2 py-2 border-1 border-black rounded-lg border-gray-300 ">
      <input
        type="text"
        placeholder="Type your message..."
        className="p-4 mx-4 flex-1 focus:outline-none focus:ring-0 focus:border-gray-300"
      />
      <button className="bg-blue-500 text-white p-2 mx-2 rounded-lg">
        Send
      </button>
    </div>
  );
}
