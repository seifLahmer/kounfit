import { mealAnalysisFlow } from './flows/meal-analysis-flow';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialise Genkit
const ai = genkit({
  plugins: [googleAI()]
 
  // enableTracingAndMetrics n’existe pas non plus dans GenkitOptions
  // mais tu peux activer la trace en configurant tes flows.
});

// Enregistre ton flow
ai.defineFlow('mealAnalysis', mealAnalysisFlow);

export default ai;
