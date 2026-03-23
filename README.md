# 🤖 ADAM AI

> **Intelligent Knowledge Discovery Platform**
>
> Powered by Gemini, ChatGPT, and Copilot. Features interactive AI insights, visual generation, and multilingual support.

---

## 🚀 Features

- 🌍 **Multilingual Support**: Full support for English and Arabic.
- 🧠 **Multi-Model AI**: Seamless integration with Gemini, ChatGPT, and Copilot.
- 🎙️ **Live Voice Chat**: Real-time voice interaction with ADAM AI.
- 🎨 **Visual Generation**: Generate high-quality images and videos from text prompts.
- 🔍 **Knowledge Explorer**: Search and discover insights from a vast knowledge base.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS 4, Motion |
| **Backend** | Express (Node.js) |
| **AI SDKs** | `@google/genai`, `openai` |
| **Icons** | Lucide React |

---

## 📦 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd adam-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the example file and add your API keys:
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

---

## 🔑 Environment Variables

The following variables are required for full functionality:

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Your Google Gemini API key (handled automatically in AI Studio) |
| `OPENAI_API_KEY` | Your OpenAI API key (required for ChatGPT/Copilot) |

---

## 📜 Scripts

- `npm run dev`: Starts the Express server with Vite middleware.
- `npm run build`: Builds the frontend for production.
- `npm run lint`: Runs TypeScript type checking.
- `npm run clean`: Removes the `dist` directory.

---

## ⚖️ License

This project is licensed under the **MIT License**.
