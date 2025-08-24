import { mealAnalysisFlow } from './flows/meal-analysis-flow';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This is a dev-only server to run Genkit flows locally.
// You must run `genkit start` in a separate terminal.
// The client will then proxy requests to this server.
export default genkit({
  plugins: [googleAI()],
  flows: [mealAnalysisFlow],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
