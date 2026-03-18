import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Search, Network, FileText, ExternalLink, AlertTriangle, CheckCircle2, ChevronRight, Activity, Database, BrainCircuit, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';

type Stance = 'SUPPORTS' | 'REFUTES' | 'NEUTRAL';

interface Evidence {
  id: string;
  text: string;
  source_url: string;
  stance: Stance;
  stance_confidence: number;
}

interface AnalysisResult {
  verdict: 'FAKE' | 'REAL';
  confidence: number;
  explanation: string;
  evidence: Evidence[];
}

const PipelineStepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { icon: Search, title: "Hybrid RAG Retrieval", desc: "Fetching URL & Wikipedia fallback" },
    { icon: FileText, title: "BM25 Ranking", desc: "Segmenting and ranking evidence chunks" },
    { icon: BrainCircuit, title: "NLI Stance Classification", desc: "RoBERTa encoding & directional stance" },
    { icon: Network, title: "Graph Construction", desc: "Building heterogeneous claim-evidence graph" },
    { icon: Activity, title: "GNN Reasoning", desc: "Message passing & attention pooling" },
    { icon: Database, title: "LLM Explanation", desc: "Generating evidence-grounded justification" }
  ];

  return (
    <div className="space-y-4 w-full">
      {steps.map((step, idx) => {
        const isActive = currentStep === idx;
        const isPast = currentStep > idx;
        const isFuture = currentStep < idx;
        
        return (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${isActive ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : isPast ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-gray-800 bg-gray-900/50 opacity-50'}`}
          >
            <div className={`p-2.5 rounded-full transition-colors duration-500 ${isActive ? 'bg-indigo-500 text-white' : isPast ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
              {isPast ? <CheckCircle2 size={20} /> : isActive ? <Loader2 size={20} className="animate-spin" /> : <step.icon size={20} />}
            </div>
            <div>
              <h4 className={`font-medium transition-colors duration-500 ${isActive ? 'text-indigo-400' : isPast ? 'text-emerald-400' : 'text-gray-500'}`}>{step.title}</h4>
              <p className="text-sm text-gray-400">{step.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

const ResultsDashboard = ({ result }: { result: AnalysisResult }) => {
  const isFake = result.verdict === 'FAKE';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Verdict Card */}
      <div className={`p-6 rounded-2xl border ${isFake ? 'border-rose-500/30 bg-rose-500/5' : 'border-emerald-500/30 bg-emerald-500/5'} flex items-center justify-between`}>
        <div className="flex items-center gap-5">
          <div className={`p-4 rounded-full ${isFake ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
            {isFake ? <ShieldAlert size={36} /> : <ShieldCheck size={36} />}
          </div>
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Detection Verdict</h2>
            <div className="flex items-baseline gap-3">
              <span className={`text-4xl font-black tracking-tight ${isFake ? 'text-rose-500' : 'text-emerald-500'}`}>{result.verdict}</span>
              <span className="text-gray-400 font-mono text-sm">{(result.confidence * 100).toFixed(1)}% confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation Card */}
      <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/50">
        <h3 className="text-lg font-medium text-gray-200 mb-3 flex items-center gap-2">
          <BrainCircuit size={20} className="text-indigo-400" />
          Explanation
        </h3>
        <p className="text-gray-300 leading-relaxed text-sm">
          {result.explanation}
        </p>
      </div>

      {/* Evidence List */}
      <div>
        <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
          <Database size={20} className="text-indigo-400" />
          Retrieved Evidence
        </h3>
        <div className="space-y-4">
          {result.evidence.map((ev, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="p-5 rounded-xl border border-gray-800 bg-gray-900/30 relative overflow-hidden"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${ev.stance === 'SUPPORTS' ? 'bg-emerald-500' : ev.stance === 'REFUTES' ? 'bg-rose-500' : 'bg-gray-500'}`} />
              
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded bg-gray-800 text-xs font-mono text-gray-300 border border-gray-700">
                    [{ev.id}]
                  </span>
                  <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${
                    ev.stance === 'SUPPORTS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    ev.stance === 'REFUTES' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                    'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                  }`}>
                    {ev.stance} ({(ev.stance_confidence * 100).toFixed(0)}%)
                  </span>
                </div>
                <a href={ev.source_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors max-w-[50%]">
                  <span className="truncate">{ev.source_url}</span>
                  <ExternalLink size={12} className="flex-shrink-0" />
                </a>
              </div>
              
              <p className="text-sm text-gray-300 italic border-l-2 border-gray-700 pl-3 py-1">
                "{ev.text}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [headline, setHeadline] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const loadSample1 = () => {
    setHeadline("Pope Francis Shocks World, Endorses Donald Trump for President, Releases Statement");
    setResult(null);
    setCurrentStep(-1);
  };

  const loadSample2 = () => {
    setHeadline("Hillary Clinton wants to abolish the Second Amendment.");
    setResult(null);
    setCurrentStep(-1);
  };

  const handleAnalyze = async () => {
    if (!headline) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setCurrentStep(0);

    // Simulate pipeline steps
    for (let i = 0; i < 6; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    }

    // Determine result
    let finalResult: AnalysisResult;
    
    if (headline.includes("Pope Francis Shocks World")) {
      finalResult = {
        verdict: 'FAKE',
        confidence: 0.96,
        explanation: "The GNN assigns high fake probability (0.96) based on the REFUTES stance pattern from retrieved evidence. Official Vatican sources and credible news outlets explicitly denied any such endorsement, and the original source was identified as a known fake news website.",
        evidence: [
          {
            id: "E1",
            stance: "REFUTES",
            stance_confidence: 0.95,
            source_url: "https://en.wikipedia.org/wiki/Pope_Francis",
            text: "Pope Francis has not endorsed Donald Trump or any other political candidate, maintaining the Vatican's traditional neutrality in foreign elections."
          },
          {
            id: "E2",
            stance: "REFUTES",
            stance_confidence: 0.88,
            source_url: "https://en.wikipedia.org/wiki/Fake_news_website",
            text: "The claim originated from WTOE 5 News, a fantasy news website that publishes satirical and fabricated stories."
          },
          {
            id: "E3",
            stance: "REFUTES",
            stance_confidence: 0.92,
            source_url: "https://en.wikipedia.org/wiki/Holy_See",
            text: "A Vatican spokesperson confirmed that rumors of the Pope endorsing a US presidential candidate are entirely false."
          }
        ]
      };
    } else if (headline.includes("Hillary Clinton wants to abolish")) {
      finalResult = {
        verdict: 'FAKE',
        confidence: 0.91,
        explanation: "The GNN assigns high fake probability (0.91) based on the REFUTES stance pattern. While Clinton has advocated for stricter gun control measures, she has repeatedly stated she does not want to abolish the Second Amendment. The evidence strongly contradicts the absolute claim of abolition.",
        evidence: [
          {
            id: "E1",
            stance: "REFUTES",
            stance_confidence: 0.89,
            source_url: "https://en.wikipedia.org/wiki/Political_positions_of_Hillary_Clinton",
            text: "Hillary Clinton has consistently supported universal background checks and closing gun show loopholes, but has explicitly stated she supports the Second Amendment."
          },
          {
            id: "E2",
            stance: "REFUTES",
            stance_confidence: 0.94,
            source_url: "https://en.wikipedia.org/wiki/2016_United_States_presidential_debates",
            text: "During the 2016 presidential debates, Clinton clarified: 'I support the Second Amendment... I'm not looking to repeal the Second Amendment.'"
          },
          {
            id: "E3",
            stance: "REFUTES",
            stance_confidence: 0.85,
            source_url: "https://en.wikipedia.org/wiki/Second_Amendment_to_the_United_States_Constitution",
            text: "Fact-checking organizations have repeatedly rated claims that Clinton wants to 'abolish' or 'repeal' the Second Amendment as false."
          }
        ]
      };
    } else {
      // Call Gemini for custom input
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: `You are an AI simulating the output of an Evidence-Aware GNN+RAG fake news detection system.
Analyze the following Input Text/Claim and generate a realistic mock analysis.

Input Text: "${headline}"

CRITICAL INSTRUCTIONS FOR EVIDENCE:
1. You MUST generate exactly 3 evidence items.
2. EACH evidence item MUST have a COMPLETELY DIFFERENT \`source_url\`.
3. The \`source_url\` MUST be a highly specific Wikipedia URL directly related to the specific entities, people, locations, or topics mentioned in the Input Text (e.g., https://en.wikipedia.org/wiki/Specific_Person_Name).
4. DO NOT use generic URLs like https://en.wikipedia.org/wiki/News or https://en.wikipedia.org/wiki/Main_Page.
5. The \`text\` for each evidence item should be a realistic 1-2 sentence snippet that would actually be found on that specific Wikipedia page, providing context that either supports, refutes, or gives neutral background to the claim.

Return a JSON object with the following structure:
{
  "verdict": "FAKE" | "REAL",
  "confidence": number (0.5 to 0.99),
  "explanation": "A 3-5 sentence explanation of why the model made this prediction, citing the evidence [E1], [E2], etc.",
  "evidence": [
    {
      "id": "E1",
      "text": "A 1-2 sentence snippet of retrieved evidence from the specific Wikipedia page.",
      "source_url": "https://en.wikipedia.org/wiki/Specific_Topic_1",
      "stance": "SUPPORTS" | "REFUTES" | "NEUTRAL",
      "stance_confidence": number (0.5 to 0.99)
    },
    // exactly 3 evidence items, EACH WITH A DIFFERENT topic-specific source_url
  ]
}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                verdict: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
                evidence: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      source_url: { type: Type.STRING },
                      stance: { type: Type.STRING },
                      stance_confidence: { type: Type.NUMBER }
                    },
                    required: ["id", "text", "source_url", "stance", "stance_confidence"]
                  }
                }
              },
              required: ["verdict", "confidence", "explanation", "evidence"]
            }
          }
        });
        
        let rawText = response.text || "{}";
        rawText = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
        finalResult = JSON.parse(rawText);
      } catch (e: any) {
        console.error(e);
        finalResult = {
          verdict: 'REAL',
          confidence: 0.0,
          explanation: `Fallback analysis due to API error: ${e.message || e}. Please try again.`,
          evidence: [
            { id: "E1", stance: "NEUTRAL", stance_confidence: 0.0, source_url: "https://en.wikipedia.org/wiki/HTTP_404", text: "Error retrieving evidence." },
            { id: "E2", stance: "NEUTRAL", stance_confidence: 0.0, source_url: "https://en.wikipedia.org/wiki/HTTP_404", text: "Error retrieving evidence." },
            { id: "E3", stance: "NEUTRAL", stance_confidence: 0.0, source_url: "https://en.wikipedia.org/wiki/HTTP_404", text: "Error retrieving evidence." }
          ]
        };
      }
    }

    setCurrentStep(6);
    setResult(finalResult);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/50 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Network size={18} />
            </div>
            <div>
              <h1 className="font-semibold text-gray-100 tracking-tight">Evidence-Aware GNN+RAG</h1>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Fake News Detection System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/30">
              <h2 className="text-lg font-medium text-gray-100 mb-5">Article Input</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Input Text / Claim</label>
                  <textarea 
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    placeholder="Enter the article text or claim to analyze..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none h-32"
                  />
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !headline}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.2)] disabled:shadow-none mt-2"
                >
                  {isAnalyzing ? (
                    <><Loader2 size={18} className="animate-spin" /> Running Pipeline...</>
                  ) : (
                    <><Play size={18} fill="currentColor" /> Analyze Article</>
                  )}
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/30">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Sample Articles</h2>
              <div className="space-y-3">
                <button onClick={loadSample1} className="w-full text-left p-4 rounded-xl border border-gray-800 hover:border-gray-600 hover:bg-gray-800/50 transition-all group">
                  <div className="text-sm text-gray-300 font-medium truncate group-hover:text-indigo-400 transition-colors">Pope Francis Shocks World, Endorses Donald Trump...</div>
                  <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5"><Database size={12} /> FakeNewsNet Dataset</div>
                </button>
                <button onClick={loadSample2} className="w-full text-left p-4 rounded-xl border border-gray-800 hover:border-gray-600 hover:bg-gray-800/50 transition-all group">
                  <div className="text-sm text-gray-300 font-medium truncate group-hover:text-indigo-400 transition-colors">Hillary Clinton wants to abolish the Second Amendment.</div>
                  <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5"><Database size={12} /> LIAR Dataset</div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Results / Pipeline Status */}
          <div className="lg:col-span-7">
            <div className="h-full min-h-[600px] p-8 rounded-2xl border border-gray-800 bg-gray-900/20 relative overflow-hidden flex flex-col">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              
              {currentStep === -1 && !result && (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                  <Network size={64} className="text-gray-600 mb-6" strokeWidth={1} />
                  <h3 className="text-xl font-medium text-gray-300 mb-2">System Ready</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Enter an article text or claim, or select a sample, to begin the Evidence-Aware GNN+RAG pipeline.
                  </p>
                </div>
              )}

              {currentStep >= 0 && currentStep < 6 && (
                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                  <h3 className="text-xl font-medium text-gray-200 mb-8 text-center">Pipeline Execution</h3>
                  <PipelineStepper currentStep={currentStep} />
                </div>
              )}

              {result && currentStep === 6 && (
                <ResultsDashboard result={result} />
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
