function ChatPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="mb-4">
            <div className="font-bold">Contact Name</div>
            <div className="text-sm text-gray-500">Last seen: 2 hours ago</div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-200 p-2 rounded max-w-xs">
              Hello! How are you?
            </div>
            <div className="bg-blue-400 text-white p-2 rounded max-w-xs self-end">
              I'm good, thanks! How about you?
            </div>
            <div className="bg-gray-200 p-2 rounded max-w-xs">
              I'm doing well. What are you up to?
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center mx-4 mb-2 py-2 border-1 border-black rounded-lg border-gray-300 ">
        <input type="text" placeholder="Type your message..." className="p-4 mx-4 flex-1 focus:outline-none focus:ring-0 focus:border-gray-300" />
        <button className="bg-blue-500 text-white p-2 mx-2 rounded-lg">Send</button>
      </div>
    </div>
  )
}

export default ChatPage