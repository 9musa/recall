# Recall

This project was built using Create React App and extended into a full-stack application using Supabase for authentication and database functionality.

> **Live Demo:** [https://recall-ecru.vercel.app/](https://recall-ecru.vercel.app/)

Recall is a minimal, search-first note-taking application designed for capturing thoughts, insights, and niche information the moment they appear—especially in situations where ideas are easily lost while browsing or consuming content.

## The Idea

Recall was built around a simple problem: when you come across something interesting while browsing or learning online, it’s easy to lose it before you actually write it down. Traditional note-taking tools often feel too slow for these moments, especially when they require navigating folders or structured workflows that interrupt your flow.

Recall reduces that friction by using a single search-based interface for both finding and creating notes. You type once, and either open an existing note immediately or create a new one in the same place if it doesn’t exist.

Notes are treated as living entries that can be revisited and expanded over time, especially when you fall into the rabbit hole and keep digging for more information.

---

## Core Interaction Model

### **Search** is the interface
* Typing in the search bar immediately queries existing notes
* If no match is found, a creation button is dynamically revealed
* Notes are edited in a focused view and saved automatically on exit


---

## Features

* **Search-first Design** Notes are accessed and created through a single input field
* **Instant Creation:** New notes are created without any navigation or menus
* **Living Notes:** Easy to append notes
* **Streamlined UI:** Minimal interface optimized for rapid input and quick reading

---

## Project Structure

```text
Recall/
├── public/
│   └── index.html          # HTML app shell
│
├── src/
│   ├── components/
│   │   ├── Bar.jsx         # Main search + create interaction controller
│   │   ├── Button.jsx      # Reusable UI button component
│   │   └── Login.js        # Authentication/login screen
│   │
│   ├── App.js              # Core app state, routing logic, and Supabase integration
│   ├── supabaseClient.js   # Supabase client initialization + configuration
│   ├── index.js            # React application entry point
│   ├── index.css           # Global layout and utility styles
│   └── App.css             # App-specific view styling
│
├── .env                    # Environment variables (Local Supabase keys - gitignored)
├── package.json            # Project dependencies and build scripts
└── README.md               # Documentation and project overview
```

---

## Tech Stack

* **Frontend Library:** React.js
* **Styling:** CSS3
* **Deployment & Hosting** Vercel
* **Authentication Engine** Supabase Auth
* **Database Platform** Supabase

---

