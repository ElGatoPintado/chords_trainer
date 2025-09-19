import React, { useEffect, useRef, useState } from "react";

function Metronome({ bpm }) {
  const [isRunning, setIsRunning] = useState(false);
  const timerId = useRef(null);
  const audioCtx = useRef(null);
  const nextTickTime = useRef(0);

  // Функция для щелчка с помощью Web Audio API
  function playClick() {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    const ctx = audioCtx.current;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.frequency.value = 1000;
    gainNode.gain.setValueAtTime(1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  // Планирование следующего щелчка
  function scheduleTick() {
    const interval = (60 / bpm) * 1000;
    nextTickTime.current = performance.now() + interval;

    playClick();

    timerId.current = setTimeout(() => {
      if (isRunning) scheduleTick();
    }, interval);
  }

  // Старт/стоп обработки
  function toggle() {
    if (isRunning) {
      clearTimeout(timerId.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  }

  // реакция на изменение isRunning и bpm
  useEffect(() => {
    if (isRunning) {
      scheduleTick();
    } else {
      clearTimeout(timerId.current);
    }
    return () => clearTimeout(timerId.current);
  }, [isRunning, bpm]);

  return (
    <div
      style={{
        marginTop: "32px",
        fontSize: "1.3rem",
        color: "#a4b3b6",
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <button
        onClick={toggle}
        style={{
          backgroundColor: "#8265a7",
          borderRadius: "12px",
          border: "none",
          color: "#a4b3b6",
          padding: "10px 20px",
          fontWeight: "700",
          cursor: "pointer",
          userSelect: "none",
          fontSize: "1.2rem",
        }}
      >
        {isRunning ? "Стоп метронома" : "Старт метронома"}
      </button>
      <div>
        Темп метронома: <strong>{bpm}</strong> BPM
      </div>
    </div>
  );
}

export default Metronome;
