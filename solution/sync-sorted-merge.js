"use strict";

const Heap = require('heap');

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {
  // We know that all the entries in each source are in chronological order, 
  // so in order to sort all entries across all of the sources, we could 
  // keep track of the oldest log of each source, say in A.
  // 
  // For each step, we have to find the oldest log in A (from log source B), and add element
  // from B.pop() to A. 
  // 
  // Since for A, we want to sort based on the timestamp, and pop the oldest element, 
  // we could use a heap data structure for A. 

  // Initialize heap with key comparator is the log entry date
  const entryHeap = new Heap(function(log1, log2) {
    return log1.date - log2.date;
  });
  // Initialize heap element with the oldest log in each sources.
  // In addition to the logEntry, we also want to keep track of where this log comes from.
  logSources.map((logSource, index) => 
    entryHeap.push({...logSource.pop(), logSourceIndex: index})
  )
  // Iterate through the heap, popping out the oldest element (heap pop), and add the next element
  while (entryHeap.size() != 0) {
    const oldestLogEntry = entryHeap.pop();
    printer.print(oldestLogEntry);
    // Add new log from the source we just printed. If we drained that log source, then do nothing
    const sourceIndex = oldestLogEntry.logSourceIndex;
    const newLogEntry = logSources[sourceIndex].pop();
    if (newLogEntry) {
      entryHeap.push({...newLogEntry, logSourceIndex: sourceIndex});  
    }
  }
  printer.done();
  return console.log("Sync sort complete.");
};