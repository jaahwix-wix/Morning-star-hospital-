import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Morning Star Hospital MVP',
    timestamp: new Date().toISOString()
  });
});

// AI Triage & Clinical Advisor Endpoint
app.post('/api/gemini/triage-assistant', async (req, res) => {
  try {
    const { symptoms, vitals, patientAge, gender } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Return structured clinical triage heuristic if API key is not yet set
      return res.json({
        urgency: vitals?.spo2 && vitals.spo2 < 92 ? 'Critical (P1)' : 'Urgent (P2)',
        triageCode: 'TRIAGE-EVAL-2026',
        summary: `Patient (${patientAge || 'Adult'}, ${gender || 'Unspecified'}) presenting with: ${symptoms || 'Acute clinical presentation'}.`,
        differentialDiagnosis: [
          'Acute lower respiratory tract condition',
          'Systemic febrile illness / Malaria workup indicated',
          'Cardiovascular or hemodynamic instability to monitor'
        ],
        recommendedActions: [
          'Immediate Bedside Vitals (SpO2, Pulse, 12-lead ECG if indicated)',
          'Order Stat CBC, Malaria RDT / Thick Film, Serum Electrolytes',
          'Establish IV access and continuous monitoring'
        ],
        cautionFlags: 'Monitor respiratory effort and SpO2 closely. Escalate if oxygen saturation drops below 94%.'
      });
    }

    const prompt = `You are a clinical decision support specialist at Morning Star Hospital. Analyze the following patient intake and provide structured clinical guidance in JSON format.
Patient Age: ${patientAge || 'Adult'}
Gender: ${gender || 'Unspecified'}
Chief Complaint / Symptoms: ${symptoms}
Vitals: ${JSON.stringify(vitals || {})}

Provide output strictly in JSON format with keys:
- urgency (e.g. "Critical (P1_Immediate)", "Urgent (P2_Urgent)", "Delayed (P3)", "Minor (P4)")
- summary (2 sentences of clinical presentation)
- differentialDiagnosis (array of 3-4 likely conditions)
- recommendedActions (array of 3-4 immediate nursing and diagnostic actions)
- cautionFlags (string with critical safety warning)`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text?.trim() || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { summary: text };
    }
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/triage-assistant:', error);
    res.status(500).json({ error: error.message || 'Internal clinical AI assistant error' });
  }
});

// AI Medical SOAP Note Generator
app.post('/api/gemini/soap-note', async (req, res) => {
  try {
    const { patientName, age, symptoms, diagnosis, labResults, examFindings } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        subjective: `Patient ${patientName || 'presenting'} complains of ${symptoms || 'symptoms as noted'}.`,
        objective: `Vitals evaluated. Physical exam findings: ${examFindings || 'Standard examination performed'}. Lab results: ${labResults || 'Pending / standard parameters'}.`,
        assessment: `${diagnosis || 'Clinical evaluation in progress. Primary differential established.'}`,
        plan: '1. Commence targeted pharmaceutical regimen.\n2. Serial vital checks every 4 hours.\n3. Laboratory review upon batch completion.\n4. Scheduled follow-up in 48 hours.'
      });
    }

    const prompt = `You are an expert physician at Morning Star Hospital. Generate a comprehensive, professional SOAP Note (Subjective, Objective, Assessment, Plan) for this patient:
Patient: ${patientName}, Age: ${age}
Chief Symptoms: ${symptoms}
Physical Findings: ${examFindings}
Diagnosis: ${diagnosis}
Relevant Lab Results: ${labResults}

Format output strictly as JSON with keys: "subjective", "objective", "assessment", "plan".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text?.trim() || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { subjective: text, objective: '', assessment: '', plan: '' };
    }
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/soap-note:', error);
    res.status(500).json({ error: error.message || 'Internal SOAP note generator error' });
  }
});

// AI Patient Lab Result Explainer
app.post('/api/gemini/lab-explainer', async (req, res) => {
  try {
    const { testName, resultValue, normalRange, interpretation } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        plainEnglishSummary: `Your ${testName} test was completed. Result recorded: "${resultValue}" with reference standard "${normalRange || 'Standard range'}".`,
        whatThisMeans: interpretation || 'Please discuss this with your attending Morning Star Hospital physician during your consultation.',
        nextSteps: 'Continue all prescribed medication, maintain good hydration, and follow up as scheduled with your doctor.'
      });
    }

    const prompt = `You are a caring patient communicator at Morning Star Hospital. Explain this laboratory diagnostic result in clear, reassuring, plain language that a patient and their family can understand without confusion:
Test: ${testName}
Result: ${resultValue}
Normal Range: ${normalRange}
Clinical Note: ${interpretation}

Return JSON with keys: "plainEnglishSummary", "whatThisMeans", "nextSteps".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text?.trim() || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { plainEnglishSummary: text, whatThisMeans: '', nextSteps: '' };
    }
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/lab-explainer:', error);
    res.status(500).json({ error: error.message || 'Internal lab explainer error' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Morning Star Hospital server running on http://localhost:${PORT}`);
  });
}

startServer();
