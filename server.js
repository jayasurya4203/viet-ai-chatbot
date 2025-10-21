// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // For Node 18+

const app = express();
app.use(bodyParser.json());
app.use(cors());

const SERPAPI_KEY = "f94cf102ec702243fdecd43858183b0f0626f71cc19ed22915223a40d617ec1d";

// Serve index.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  let reply = "";

  if (!userMessage) {
    return res.json({ reply: "⚠️ Please enter a message!" });
  }

  const msg = userMessage.toLowerCase();

  // Hardcoded responses
  if (msg.includes("admission")) {
    reply = "Admissions at VIET are through AP EAMCET/ECET. Visit viet.ac.in for details.";
  } else if (msg.includes("placements")) {
    reply = "Our Placement Cell works with companies like TCS, Infosys, Wipro.";
  } else if (msg.includes("courses")) {
    reply = "VIET offers Engineering courses in CSE, ECE, EEE, Civil, Mechanical, and more.";
  } else if (msg.includes("facilities")) {
    reply = "VIET provides libraries, labs, sports facilities, hostels, and cafeteria.";
  } else if (msg.includes("events")) {
    reply = "VIET organizes technical fests, cultural events, workshops, and seminars.";
  } else if (msg.includes("contact")) {
    reply = "Contact VIET at info@viet.ac.in or call +91-XXX-XXXXXXX.";
  } else {
    // Fetch from SerpAPI or fallback to Wikipedia
    try {
      const url = `https://serpapi.com/search.json?q=${encodeURIComponent(userMessage)}&api_key=${SERPAPI_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.answer_box && data.answer_box.answer) {
        reply = data.answer_box.answer;
      } else if (data.organic_results && data.organic_results.length > 0) {
        reply = data.organic_results[0].snippet;
      } else {
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(userMessage)}`;
        const wikiRes = await fetch(wikiUrl);
        const wikiData = await wikiRes.json();
        reply = wikiData.extract || "I couldn't find an answer. Please try again!";
      }
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      reply = "⚠️ Error fetching from Google Search.";
    }
  }

  res.json({ reply });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
