import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "/api";
const MESSAGES_URL = `${API_BASE_URL}/messages`;
const HEALTH_URL = `${API_BASE_URL}/health`;

const initialForm = {
  name: "Clement",
  email: "clement@example.com",
  message: "",
};

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [messages, setMessages] = useState([]);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);

  async function fetchHealth() {
    try {
      const response = await axios.get(HEALTH_URL);
      setHealth(response.data);
    } catch {
      setHealth(null);
    }
  }

  async function fetchMessages() {
    try {
      setError("");
      const response = await axios.get(MESSAGES_URL);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load messages.");
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshData() {
    await Promise.all([fetchHealth(), fetchMessages()]);
  }

  function onFieldChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function sendMessage(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim() || isSending) {
      setError("Name, email, and message are required.");
      return;
    }

    try {
      setIsSending(true);
      setError("");
      setSuccess("");

      const response = await axios.post(MESSAGES_URL, {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });

      setForm((current) => ({ ...current, message: "" }));
      setSuccess(
        response.data.telegramDelivered
          ? "Message saved and sent to Telegram."
          : response.data.warning || "Message saved."
      );
      await refreshData();
    } catch (err) {
      const payload = err.response?.data;
      setError(payload?.details || payload?.error || "Unable to send message.");
      await fetchHealth();
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    Promise.all([fetchHealth(), fetchMessages()]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 lg:grid lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-8 lg:px-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur md:p-8">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-amber-600">
              Telegram Control
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-slate-950">
              Send website messages straight into your Telegram bot.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This panel writes to MongoDB through your Express backend and reports whether
              Telegram delivery succeeds.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">API</div>
              <div className="mt-1 text-sm font-semibold">
                {health?.ok ? "Online" : "Unavailable"}
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-900">
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-600">MongoDB</div>
              <div className="mt-1 text-sm font-semibold">{health?.mongodb || "Unknown"}</div>
            </div>
            <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sky-900">
              <div className="text-xs uppercase tracking-[0.2em] text-sky-600">Telegram</div>
              <div className="mt-1 text-sm font-semibold">{health?.telegram || "Unknown"}</div>
            </div>
          </div>

          <form className="mt-8 space-y-4" onSubmit={sendMessage}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  name="name"
                  onChange={onFieldChange}
                  value={form.name}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  name="email"
                  onChange={onFieldChange}
                  type="email"
                  value={form.email}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Message</span>
              <textarea
                className="min-h-40 w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                name="message"
                onChange={onFieldChange}
                placeholder="Write the message that should be stored and forwarded to Telegram..."
                value={form.message}
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isSending}
                type="submit"
              >
                {isSending ? "Sending..." : "Send To Backend"}
              </button>
              <button
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                onClick={refreshData}
                type="button"
              >
                Refresh Messages
              </button>
            </div>
          </form>
        </section>

        <section className="flex min-h-[540px] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.75)]">
          <div className="border-b border-white/10 px-5 py-4 md:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Message Stream
                </p>
                <h2 className="mt-1 text-xl font-semibold">Stored backend conversations</h2>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                {messages.length} total
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 md:px-6">
            {isLoading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                Loading messages...
              </div>
            ) : null}

            {!isLoading && messages.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 px-6 py-10 text-center text-sm text-slate-400">
                No messages yet. Send one from the form to confirm the full frontend to backend flow.
              </div>
            ) : null}

            {messages.map((msg) => (
              <article
                key={msg._id || `${msg.name}-${msg.createdAt || msg.message}`}
                className="max-w-[90%] rounded-[1.75rem] bg-white px-5 py-4 text-slate-900 shadow-lg shadow-black/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{msg.name}</p>
                    <p className="text-xs text-slate-500">{msg.email}</p>
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-amber-600">
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{msg.message}</p>
              </article>
            ))}
            <div ref={chatEndRef} />
          </div>
        </section>
      </div>
    </div>
  );
}
