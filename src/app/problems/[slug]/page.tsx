import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { problems, testCases } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProblemWorkspace from "@/components/features/problem/problem-workspace";
import { getProperProblemTitle } from "@/lib/problems-utils";

interface ProblemPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Fallback problems with test cases for robust zero-config local runs
const FALLBACK_PROBLEM_DETAILS: Record<string, any> = {
  "two-sum": {
    id: "two-sum-id",
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "EASY",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: `2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
Only one valid answer exists.`,
    timeLimit: 2000,
    memoryLimit: 256,
    editorial: `Use a hash map to store the index of each number. For each number, check if its complement (target - num) exists in the map. Complexity is O(N) time and O(N) space.`,
    templateCodeCpp: `#include <vector>
#include <iostream>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write C++ code here
        return {};
    }
};`,
    testCases: [
      { id: "tc-1", inputData: "3 2 4\n6", expectedOutput: "1 2", isHidden: false, orderNum: 1 },
      { id: "tc-2", inputData: "3 3\n6", expectedOutput: "0 1", isHidden: false, orderNum: 2 },
      { id: "tc-3", inputData: "2 7 11 15\n9", expectedOutput: "0 1", isHidden: true, orderNum: 3 },
    ],
  },
  "fibonacci-number": {
    id: "fib-id",
    title: "Fibonacci Number",
    slug: "fibonacci-number",
    difficulty: "EASY",
    description: `The **Fibonacci numbers**, commonly denoted \`F(n)\` form a sequence, called the **Fibonacci sequence**, such that each number is the sum of the two preceding ones, starting from \`0\` and \`1\`.

That is:
\`\`\`
F(0) = 0, F(1) = 1
F(n) = F(n - 1) + F(n - 2), for n > 1.
\`\`\`

Given \`n\`, calculate \`F(n)\`.`,
    constraints: `0 <= n <= 30`,
    timeLimit: 1000,
    memoryLimit: 128,
    editorial: `Use dynamic programming or simple iteration to track the last two numbers. Time complexity is O(N) and space complexity is O(1).`,
    templateCodeCpp: `#include <iostream>

class Solution {
public:
    int fib(int n) {
        // Write C++ code here
        return 0;
    }
};`,
    testCases: [
      { id: "tc-10", inputData: "2", expectedOutput: "1", isHidden: false, orderNum: 1 },
      { id: "tc-11", inputData: "3", expectedOutput: "2", isHidden: false, orderNum: 2 },
      { id: "tc-12", inputData: "4", expectedOutput: "3", isHidden: true, orderNum: 3 },
    ],
  },
  "longest-common-subsequence": {
    id: "lcs-id",
    title: "Longest Common Subsequence",
    slug: "longest-common-subsequence",
    difficulty: "MEDIUM",
    description: `Given two strings \`text1\` and \`text2\`, return the length of their longest common subsequence. If there is no common subsequence, return \`0\`.

A **subsequence** of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.

For example, \`"abc"\` is a subsequence of \`"adebc"\`.`,
    constraints: `1 <= text1.length, text2.length <= 1000
text1 and text2 consist of only lowercase English characters.`,
    timeLimit: 2000,
    memoryLimit: 256,
    editorial: `Use a 2D dynamic programming grid where dp[i][j] represents the LCS of text1[0..i] and text2[0..j]. If text1[i] == text2[j], dp[i][j] = dp[i-1][j-1] + 1, else max(dp[i-1][j], dp[i][j-1]). Complexity is O(N*M) time and O(N*M) space.`,
    templateCodeCpp: `#include <string>
#include <vector>
#include <iostream>

using namespace std;

class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        // Write C++ code here
        return 0;
    }
};`,
    testCases: [
      { id: "tc-20", inputData: "abcde\nace", expectedOutput: "3", isHidden: false, orderNum: 1 },
      { id: "tc-21", inputData: "abc\nabc", expectedOutput: "3", isHidden: false, orderNum: 2 },
    ],
  },
};

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { slug } = await params;
  
  let problemDetails: any = null;
  let testCasesList: any[] = [];

  try {
    const [prob] = await db
      .select()
      .from(problems)
      .where(eq(problems.slug, slug))
      .limit(1);

    if (prob) {
      const dbCases = await db
        .select()
        .from(testCases)
        .where(eq(testCases.problemId, prob.id))
        .orderBy(testCases.orderNum);
      
      problemDetails = prob;
      testCasesList = dbCases;
    }
  } catch (error) {
    console.warn(`Database query failed for problem details [${slug}], using mock fallbacks.`);
  }

  // Fall back to details if DB isn't seeded or offline
  if (!problemDetails) {
    const fallback = FALLBACK_PROBLEM_DETAILS[slug];
    if (!fallback) {
      notFound();
    }
    problemDetails = {
      id: fallback.id,
      title: fallback.title,
      slug: fallback.slug,
      difficulty: fallback.difficulty,
      description: fallback.description,
      constraints: fallback.constraints,
      timeLimit: fallback.timeLimit,
      memoryLimit: fallback.memoryLimit,
      editorial: fallback.editorial,
      templateCodeCpp: fallback.templateCodeCpp,
    };
    testCasesList = fallback.testCases;
  }

  return (
    <ProblemWorkspace
      problem={{
        id: problemDetails.id,
        title: getProperProblemTitle(problemDetails.title),
        slug: problemDetails.slug,
        difficulty: problemDetails.difficulty,
        description: problemDetails.description,
        constraints: problemDetails.constraints,
        timeLimit: problemDetails.timeLimit,
        memoryLimit: problemDetails.memoryLimit,
        editorial: problemDetails.editorial,
        templateCodeCpp: problemDetails.templateCodeCpp,
      }}
      testCases={testCasesList}
    />
  );
}
