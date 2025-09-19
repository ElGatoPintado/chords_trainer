import React, { useState, useEffect, useRef } from "react";
import "./styles.css";
import Metronome from "./Metronome";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const CHORDS = [
  "C",
  "Cm",
  "C7",
  "D",
  "Dm",
  "D7",
  "E",
  "Em",
  "E7",
  "F",
  "Fm",
  "F7",
  "G",
  "Gm",
  "G7",
  "A",
  "Am",
  "A7",
  "B",
  "Bm",
  "B7",
];

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function App() {
  const [mode, setMode] = useState("note"); // 'note' или 'chord'
  const [current, setCurrent] = useState("");
  // const [bpm, setBpm] = useState(60);
  const [bpm, setBpm] = useState("40");
  const timer = useRef(null);
  const bpmNumber = Math.min(120, Math.max(20, Number(bpm) || 40));

  const wakeLock = useRef(null);

  useEffect(() => {
    async function requestWakeLock() {
      try {
        if ("wakeLock" in navigator) {
          wakeLock.current = await navigator.wakeLock.request("screen");
          wakeLock.current.addEventListener("release", () => {
            console.log("Wake Lock released");
          });
          console.log("Wake Lock is active");
        } else {
          console.log("Wake Lock API not supported");
        }
      } catch (err) {
        console.error("Failed to acquire Wake Lock:", err);
      }
    }

    requestWakeLock();

    // Освобождаем Wake Lock при уходе с страницы или потере видимости
    function handleVisibilityChange() {
      if (wakeLock.current && document.visibilityState === "visible") {
        requestWakeLock();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (wakeLock.current) {
        wakeLock.current.release();
        wakeLock.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    next();
    clearInterval(timer.current);
    const interval = Math.max(250, 60000 / bpmNumber);
    timer.current = setInterval(next, interval);
    return () => clearInterval(timer.current);
  }, [mode, bpmNumber]);

  function next() {
    const pool = mode === "note" ? NOTES : CHORDS;
    setCurrent(getRandomItem(pool));
  }

  function increaseBpm(amount) {
    const currentBpm = Number(bpm) || 40;
    // setBpm((prev) => Math.min(240, prev + amount));
    // setBpm((prev) => Math.min(240, Math.max(30, prev + amount)));
    const newBpm = Math.min(120, Math.max(20, currentBpm + amount));
    setBpm(newBpm.toString());
  }

  function handleBpmChange(e) {
    const val = e.target.value;
    if (val === "" || /^[0-9\b]+$/.test(val)) {
      setBpm(val);
    }
  }

  return (
    <div className="container">
      <h1>Note trainer</h1>

      <div className="controls">
        <label>
          <span>Режим:</span>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="note">Ноты</option>
            <option value="chord">Аккорды</option>
          </select>
        </label>

        <label>
          <span>Темп (BPM):</span>
          <div class="temp-controls">
            <button
              className="btn-change-temp"
              aria-label="Уменьшить темп на 5"
              onClick={() => increaseBpm(-5)}
            >
              -5
            </button>
            <input
              type="number"
              min="20"
              max="120"
              value={bpm}
              onChange={handleBpmChange}
            />
            <button
              className="btn-change-temp"
              aria-label="Увеличить темп на 5"
              onClick={() => increaseBpm(5)}
            >
              +5
            </button>
          </div>
        </label>

        <button onClick={next} style={{ alignSelf: "center" }}>
          Следующая
        </button>
      </div>

      <div className="result">{current}</div>

      <Metronome bpm={bpm} />
    </div>
  );
}

export default App;
