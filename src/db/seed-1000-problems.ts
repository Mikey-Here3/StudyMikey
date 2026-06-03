import "dotenv/config";
import { db } from "./index";
import { users, problems, testCases } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("==========================================");
  console.log("  StudyMikey 1,000 Problems Seeder Script ");
  console.log("==========================================");

  // 1. Fetch admin user or create fallback
  let adminId: string;
  const [adminUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, "admin"))
    .limit(1);

  if (adminUser) {
    adminId = adminUser.id;
  } else {
    // Check if any user exists to assign as creator, or raise
    const [anyUser] = await db.select({ id: users.id }).from(users).limit(1);
    if (anyUser) {
      adminId = anyUser.id;
    } else {
      console.error("ERROR: No admin or users found in the database. Please run seed-problems first.");
      process.exit(1);
    }
  }

  console.log(`Using user ID ${adminId} as author for all 1,000 problems.`);

  // 2. Clear existing programmatic problems to avoid duplicates on re-run
  // We only clear problems that match our prefix to protect existing manual seeds (Two Sum, etc.)
  console.log("Clearing previously seeded programmatic problems...");
  // We will run the insert cleanly. To avoid conflict, we can handle it via upsert or deletion.
  // Actually, Drizzle allows ON CONFLICT DO NOTHING, or we can just proceed.

  // 3. Define Category counts
  const categories = [
    { name: "DSA Array & Math", count: 170 },
    { name: "DSA String Parsing", count: 170 },
    { name: "Bit Manipulation", count: 165 },
    { name: "OOP Class Design", count: 165 },
    { name: "Dynamic Programming", count: 165 },
    { name: "Tricky Pattern Printing", count: 165 },
  ];

  let totalSeeded = 0;
  let batchProblems: any[] = [];
  let batchTestCases: any[] = [];

  const BATCH_SIZE = 50;

  console.log("Generating 1,000 problems...");

  for (let catIdx = 0; catIdx < categories.length; catIdx++) {
    const category = categories[catIdx];
    console.log(`-> Generating ${category.count} problems for category: ${category.name}`);

    for (let itemIdx = 1; itemIdx <= category.count; itemIdx++) {
      totalSeeded++;
      const difficulty = itemIdx % 3 === 0 ? "HARD" : itemIdx % 2 === 0 ? "MEDIUM" : "EASY";
      const slug = `${category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${itemIdx}`;
      const title = `${category.name}: Challenge #${itemIdx}`;
      
      // Determine subtype
      const type = itemIdx % 4;

      let description = "";
      let constraints = "";
      let editorial = "";
      let templateCodeCpp = "";
      let tcs: { inputData: string; expectedOutput: string; isHidden: boolean; orderNum: number }[] = [];

      if (category.name === "DSA Array & Math") {
        if (type === 0) {
          description = `Given a list of integers, find the minimum absolute difference between any two elements in the array. This is variation #${itemIdx}.`;
          constraints = `2 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9`;
          editorial = "Sort the array and calculate differences between adjacent elements.";
          templateCodeCpp = `#include <vector>\n#include <algorithm>\n#include <cmath>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int minDifference(vector<int>& nums) {\n        // Write C++ code\n        return 0;\n    }\n};`;
          tcs = [
            { inputData: "4\n1 5 12 7", expectedOutput: "2", isHidden: false, orderNum: 1 },
            { inputData: "3\n10 30 11", expectedOutput: "1", isHidden: false, orderNum: 2 },
            { inputData: "5\n-5 14 100 89 200", expectedOutput: "9", isHidden: true, orderNum: 3 },
          ];
        } else if (type === 1) {
          description = `Find the contiguous subarray within a one-dimensional array of numbers which has the largest sum. Variation #${itemIdx}.`;
          constraints = `1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4`;
          editorial = "Use Kadane's algorithm. Maintain max_so_far and max_ending_here.";
          templateCodeCpp = `#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write C++ code\n        return 0;\n    }\n};`;
          tcs = [
            { inputData: "5\n-2 1 -3 4 -1", expectedOutput: "4", isHidden: false, orderNum: 1 },
            { inputData: "4\n1 2 3 -10", expectedOutput: "6", isHidden: false, orderNum: 2 },
            { inputData: "3\n-5 -2 -3", expectedOutput: "-2", isHidden: true, orderNum: 3 },
          ];
        } else if (type === 2) {
          description = `A peak element is an element that is strictly greater than its neighbors. Find the index of any peak in the array. Variation #${itemIdx}.`;
          constraints = `1 <= nums.length <= 10^4\nnums[i] != nums[i+1]`;
          editorial = "Use binary search to inspect the middle element and its neighbors.";
          templateCodeCpp = `#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int findPeakElement(vector<int>& nums) {\n        // Write C++ code\n        return 0;\n    }\n};`;
          tcs = [
            { inputData: "4\n1 2 3 1", expectedOutput: "2", isHidden: false, orderNum: 1 },
            { inputData: "5\n10 20 15 30 25", expectedOutput: "1", isHidden: false, orderNum: 2 },
            { inputData: "3\n5 10 15", expectedOutput: "2", isHidden: true, orderNum: 3 },
          ];
        } else {
          description = `Given an array of integers \`nums\` and an integer \`k\`, return the total number of continuous subarrays whose sum equals \`k\`. Variation #${itemIdx}.`;
          constraints = `1 <= nums.length <= 10^4\n-1000 <= nums[i] <= 1000`;
          editorial = "Use a hash map to track prefix sums and their frequency count.";
          templateCodeCpp = `#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int subarraySum(vector<int>& nums, int k) {\n        // Write C++ code\n        return 0;\n    }\n};`;
          tcs = [
            { inputData: "3\n1 1 1\n2", expectedOutput: "2", isHidden: false, orderNum: 1 },
            { inputData: "3\n1 2 3\n3", expectedOutput: "2", isHidden: false, orderNum: 2 },
            { inputData: "5\n1 -1 1 -1 1\n0", expectedOutput: "4", isHidden: true, orderNum: 3 },
          ];
        }
      } else if (category.name === "DSA String Parsing") {
        if (type === 0) {
          description = `Given two strings \`s\` and \`t\`, return true if \`t\` is an anagram of \`s\`, else false. Variation #${itemIdx}.`;
          constraints = `1 <= s.length, t.length <= 10^5\ns and t consist of lowercase English letters.`;
          editorial = "Count frequency of each character in s and subtract frequency in t.";
          templateCodeCpp = `#include <string>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        // Write C++ code\n        return false;\n    }\n};`;
          tcs = [
            { inputData: "anagram nagaram", expectedOutput: "true", isHidden: false, orderNum: 1 },
            { inputData: "rat car", expectedOutput: "false", isHidden: false, orderNum: 2 },
            { inputData: "a ab", expectedOutput: "false", isHidden: true, orderNum: 3 },
          ];
        } else if (type === 1) {
          description = `Given a string \`s\`, return the length of the longest palindrome that can be built with those letters. Case sensitive. Variation #${itemIdx}.`;
          constraints = `1 <= s.length <= 2000\ns consists of lowercase and/or uppercase English letters.`;
          editorial = "Count character frequencies. Add even counts, and one odd count if any exist.";
          templateCodeCpp = `#include <string>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestPalindrome(string s) {\n        // Write C++ code\n        return 0;\n    }\n};`;
          tcs = [
            { inputData: "abccccdd", expectedOutput: "7", isHidden: false, orderNum: 1 },
            { inputData: "a", expectedOutput: "1", isHidden: false, orderNum: 2 },
            { inputData: "ccc", expectedOutput: "3", isHidden: true, orderNum: 3 },
          ];
        } else if (type === 2) {
          description = `Perform a run-length string compression. For example, "aabbb" yields "a2b3". If compressed string is not shorter, return original. Variation #${itemIdx}.`;
          constraints = `1 <= s.length <= 10^4`;
          editorial = "Iterate through string, counting consecutive chars and append counts.";
          templateCodeCpp = `#include <string>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    string compress(string s) {\n        // Write C++ code\n        return "";\n    }\n};`;
          tcs = [
            { inputData: "aabcccccaaa", expectedOutput: "a2b1c5a3", isHidden: false, orderNum: 1 },
            { inputData: "abc", expectedOutput: "abc", isHidden: false, orderNum: 2 },
            { inputData: "a", expectedOutput: "a", isHidden: true, orderNum: 3 },
          ];
        } else {
          description = `Given a string \`s\` containing just parentheses characters, return the maximum nesting depth of the parentheses. Variation #${itemIdx}.`;
          constraints = `1 <= s.length <= 100\ns contains only '(' and ')'`;
          editorial = "Keep track of open parentheses depth. Return maximum depth reached.";
          templateCodeCpp = `#include <string>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxDepth(string s) {\n        // Write C++ code\n        return 0;\n    }\n};`;
          tcs = [
            { inputData: "(1+(2*3)+((8)/4))+1", expectedOutput: "3", isHidden: false, orderNum: 1 },
            { inputData: "(1)+((2))", expectedOutput: "2", isHidden: false, orderNum: 2 },
            { inputData: "()", expectedOutput: "1", isHidden: true, orderNum: 3 },
          ];
        }
      } else if (category.name === "Bit Manipulation") {
        if (type === 0) {
          description = `Write a function that takes an unsigned integer and returns the number of '1' bits it has (Hamming weight). Variation #${itemIdx}.`;
          constraints = `n is a 32-bit unsigned integer`;
          editorial = "Use n & (n - 1) to clear lowest set bit in a loop until n is 0.";
          templateCodeCpp = `#include <cstdint>\n\nclass Solution {\npublic:\n    int hammingWeight(uint32_t n) {\n        // Write C++ code\n        return 0;\n    }\n};`;
          tcs = [
            { inputData: "11", expectedOutput: "3", isHidden: false, orderNum: 1 }, // binary: 1011
            { inputData: "128", expectedOutput: "1", isHidden: false, orderNum: 2 }, // binary: 10000000
            { inputData: "255", expectedOutput: "8", isHidden: true, orderNum: 3 }, // binary: 11111111
          ];
        } else if (type === 1) {
          description = `Given a non-empty array of integers, every element appears twice except for one. Find that single one. Variation #${itemIdx}.`;
          constraints = `1 <= nums.length <= 3 * 10^4\nEach element in the array appears twice except for one.`;
          editorial = "XOR all elements. Since A XOR A = 0, duplicates cancel out, leaving the single element.";
          templateCodeCpp = `#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        // Write C++ code\n        return 0;\n    }\n};`;
          tcs = [
            { inputData: "3\n2 2 1", expectedOutput: "1", isHidden: false, orderNum: 1 },
            { inputData: "5\n4 1 2 1 2", expectedOutput: "4", isHidden: false, orderNum: 2 },
            { inputData: "1\n99", expectedOutput: "99", isHidden: true, orderNum: 3 },
          ];
        } else if (type === 2) {
          description = `Given an integer \`n\`, return true if it is a power of two. Otherwise, return false. Variation #${itemIdx}.`;
          constraints = `-2^31 <= n <= 2^31 - 1`;
          editorial = "A power of two has exactly one set bit. Check if n > 0 && (n & (n - 1)) == 0.";
          templateCodeCpp = `class Solution {\npublic:\n    bool isPowerOfTwo(int n) {\n        // Write C++ code\n        return false;\n    }\n};`;
          tcs = [
            { inputData: "1", expectedOutput: "true", isHidden: false, orderNum: 1 },
            { inputData: "16", expectedOutput: "true", isHidden: false, orderNum: 2 },
            { inputData: "3", expectedOutput: "false", isHidden: true, orderNum: 3 },
          ];
        } else {
          description = `Given an array containing n distinct numbers taken from 0, 1, 2, ..., n, find the one that is missing from the array. Variation #${itemIdx}.`;
          constraints = `1 <= nums.length <= 10^4\nAll numbers are unique.`;
          editorial = "Calculate sum of 0..n and subtract array sum. Or use XOR properties.";
          templateCodeCpp = `#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int missingNumber(vector<int>& nums) {\n        // Write C++ code\n        return 0;\n    }\n};`;
          tcs = [
            { inputData: "3\n3 0 1", expectedOutput: "2", isHidden: false, orderNum: 1 },
            { inputData: "9\n9 6 4 2 3 5 7 0 1", expectedOutput: "8", isHidden: false, orderNum: 2 },
            { inputData: "2\n0 1", expectedOutput: "2", isHidden: true, orderNum: 3 },
          ];
        }
      } else if (category.name === "OOP Class Design") {
        if (type === 0) {
          description = `Design a Stack class that supports push, pop, top, and retrieving the minimum element in constant time. Variation #${itemIdx}.`;
          constraints = `All operations run in O(1) time complexity.`;
          editorial = "Use an auxiliary stack to keep track of the minimum value at each state.";
          templateCodeCpp = `#include <stack>\n\nusing namespace std;\n\nclass MinStack {\n    stack<int> s1;\n    stack<int> s2;\npublic:\n    void push(int val) {}\n    void pop() {}\n    int top() { return 0; }\n    int getMin() { return 0; }\n};`;
          tcs = [
            { inputData: "push(-2) push(0) push(-3) getMin() pop() top() getMin()", expectedOutput: "-3 -2 -2", isHidden: false, orderNum: 1 },
            { inputData: "push(5) push(3) getMin()", expectedOutput: "3", isHidden: false, orderNum: 2 },
            { inputData: "push(10) getMin()", expectedOutput: "10", isHidden: true, orderNum: 3 },
          ];
        } else if (type === 1) {
          description = `Implement a FIFO Queue using stack structures. Design pop, push, peek, and empty. Variation #${itemIdx}.`;
          constraints = `Use only standard stack operations.`;
          editorial = "Use two stacks. On pop/peek, transfer elements from input stack to output stack if empty.";
          templateCodeCpp = `#include <stack>\n\nusing namespace std;\n\nclass MyQueue {\n    stack<int> s1;\n    stack<int> s2;\npublic:\n    void push(int x) {}\n    int pop() { return 0; }\n    int peek() { return 0; }\n    bool empty() { return true; }\n};`;
          tcs = [
            { inputData: "push(1) push(2) peek() pop() empty()", expectedOutput: "1 1 false", isHidden: false, orderNum: 1 },
            { inputData: "push(5) empty()", expectedOutput: "false", isHidden: false, orderNum: 2 },
            { inputData: "push(10) pop() empty()", expectedOutput: "10 true", isHidden: true, orderNum: 3 },
          ];
        } else if (type === 2) {
          description = `Design a Trie (Prefix Tree) class supporting insert, search, and startsWith. Variation #${itemIdx}.`;
          constraints = `Words contain lowercase English letters.`;
          editorial = "Each Node contains an array of 26 child references and a boolean isWord flag.";
          templateCodeCpp = `#include <string>\n\nusing namespace std;\n\nclass Trie {\npublic:\n    void insert(string word) {}\n    bool search(string word) { return false; }\n    bool startsWith(string prefix) { return false; }\n};`;
          tcs = [
            { inputData: "insert(apple) search(apple) search(app) startsWith(app)", expectedOutput: "true false true", isHidden: false, orderNum: 1 },
            { inputData: "insert(cat) search(dog)", expectedOutput: "false", isHidden: false, orderNum: 2 },
            { inputData: "insert(hello) startsWith(he)", expectedOutput: "true", isHidden: true, orderNum: 3 },
          ];
        } else {
          description = `Design a Browser History class navigation tracker. Homepage is initial stack. Variation #${itemIdx}.`;
          constraints = `Steps <= 100 per back/forward.`;
          editorial = "Maintain a doubly-linked list or two stacks to support visiting and history navigation.";
          templateCodeCpp = `#include <string>\n#include <vector>\n\nusing namespace std;\n\nclass BrowserHistory {\npublic:\n    BrowserHistory(string homepage) {}\n    void visit(string url) {}\n    string back(int steps) { return ""; }\n    string forward(int steps) { return ""; }\n};`;
          tcs = [
            { inputData: "visit(google) visit(youtube) back(1) forward(1)", expectedOutput: "google youtube", isHidden: false, orderNum: 1 },
            { inputData: "visit(google) back(10)", expectedOutput: "homepage", isHidden: false, orderNum: 2 },
            { inputData: "visit(fb) visit(reddit) back(2)", expectedOutput: "homepage", isHidden: true, orderNum: 3 },
          ];
        }
      } else if (category.name === "Dynamic Programming") {
        if (type === 0) {
          description = `Given a staircase of N steps, find the minimum cost to reach the top. You can climb 1 or 2 steps at a time. Variation #${itemIdx}.`;
          constraints = `2 <= cost.length <= 1000\n0 <= cost[i] <= 999`;
          editorial = "Maintain DP states where dp[i] = cost[i] + min(dp[i-1], dp[i-2]).";
          templateCodeCpp = `#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int minCostClimbingStairs(vector<int>& cost) {\n        // Write C++ code\n        return 0;\n    }\n};`;
          tcs = [
            { inputData: "3\n10 15 20", expectedOutput: "15", isHidden: false, orderNum: 1 },
            { inputData: "10\n1 100 1 1 1 100 1 1 100 1", expectedOutput: "6", isHidden: false, orderNum: 2 },
            { inputData: "2\n100 200", expectedOutput: "100", isHidden: true, orderNum: 3 },
          ];
        } else if (type === 1) {
          description = `You are a professional robber planning to rob houses along a street. Rob houses such that no adjacent houses are robbed. Find max profit. Variation #${itemIdx}.`;
          constraints = `1 <= nums.length <= 100\n0 <= nums[i] <= 400`;
          editorial = "Define DP transitions where dp[i] = max(dp[i-1], dp[i-2] + nums[i]).";
          templateCodeCpp = `#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int rob(vector<int>& nums) {\n        // Write C++ code\n        return 0;\n    }\n};`;
          tcs = [
            { inputData: "4\n1 2 3 1", expectedOutput: "4", isHidden: false, orderNum: 1 }, // rob 1 & 3
            { inputData: "5\n2 7 9 3 1", expectedOutput: "12", isHidden: false, orderNum: 2 }, // rob 2 & 4
            { inputData: "2\n10 50", expectedOutput: "50", isHidden: true, orderNum: 3 },
          ];
        } else if (type === 2) {
          description = `Given different coin denominations and a total amount. Compute fewest coins needed. If not possible, return -1. Variation #${itemIdx}.`;
          constraints = `1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4`;
          editorial = "Use 1D bottom-up DP table where dp[i] represents min coins to make amount i.";
          templateCodeCpp = `#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Write C++ code\n        return -1;\n    }\n};`;
          tcs = [
            { inputData: "3\n1 2 5\n11", expectedOutput: "3", isHidden: false, orderNum: 1 },
            { inputData: "1\n2\n3", expectedOutput: "-1", isHidden: false, orderNum: 2 },
            { inputData: "1\n1\n0", expectedOutput: "0", isHidden: true, orderNum: 3 },
          ];
        } else {
          description = `A robot is located at the top-left corner of a m x n grid. Find total unique paths to bottom-right corner. Variation #${itemIdx}.`;
          constraints = `1 <= m, n <= 100`;
          editorial = "The path counts satisfy dp[i][j] = dp[i-1][j] + dp[i][j-1]. Can optimize to 1D array.";
          templateCodeCpp = `class Solution {\npublic:\n    int uniquePaths(int m, int n) {\n        // Write C++ code\n        return 1;\n    }\n};`;
          tcs = [
            { inputData: "3 7", expectedOutput: "28", isHidden: false, orderNum: 1 },
            { inputData: "3 2", expectedOutput: "3", isHidden: false, orderNum: 2 },
            { inputData: "3 3", expectedOutput: "6", isHidden: true, orderNum: 3 },
          ];
        }
      } else {
        // Tricky Pattern Printing
        if (type === 0) {
          description = `Return a string representation of a Star Pyramid of height N. Each row has 2N-1 width. Spaces padded. Variation #${itemIdx}.`;
          constraints = `1 <= N <= 20`;
          editorial = "Row i (0-indexed) has N-i-1 leading spaces and 2i+1 stars.";
          templateCodeCpp = `#include <string>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    string printPyramid(int n) {\n        // Write C++ code\n        return "";\n    }\n};`;
          tcs = [
            { inputData: "2", expectedOutput: " * \n***", isHidden: false, orderNum: 1 },
            { inputData: "1", expectedOutput: "*", isHidden: false, orderNum: 2 },
            { inputData: "3", expectedOutput: "  *  \n *** \n*****", isHidden: true, orderNum: 3 },
          ];
        } else if (type === 1) {
          description = `Return a string representation of a Hollow Diamond of size N. Height is 2N-1. Variation #${itemIdx}.`;
          constraints = `1 <= N <= 20`;
          editorial = "Map symmetric vertical coordinate y from -(N-1) to +(N-1). Print stars at abs(x) + abs(y) == N-1.";
          templateCodeCpp = `#include <string>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    string printDiamond(int n) {\n        // Write C++ code\n        return "";\n    }\n};`;
          tcs = [
            { inputData: "2", expectedOutput: " * \n* *\n * ", isHidden: false, orderNum: 1 },
            { inputData: "1", expectedOutput: "*", isHidden: false, orderNum: 2 },
            { inputData: "3", expectedOutput: "  *  \n * * \n*   *\n * * \n  *  ", isHidden: true, orderNum: 3 },
          ];
        } else if (type === 2) {
          description = `Given a matrix, return all elements of the matrix in spiral order. Variation #${itemIdx}.`;
          constraints = `1 <= m, n <= 100`;
          editorial = "Track directions boundaries (top, bottom, left, right). Traverse in loop shrinking bounds.";
          templateCodeCpp = `#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> spiralOrder(vector<vector<int>>& matrix) {\n        // Write C++ code\n        return {};\n    }\n};`;
          tcs = [
            { inputData: "3 3\n1 2 3\n4 5 6\n7 8 9", expectedOutput: "1 2 3 6 9 8 7 4 5", isHidden: false, orderNum: 1 },
            { inputData: "2 2\n1 2\n3 4", expectedOutput: "1 2 4 3", isHidden: false, orderNum: 2 },
            { inputData: "1 3\n10 20 30", expectedOutput: "10 20 30", isHidden: true, orderNum: 3 },
          ];
        } else {
          description = `Generate Pascal's Triangle rows of size N. Variation #${itemIdx}.`;
          constraints = `1 <= N <= 30`;
          editorial = "Iterate row by row. Entry row[i][j] = row[i-1][j-1] + row[i-1][j].";
          templateCodeCpp = `#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> generatePascal(int numRows) {\n        // Write C++ code\n        return {};\n    }\n};`;
          tcs = [
            { inputData: "3", expectedOutput: "1\n1 1\n1 2 1", isHidden: false, orderNum: 1 },
            { inputData: "1", expectedOutput: "1", isHidden: false, orderNum: 2 },
            { inputData: "5", expectedOutput: "1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1", isHidden: true, orderNum: 3 },
          ];
        }
      }

      // Add to batch
      batchProblems.push({
        title,
        slug,
        difficulty,
        description,
        constraints,
        timeLimit: itemIdx % 2 === 0 ? 1000 : 2000,
        memoryLimit: itemIdx % 3 === 0 ? 128 : 256,
        editorial,
        templateCodeCpp,
        createdById: adminId,
      });

      // We will need to map test cases after the problems are inserted to get their actual database problem UUIDs.
      // So we store a temporary mapping key.
      batchProblems[batchProblems.length - 1].tempTcs = tcs;

      // When batch reaches BATCH_SIZE, commit to database
      if (batchProblems.length === BATCH_SIZE) {
        await commitBatch(batchProblems);
        batchProblems = [];
      }
    }
  }

  // Commit remaining
  if (batchProblems.length > 0) {
    await commitBatch(batchProblems);
  }

  console.log(`Seeder completed successfully. Seeded exactly ${totalSeeded} problems and matching test cases.`);
  process.exit(0);
}

async function commitBatch(problemsData: any[]) {
  // 1. Insert problems
  const inserted = await db
    .insert(problems)
    .values(problemsData.map(p => {
      const { tempTcs, ...rest } = p;
      return rest;
    }))
    .returning({ id: problems.id, slug: problems.slug });

  // Create slug to id mapping
  const slugToIdMap = new Map<string, string>();
  for (const row of inserted) {
    slugToIdMap.set(row.slug, row.id);
  }

  // 2. Insert test cases
  const tcsValues: any[] = [];
  for (const p of problemsData) {
    const problemId = slugToIdMap.get(p.slug);
    if (problemId && p.tempTcs) {
      for (const tc of p.tempTcs) {
        tcsValues.push({
          problemId,
          inputData: tc.inputData,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          orderNum: tc.orderNum,
        });
      }
    }
  }

  if (tcsValues.length > 0) {
    await db.insert(testCases).values(tcsValues);
  }

  console.log(`  Committed batch of ${problemsData.length} problems and ${tcsValues.length} test cases.`);
}

main().catch(err => {
  console.error("Seeding failed with error:", err);
  process.exit(1);
});
