/**
 * Maps raw programmatic challenge titles (e.g. "DSA Array & Math: Challenge #5")
 * to readable, human-friendly problem names.
 */
export function getProperProblemTitle(originalTitle: string): string {
  if (!originalTitle) return "";
  
  const match = originalTitle.match(/(.+?):\s*Challenge\s*#(\d+)/i);
  if (!match) return originalTitle;

  const category = match[1].trim();
  const index = parseInt(match[2], 10);
  const type = index % 4;

  if (category === "DSA Array & Math") {
    if (type === 0) return `Min Absolute Difference (V-${index})`;
    if (type === 1) return `Maximum Subarray Sum (V-${index})`;
    if (type === 2) return `Find Peak Element (V-${index})`;
    return `Subarray Sum Equals K (V-${index})`;
  }
  if (category === "DSA String Parsing") {
    if (type === 0) return `Valid Anagram (V-${index})`;
    if (type === 1) return `Longest Palindrome Builder (V-${index})`;
    if (type === 2) return `Run-Length Compression (V-${index})`;
    return `Max Parentheses Nesting Depth (V-${index})`;
  }
  if (category === "Bit Manipulation") {
    if (type === 0) return `Hamming Weight Count (V-${index})`;
    if (type === 1) return `Single Number Identifier (V-${index})`;
    if (type === 2) return `Power of Two Checker (V-${index})`;
    return `Missing Number Search (V-${index})`;
  }
  if (category === "OOP Class Design") {
    if (type === 0) return `Min Stack Design (V-${index})`;
    if (type === 1) return `Queue using Stacks (V-${index})`;
    if (type === 2) return `Trie (Prefix Tree) (V-${index})`;
    return `Browser History Tracker (V-${index})`;
  }
  if (category === "Dynamic Programming") {
    if (type === 0) return `Min Cost Climbing Stairs (V-${index})`;
    if (type === 1) return `House Robber Maximization (V-${index})`;
    if (type === 2) return `Fewest Coin Change (V-${index})`;
    return `Grid Unique Paths Count (V-${index})`;
  }
  if (category === "Tricky Pattern Printing") {
    if (type === 0) return `Star Pyramid Printer (V-${index})`;
    if (type === 1) return `Hollow Diamond Matrix (V-${index})`;
    if (type === 2) return `Spiral Matrix Traversal (V-${index})`;
    return `Pascal's Triangle Generator (V-${index})`;
  }

  return originalTitle;
}
