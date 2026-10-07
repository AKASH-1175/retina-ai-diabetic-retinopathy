# RetinaAI — Multimodal Retinal Intelligence

Research prototype for **Explainable Multimodal RETFound-Based Framework for Diabetic Retinopathy Severity Grading Using Fundus Images, OCT and Clinical Data**.

> **DEMO MODE — Simulated prediction.** No trained model is connected. Every prediction, probability, heatmap and contribution value is simulated. **Research prototype — not for clinical diagnosis.**

## Stack
React 18, Vite, React Router, plain CSS, lucide-react. No database, no auth.

## Structure
```
src/
  components/   Navbar, Pipeline, ClinicalForm, ImageUploader, AnalysisProgress, HeatmapViewer, ResultParts
  pages/        Home, Analyze, Results, About
  services/     api.js (UI calls analyzePatient + normalize adapter), mockApi.js (all demo data)
  utils/        constants.js (form fields, classes), demoAssets.js (placeholder images)
```

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview
```
Open **Analyze → Load Demo Patient → Analyze Patient** for a one-click demo.

## Deploy to Vercel
1. Push this folder to a GitHub repository (`.env` is git-ignored).
2. On vercel.com choose **Add New → Project**, import the repository.
3. Framework preset: **Vite** (build `npm run build`, output `dist`). Click **Deploy**.

`vercel.json` rewrites all paths to `index.html`, so `/analyze`, `/results` and `/about` survive a refresh.
(Or: `npm i -g vercel && vercel`.)

## Demo mode vs real backend
Copy `.env.example` to `.env`:
```env
VITE_USE_MOCK=true                    # demo mode (default)
VITE_API_BASE_URL=http://localhost:8000
```
Set `VITE_USE_MOCK=false` and `VITE_API_BASE_URL=https://your-backend-url` to call the backend. On Vercel set these under **Project → Settings → Environment Variables** and redeploy.

### Future API: `POST /predict` (multipart/form-data)
Fields: `patient_id, age, sex, hba1c, blood_glucose, systolic_bp, diastolic_bp, diabetes_duration, diabetes_type, bmi, fundus_image, oct_image`.
Expected response (any shape is fine — edit `normalize()` in `src/services/api.js`):
```json
{"patient_id":"PT-001","severity":"Moderate NPDR","confidence":0.91,
 "class_probabilities":{"No DR":0.02,"Mild NPDR":0.07,"Moderate NPDR":0.78,"Severe NPDR":0.10,"PDR":0.03},
 "fundus":{"heatmap_url":"...","overlay_url":"..."},"oct":{"heatmap_url":"...","overlay_url":"..."},
 "clinical_explanation":[{"feature":"HbA1c","value":7.2,"shap_value":0.31}]}
```
When `heatmap_url`/`overlay_url` are present, the viewer shows them instead of the simulated heatmap; the modality-contribution card appears only if the backend returns `modality_contribution`. Enable CORS for your Vercel domain on FastAPI.

## Extension points
Add form fields in `src/utils/constants.js`; swap models behind `/predict`; add history, auth, PDF reports and a research-metrics dashboard later. Model evaluation will be added after training and validation.

## Medical disclaimer
Academic research prototype. Not a medical device. Not for diagnosis or treatment decisions.
