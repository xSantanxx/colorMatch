# 🎨 ColorSync Wardrobe
**An Intelligent Wardrobe Manager with Real-Time Color Analysis.**

ColorSync is a React-based web application designed to help users organize their clothing while providing instant color theory insights. By extracting dominant and complementary colors from uploaded images, the app helps users understand their wardrobe's palette and suggests color pairings.

---

## 🚀 Features

* **Real-Time Color Extraction:** Leverages `ColorThief` to analyze uploaded images and determine dominant HSL values.
* **Color Theory Logic:** Custom algorithms (colorCheck.js) calculate the mathematically accurate complementary hue for every item.
* **Interactive Results:** Visual feedback loops that display extracted colors with "click-to-copy" hex/name functionality.
* **Personal Collection:** Filtered views allowing users to manage their own uploads independently.
* **Favorites System:** A persistent sidebar to curate a personal wishlist of clothing items.
* **Glassmorphism UI:** A sleek interface using Tailwind CSS with backdrop blurs and responsive transitions.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS
* **Backend:** Supabase (Auth & PostgreSQL)
* **Image Processing:** ColorThief, Color-Namer
* **Notifications:** React-Toastify

---

## 🧠 Technical Case Study: Solving the Mobile Performance Bottleneck

### The Problem
During initial development, the application utilized a monolithic single-file architecture. While functional on desktop, this caused significant **memory exhaustion** on mobile devices. The simultaneous execution of image processing, database fetching, and global state updates led to frequent browser crashes.

### The Solution: Modular Refactoring
I refactored the application into a **Modular Component Architecture**. 

1. **State Isolation:** By moving logic into specific components (`VerifyComp`, `mainApp`, `gallery`), I limited the "render surface."
2. **Resource Management:** Component separation allowed the mobile browser to "garbage collect" unused logic (like the Auth form) once the user moved to the Gallery.
3. **Prop Drilling vs. Lifting State:** I reorganized the data flow to ensure only the necessary information was passed to child components, reducing the CPU load during scrolling.



---

## 📂 Project Structure

```text
src/
├──
├── VerifyComp.jsx       # User Authentication & Guest Mode
├── countDown.jsx        # Splash screen entry animation
├── mainApp.jsx          # Core logic: Color analysis & Results
│   └── gallery.jsx      # Individual wardrobe cards
├── colorCheck.js        # Custom color theory utility
└── App.jsx              # Main Stage Controller
