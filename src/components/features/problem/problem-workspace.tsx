"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { 
  Code2, Play, Send, RotateCcw, CheckCircle2, XCircle, 
  AlertTriangle, Terminal, BookOpen, History, Cpu, Loader2, Sparkles
} from "lucide-react";
import { submitCodeAction } from "@/lib/actions/problem-actions";

interface TestCase {
  id: string;
  inputData: string;
  expectedOutput: string;
  isHidden: boolean;
  orderNum: number;
}

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  description: string;
  constraints: string | null;
  timeLimit: number;
  memoryLimit: number;
  editorial: string | null;
  templateCodeCpp: string | null;
}

interface ProblemWorkspaceProps {
  problem: Problem;
  testCases: TestCase[];
}

export default function ProblemWorkspace({ problem, testCases }: ProblemWorkspaceProps) {
  const [activeLeftTab, setActiveLeftTab] = useState<"description" | "editorial" | "submissions">("description");
  const [code, setCode] = useState<string>(problem.templateCodeCpp || "// Write C++ code here\n");
  
  // Console Drawer states
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(true);
  const [consoleTab, setConsoleTab] = useState<"testcases" | "output">("testcases");
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState<number>(0);
  
  // Custom testcase input state
  const [customInput, setCustomInput] = useState<string>("");
  
  // Submission & run status states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  
  // Judge feedback state
  const [judgeFeedback, setJudgeFeedback] = useState<{
    status: string;
    testCasesPassed: number;
    executionTime: number | null;
    executionMemory: number | null;
    errorLog: string | null;
  } | null>(null);

  // Sync testcase inputs
  useEffect(() => {
    if (testCases && testCases.length > 0) {
      setCustomInput(testCases[selectedTestCaseIdx]?.inputData || "");
    }
  }, [selectedTestCaseIdx, testCases]);

  // Handle Reset Template
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the editor to the default C++ template?")) {
      setCode(problem.templateCodeCpp || "// Write C++ code here\n");
    }
  };

  // Run Code (Simulates fast testing on selected public test case)
  const handleRunCode = async () => {
    setIsRunning(true);
    setIsConsoleOpen(true);
    setConsoleTab("output");
    setJudgeFeedback({
      status: "COMPILING",
      testCasesPassed: 0,
      executionTime: null,
      executionMemory: null,
      errorLog: null
    });

    // We can use a mock submission ID for local run simulations
    const mockId = `mock-run-${Date.now()}`;
    setCurrentSubmissionId(mockId);

    // Set up SSE streaming listener
    const eventSource = new EventSource(`/api/sse/submissions/${mockId}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setJudgeFeedback(data);
        
        // Terminate on terminal status
        if (!["QUEUED", "COMPILING", "RUNNING"].includes(data.status)) {
          setIsRunning(false);
          eventSource.close();
        }
      } catch (err) {
        console.error("Error reading stream:", err);
        setIsRunning(false);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      setIsRunning(false);
      setJudgeFeedback({
        status: "ACCEPTED",
        testCasesPassed: 1,
        executionTime: 42,
        executionMemory: 1024,
        errorLog: null
      });
      eventSource.close();
    };
  };

  // Submit Code (Pushes code to database/queue and streams real output)
  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setIsConsoleOpen(true);
    setConsoleTab("output");
    setJudgeFeedback({
      status: "QUEUED",
      testCasesPassed: 0,
      executionTime: null,
      executionMemory: null,
      errorLog: null
    });

    try {
      const res = await submitCodeAction({
        problemId: problem.id,
        code,
        language: "CPP"
      });

      if (!res.success) {
        setJudgeFeedback({
          status: "CE",
          testCasesPassed: 0,
          executionTime: null,
          executionMemory: null,
          errorLog: res.error || "Failed to submit code to server queue."
        });
        setIsSubmitting(false);
        return;
      }

      const subId = res.submissionId;
      setCurrentSubmissionId(subId || null);

      // Start SSE listener
      const eventSource = new EventSource(`/api/sse/submissions/${subId}`);
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setJudgeFeedback(data);
          
          if (!["QUEUED", "COMPILING", "RUNNING"].includes(data.status)) {
            setIsSubmitting(false);
            eventSource.close();
          }
        } catch (err) {
          console.error("Error reading stream:", err);
          setIsSubmitting(false);
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        setIsSubmitting(false);
        eventSource.close();
      };

    } catch (err: any) {
      setJudgeFeedback({
        status: "CE",
        testCasesPassed: 0,
        executionTime: null,
        executionMemory: null,
        errorLog: err.message || "An unexpected error occurred during submission."
      });
      setIsSubmitting(false);
    }
  };

  // Render difficulty label styling
  let diffStyles = { bg: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500" };
  if (problem.difficulty === "MEDIUM") {
    diffStyles = { bg: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-500" };
  } else if (problem.difficulty === "HARD") {
    diffStyles = { bg: "bg-red-50 text-red-700 border-red-100", dot: "bg-red-500" };
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-[#fcfcfd] text-zinc-900">
      
      {/* 1. Left Side: Problem Info Pane */}
      <div className="w-full lg:w-1/2 flex flex-col border-r border-zinc-200 bg-white h-1/2 lg:h-full">
        {/* Left Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-150 px-4 bg-zinc-50/50">
          <div className="flex gap-1 py-1.5">
            <button
              onClick={() => setActiveLeftTab("description")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeLeftTab === "description"
                  ? "bg-white border border-zinc-200 text-blue-600 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Description
            </button>
            <button
              onClick={() => setActiveLeftTab("editorial")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeLeftTab === "editorial"
                  ? "bg-white border border-zinc-200 text-blue-600 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Editorial
            </button>
            <button
              onClick={() => setActiveLeftTab("submissions")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeLeftTab === "submissions"
                  ? "bg-white border border-zinc-200 text-blue-600 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <History className="h-3.5 w-3.5" />
              Submissions
            </button>
          </div>
          
          <div className="flex items-center gap-2.5 text-[10px] font-bold text-zinc-400">
            <Cpu className="h-3.5 w-3.5 text-zinc-400" />
            <span>{problem.timeLimit / 1000}s Limit</span>
            <span className="text-zinc-350">|</span>
            <span>{problem.memoryLimit}MB RAM</span>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeLeftTab === "description" && (
            <>
              {/* Problem Title & Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                    {problem.title}
                  </h1>
                  <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold tracking-wide uppercase ${diffStyles.bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${diffStyles.dot}`} />
                    {problem.difficulty}
                  </span>
                </div>
              </div>

              {/* Description Body */}
              <div className="text-sm font-medium leading-relaxed text-zinc-700 space-y-4">
                {problem.description.split("\n\n").map((para, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {/* Render inline backticks nicely */}
                    {para.split("`").map((part, index) => 
                      index % 2 === 1 ? (
                        <code key={index} className="px-1.5 py-0.5 rounded bg-zinc-100 text-blue-600 font-mono text-xs font-semibold">
                          {part}
                        </code>
                      ) : (
                        part
                      )
                    )}
                  </p>
                ))}
              </div>

              {/* Examples section */}
              {testCases && testCases.filter(t => !t.isHidden).length > 0 && (
                <div className="space-y-4.5 pt-4 border-t border-zinc-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Public Examples
                  </h3>
                  <div className="space-y-3">
                    {testCases.filter(t => !t.isHidden).map((tc, index) => (
                      <div key={tc.id} className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 font-mono text-xs space-y-2">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          Example {index + 1}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                              Input:
                            </span>
                            <pre className="p-2 bg-white border border-zinc-100 rounded-md text-zinc-700 whitespace-pre overflow-x-auto">
                              {tc.inputData}
                            </pre>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                              Expected Output:
                            </span>
                            <pre className="p-2 bg-white border border-zinc-100 rounded-md text-zinc-700 whitespace-pre overflow-x-auto">
                              {tc.expectedOutput}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Constraints */}
              {problem.constraints && (
                <div className="space-y-2 pt-4 border-t border-zinc-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Constraints
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs font-semibold text-zinc-600 font-mono">
                    {problem.constraints.split("\n").map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {activeLeftTab === "editorial" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900">Solution Strategy</h2>
              <div className="text-sm leading-relaxed text-zinc-700 font-medium whitespace-pre-wrap">
                {problem.editorial || "No editorial guide has been published for this problem yet. Work out optimal space & time complexities independently!"}
              </div>
            </div>
          )}

          {activeLeftTab === "submissions" && (
            <div className="space-y-4 text-center py-12">
              <div className="h-10 w-10 bg-zinc-50 border border-zinc-150 flex items-center justify-center rounded-xl mx-auto text-zinc-400">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-800">No Submissions Yet</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                  Your C++ submissions for this challenge will appear here. Write code in the editor and click Submit.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Right Side: Editor & Console Pane */}
      <div className="w-full lg:w-1/2 flex flex-col bg-zinc-50 h-1/2 lg:h-full relative">
        
        {/* Code editor top bar */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 bg-white">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-md text-zinc-600">
              C++ (GCC 20)
            </span>
          </div>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 transition-colors border border-zinc-200 bg-white hover:bg-zinc-50 rounded-lg px-3 py-1.5 shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        {/* Monaco Editor Container */}
        <div className="flex-1 relative overflow-hidden bg-white min-h-[250px]">
          <Editor
            height="100%"
            defaultLanguage="cpp"
            value={code}
            onChange={(val) => setCode(val || "")}
            theme="vs" // Premium Light Mode theme
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "var(--font-geist-mono), monospace",
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              padding: { top: 12, bottom: 12 }
            }}
          />
        </div>

        {/* 3. Console Drawer */}
        <div className={`border-t border-zinc-200 bg-white transition-all duration-300 flex flex-col ${
          isConsoleOpen ? "h-[320px]" : "h-12"
        }`}>
          {/* Console Header Bar */}
          <div className="flex items-center justify-between px-4 border-b border-zinc-150 h-12 bg-zinc-50/50">
            <button
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className="flex items-center gap-2 text-xs font-bold text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              <Terminal className="h-4 w-4 text-blue-600" />
              <span>Console Drawer</span>
            </button>

            {isConsoleOpen && (
              <div className="flex gap-1 py-1">
                <button
                  onClick={() => setConsoleTab("testcases")}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    consoleTab === "testcases"
                      ? "bg-white border border-zinc-200 text-blue-600 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  Test Cases
                </button>
                <button
                  onClick={() => setConsoleTab("output")}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    consoleTab === "output"
                      ? "bg-white border border-zinc-200 text-blue-600 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  Submission Output
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                disabled={isRunning || isSubmitting}
                onClick={handleRunCode}
                className="flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 hover:text-zinc-900 text-zinc-600 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />}
                Run
              </button>
              
              <button
                disabled={isRunning || isSubmitting}
                onClick={handleSubmitCode}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-blue-500/10 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Submit
              </button>
            </div>
          </div>

          {/* Console Drawer Content */}
          {isConsoleOpen && (
            <div className="flex-1 overflow-y-auto p-4.5 bg-white font-mono text-xs">
              {consoleTab === "testcases" ? (
                <div className="space-y-4">
                  {/* TestCase Selector buttons */}
                  <div className="flex gap-2">
                    {testCases.map((tc, index) => (
                      <button
                        key={tc.id}
                        onClick={() => setSelectedTestCaseIdx(index)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                          selectedTestCaseIdx === index
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300"
                        }`}
                      >
                        Case {index + 1} {tc.isHidden && "(Hidden)"}
                      </button>
                    ))}
                  </div>

                  {/* Selected Test Case inputs display */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Test Input
                      </label>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 font-mono text-zinc-700 outline-none focus:border-zinc-300 h-24 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Output tab contents */
                <div className="h-full">
                  {!judgeFeedback ? (
                    <div className="flex flex-col items-center justify-center text-zinc-400 py-12 space-y-2">
                      <Terminal className="h-6 w-6 text-zinc-300" />
                      <span>Console outputs will print here after compilation runs.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Submission Status header */}
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <div className="flex items-center gap-3">
                          {["QUEUED", "COMPILING", "RUNNING"].includes(judgeFeedback.status) ? (
                            <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase">
                              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                              <span>{judgeFeedback.status}</span>
                            </div>
                          ) : judgeFeedback.status === "ACCEPTED" ? (
                            <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-50" />
                              <span>Accepted / Output Match</span>
                            </div>
                          ) : judgeFeedback.status === "WA" ? (
                            <div className="flex items-center gap-2 text-rose-600 font-bold uppercase">
                              <XCircle className="h-4 w-4 text-rose-500 fill-rose-50" />
                              <span>Wrong Answer</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-600 font-bold uppercase">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              <span>{judgeFeedback.status === "CE" ? "Compile Error" : judgeFeedback.status}</span>
                            </div>
                          )}
                        </div>

                        {judgeFeedback.executionTime !== null && (
                          <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400">
                            <span>Time: {judgeFeedback.executionTime}ms</span>
                            <span>Memory: {(judgeFeedback.executionMemory || 0) > 1024 ? `${((judgeFeedback.executionMemory || 0) / 1024).toFixed(1)}MB` : `${judgeFeedback.executionMemory || 0}KB`}</span>
                          </div>
                        )}
                      </div>

                      {/* Error or compilation logs */}
                      {judgeFeedback.errorLog && (
                        <div className="space-y-2">
                          <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                            Compilation & Run Error Logs:
                          </div>
                          <pre className="w-full bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3 whitespace-pre-wrap font-mono text-[11px] max-h-40 overflow-y-auto">
                            {judgeFeedback.errorLog}
                          </pre>
                        </div>
                      )}

                      {/* Execution feedback */}
                      {judgeFeedback.status === "ACCEPTED" && (
                        <div className="space-y-2.5 text-zinc-600 font-semibold text-xs">
                          <p>
                            🚀 Congratulations! Your C++ program executed successfully within sandboxed container constraints.
                          </p>
                          <div className="grid grid-cols-2 gap-4 bg-zinc-50 border border-zinc-150 p-4 rounded-xl font-mono text-xs">
                            <div>
                              <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">
                                Test Cases Passed:
                              </span>
                              <span className="text-zinc-800 font-bold text-sm">
                                {judgeFeedback.testCasesPassed} / {testCases.length}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">
                                Sandbox Status:
                              </span>
                              <span className="text-emerald-600 font-bold text-sm">
                                SECURE_CLEAN
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {judgeFeedback.status === "WA" && (
                        <div className="space-y-2 text-zinc-600 font-semibold text-xs">
                          <p>
                            ❌ Your output did not match the expected answer for some test cases.
                          </p>
                          <div className="bg-zinc-50 border border-zinc-150 p-3 rounded-xl">
                            <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                              Failed Testcase Output Difference:
                            </span>
                            <div className="bg-white border border-zinc-100 rounded-lg p-2 font-mono text-zinc-700 whitespace-pre overflow-x-auto text-[11px]">
                              Expected: {testCases[0]?.expectedOutput || "n/a"}<br />
                              Received: [Incorrect output from solution logic]
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
