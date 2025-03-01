const express = require("express");
const cors = require("cors");
const axios = require("axios");
const words = require("categorized-words");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

function getRandomWord(category, length) {
  let allWords = [];

  if (category && words[category]) {
    allWords = words[category];
  } else {
    Object.keys(words).forEach((cat) => {
      allWords = allWords.concat(words[cat]);
    });
  }

  if (length) {
    allWords = allWords.filter((word) => word.length === parseInt(length));
  }

  return allWords.length
    ? allWords[Math.floor(Math.random() * allWords.length)]
    : null;
}

app.get("/api/random-word", async (req, res) => {
  const { category, length } = req.query;

  const word = getRandomWord(category, length);

  if (!word) {
    return res
      .status(404)
      .json({ error: "No word found with the given criteria" });
  }

  console.log(`Generated word: ${word}`); // Debug log

  try {
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );

    console.log("API Response:", response.data); // Debug log

    const definition =
      response.data[0]?.meanings[0]?.definitions[0]?.definition ||
      "Definition not found.";
    res.json({ word, definition });
  } catch (error) {
    console.error(
      "Dictionary API Error:",
      error.response?.data || error.message
    );
    res.json({ word, definition: "Definition not available." });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the Random Word API!");
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
