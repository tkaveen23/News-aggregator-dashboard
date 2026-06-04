# Multi-lingual News Aggregator Dashboard

An interactive, responsive dashboard built to visualize categorized and deduplicated news articles across English, Sinhala, and Tamil media.

## Project Demo
🔗 **Live Link:** [Insert your Netlify Live URL here]

## Architecture Overview
This dashboard serves as the user-facing visualization layer of a larger news aggregation system. 

* **Data Pipeline (Proprietary / Private)**: An automated Python pipeline that scrapes local newspapers, translates non-English content, and uses LLM models to categorize and semantically deduplicate news events.
* **Frontend Dashboard (Public / This Repository)**: A serverless, lightweight client-side application built with vanilla HTML, CSS, and JavaScript. It handles real-time searches, multi-lingual filtering, and dynamic sorting by news importance scores.

## Key Frontend Features
* **Multi-lingual Language Selector**: Instantly filter articles across English, Sinhala, and Tamil.
* **Smart Category Navigation**: Seamlessly filter articles by key topics (Economy, Politics, Weather, Law, etc.).
* **Flexible Sorting & Search**: Sort articles dynamically by AI-calculated importance or publication date, with instant full-text search matching headlines and tags.
* **Theme Support**: Premium UI with light and dark mode toggles.
