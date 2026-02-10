export default function App() {
  return (
    <div className="h-screen w-screen flex bg-gray-100">

      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r flex flex-col">

  <div className="p-4 font-bold text-xl border-b">
    Telegram
  </div>

  <div className="flex-1 overflow-y-auto">

    <div className="p-3 border-b hover:bg-gray-100 cursor-pointer">
      <div className="font-semibold">John Doe</div>
      <div className="text-sm text-gray-500 truncate">
        Hey, how are you?
      </div>
    </div>

    <div className="p-3 border-b hover:bg-gray-100 cursor-pointer bg-gray-100">
      <div className="font-semibold">Mary Jane</div>
      <div className="text-sm text-gray-500 truncate">
        Let’s meet tomorrow
      </div>
    </div>

    <div className="p-3 border-b hover:bg-gray-100 cursor-pointer">
      <div className="font-semibold">Tech Group</div>
      <div className="text-sm text-gray-500 truncate">
        New project updates...
      </div>
    </div>

  </div>

</div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">

        {/* Chat Header */}
        <div className="h-16 bg-white border-b flex items-center px-4 font-semibold">
          Select a chat
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="text-gray-400 text-center">
            No messages yet
          </div>
        </div>

        {/* Input */}
        <div className="h-16 bg-white border-t flex items-center px-4">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

      </div>

    </div>
  )
}
