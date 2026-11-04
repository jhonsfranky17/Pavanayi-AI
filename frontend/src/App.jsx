import { useState } from "react";
import "./App.css";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from backend");
      }

      const data = await response.json();

      const assistantMessage = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h2>Pavanayi AI</h2>
        <span>Powered by Gemma 4 E2B</span>
      </header>

      <main className="chat-container">
        {messages.length === 0 && (
          <div className="welcome">
            <h1>How can I help you today?</h1>
            <p>Ask me anything!</p>
          </div>
        )}

        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <strong>{message.role === "user" ? "You" : "Gemma"}</strong>

              <p>{message.content}</p>
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <strong>Gemma</strong>
              <p>Thinking...</p>
            </div>
          )}
        </div>
      </main>

      <footer className="input-area">
        <input
          type="text"
          placeholder="Message Gemma..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") sendMessage();
          }}
          disabled={loading}
        />

        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? "Sending..." : "Send"}
        </button>
      </footer>
    </div>
  );
};

export default App;
