#!/usr/bin/env node

const debounce = require("lodash.debounce");
const chokidar = require("chokidar");
const program = require("caporal");
const fs = require("fs");
const { spawn } = require("child_process");

// Caporal cli config
program
  .version("0.0.1")

  .argument("[filename]", "Name of a file to execute (default: index.js")

  .action(async ({ filename }) => {
    const name = filename || "index.js";

    try {
      await fs.promises.access(name);
    } catch (err) {
      throw new Error(`Could not find the file ${name}`);
    }

    let proc;
    const start = debounce(() => {
      // Prevent concurrent subprocesses from running
      if (proc) {
        proc.kill();
      }

      console.log("~~ Starting Process ~~");
      proc = spawn("node", [name], { stdio: "inherit" }); // child_process.spawn()
    }, 200);

    // Watch changes to directory, run child_process on events.
    chokidar
      .watch(".")
      .on("add", start)
      .on("change", start)
      .on("unlink", start);
  });

program.parse(process.argv);

/* 
  2 To run on terminal
  - watchit     
  - watchit -h  -> provides help info

  1 Debounce - without lodash
  const debounce = (func, delay = 2000) => {
    let timeoutId;

    // Intercept
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };
  };

  function func() {
    console.log("PROGRAM STARTED");
  }

  chokidar.watch(".").on("add", debounce(func))
*/
