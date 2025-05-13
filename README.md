# AI Insights Hub

AI Insights Hub is a Next.js application designed to provide daily, actionable intelligence on AI market trends. It leverages Generative AI (via Google's Gemini model through Genkit) to analyze news, research, product launches, and market sentiment, generating key insights for enterprise customers and consulting teams.

## Core Features:

- **Daily AI Trend Analysis**: Automatically generates the top 3-5 AI trends of the day.
- **Capitalization Strategy Engine**: Provides AI-driven recommendations for new service offerings and partnership opportunities based on identified trends.
- **Centralized Insights Dashboard**: A user-friendly dashboard offering a consolidated view of AI trend analysis, capitalization strategies, and curated learning resources.
- **Learning & Resource Curation**: Suggests relevant learning paths, including technical papers, articles, and tutorials for each AI trend.
- **Advanced Search & Filtering**: (Future Enhancement) Robust search capabilities to navigate trends, strategies, and resources.

## Technology Stack:

- **Frontend**: Next.js (App Router), React, TypeScript
- **UI Components**: ShadCN/UI, Tailwind CSS
- **Generative AI**: Google Gemini (via Genkit)
- **Icons**: Lucide React

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/bcprescott/ai-insights-hub.git
    cd ai-insights-hub
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables (API Key):**

    This application uses Google's Gemini API for its AI capabilities. You will need to obtain an API key and configure it.

    *   Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Create a file named `.env` in the root directory of the project.
    *   Add your API key to the `.env` file as follows:

        ```env
        GEMINI_API_KEY=YOUR_GEMINI_API_KEY
        ```
        Replace `YOUR_GEMINI_API_KEY` with the actual key you obtained.

    **Important Security Note:** The `.env` file contains sensitive credentials. It is already included in the `.gitignore` file to prevent it from being committed to your Git repository. **Never commit your API keys or other sensitive information directly into your codebase or share the `.env` file publicly.**

4.  **Run the development server:**
    The application consists of two main parts that need to run concurrently: the Next.js frontend and the Genkit development server for AI flows.

    *   **Start the Next.js app:**
        Open a terminal and run:
        ```bash
        npm run dev
        # or
        yarn dev
        ```
        This will typically start the Next.js application on `http://localhost:9002`.

    *   **Start the Genkit development server:**
        Open a **new, separate terminal** and run:
        ```bash
        npm run genkit:dev
        # or
        yarn genkit:dev
        ```
        This starts the Genkit server, usually on `http://localhost:3400`. You can monitor flow executions and inspect data in the Genkit developer UI.

5.  **Open the application:**
    Navigate to `http://localhost:9002` in your web browser to view the AI Insights Hub.

### Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

And to start the production server:

```bash
npm run start
# or
yarn start
```
Note: For a production deployment, ensure the `GOOGLE_API_KEY` environment variable is set in your deployment environment. The Genkit flows will also need to be deployed or accessible in your production setup.

## Project Structure

- `src/app/`: Next.js App Router pages.
- `src/components/`: Reusable UI components.
  - `src/components/ui/`: ShadCN UI components.
- `src/ai/`: Genkit related files.
  - `src/ai/flows/`: Genkit flows for AI operations.
  - `src/ai/tools/`: Genkit tools (e.g., for fetching data).
  - `src/ai/genkit.ts`: Genkit initialization.
  - `src/ai/cached-flows.ts`: Logic for caching results from AI flows.
- `src/lib/`: Utility functions and constants.
- `src/types/`: TypeScript type definitions, including Zod schemas.
- `public/`: Static assets.

## Style Guidelines:

- **Layout**: Clean, minimalist, persistent left-hand navigation.
- **Colors**:
    - Primary: Neutral tones (light grays, whites).
    - Accent: Teal (`#008080`) for key insights and CTAs.
- **Icons**: Lucide React.
- **Components**: ShadCN components are preferred. Styling is managed via `src/app/globals.css` (Tailwind CSS with HSL CSS variables).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License - see the `LICENSE` file for details (if one exists).
