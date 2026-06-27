---
title: "Bratwurst"
date: 2026-06-24T15:50:37+10:00
draft: false
---

<style>

input[type="date"] {
  background-color: var(--fg);
  color: var(--bg);
  font-size: 1rem;
  padding: 10px 14px;
  border: 0px;
  border-radius: 8px;
  outline: none;
}

input[type="date"]:focus {
  accent-color: var(--highlight);
}
    button {
      appearance: none;
      background-color: var(--muted);
      border: 0px solid var(--bg);
      border-radius: 6px;
      color: var(--fg);
      cursor: pointer;
      display: inline-block;
      font-family: var(--font-monospace)
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      padding: 6px 16px;
      position: relative;
      text-align: center;
      text-decoration: none;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      vertical-align: middle;
      white-space: nowrap;
    }

    button:focus:not(:focus-visible):not(.focus-visible) {
      box-shadow: none;
      outline: none;
    }

    button:hover {
      background-color: var(--hover);
      color: var(--muted);
    }

    button:focus {
      box-shadow: rgba(46, 164, 79, .4) 0 0 0 3px;
      outline: none;
    }

    button:disabled {
      background-color: #94d3a2;
      border-color: rgba(27, 31, 35, .1);
      color: rgba(255, 255, 255, .8);
      cursor: default;
    }

    button:active {
      background-color: var(--link);
      color: var(--muted);
      box-shadow: rgba(20, 70, 32, .2) 0 1px 0 inset;
    }
</style>

This is a converter for the Bratwurst system, you can [read about it
here](../../blog/bratwurst).

The date today is: <span id="today_output"></span>

---

Pick a date: <input id="date_input" type="date"></input>

<button id="convert_button">Convert</button>

<script src="/scripts/phys/bratwurst/bratwurst.js"></script>

---

Output: <span id="output"></span>
