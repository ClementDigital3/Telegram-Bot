import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/send";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const chatEndRef = useRef(null);

  const fetchMessages = async () => {
    const res = await axios.get("http://localhost:5000/messages");
    setMessages(res.data);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    await axios.post(API_URL, {
      name: "Clement",
      email: "clement@example.com",
      message: text
    });

    setText("");
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-blue-600 text-white text-lg font-semibold p-4 shadow">
        Telegram Render 💬
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex">
            <div className="bg-white px-4 py-2 rounded-xl shadow max-w-[75%]">
              <span className="font-semibold text-blue-600">
                {msg.name}:
              </span>{" "}
              <span>{msg.message}</span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
