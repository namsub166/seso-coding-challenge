"use strict";

const Heap = require('heap');

// Print all entries, across all of the *async* sources, in chronological order.

// This function with pop the oldest log entries from all the active log sources, and put into the entryHeap.
// Factor this function out to make the code cleaner.
const popAsync = async (logSources, minHeap) => {
  return Promise.all(
    logSources.map(logSource =>
      logSource.popAsync().then((logEntry) => {
        if (logEntry == false) {
          return;
        }
        if (logEntry.date < minHeap.peek().date) {
          return;
        }
        minHeap.push(logEntry);
      })
    )
  );
};

module.exports = async (logSources, printer) => {
  // Similar to the sync version, we want to have an min heap to store the entry logs.
  // Log will be sorted based on the date
  const entryHeap = new Heap(function(log1, log2) {
    return log1.date - log2.date;
  });
  // Initialize the entry heap with oldest log entry from each log source
  let activeLogSources = logSources.filter(logSource => !logSource.drained);
  await Promise.all(
    logSources.map(
      logSource => logSource.popAsync().then((logEntry) => entryHeap.push(logEntry))
  ));

  while (entryHeap.size() != 0) {
    // We do 2 steps here:
    // 1. Add the current oldest log entry from each active (not drained) log source to the entryHeap
    // 2. Process a certain amount of logs in the entryHeap. These guarantee to be in the sorted order.
    await popAsync(activeLogSources, entryHeap);
    activeLogSources = logSources.filter(logSource => !logSource.drained);
    for (let i = 0; i < Math.floor(entryHeap.size() / activeLogSources.length); i++) {
      printer.print(entryHeap.pop());
    }
    // If we ever encounter no active log sources, just flush out all the logs in the entryHeap.
    if (activeLogSources.length == 0) {
      while (entryHeap.size() != 0) {
        printer.print(entryHeap.pop());
      }
    }
  }
  printer.done();
  return Promise.resolve(console.log("Async sort complete."));
};