# Competency Question Generator

A Next.js application for teachers to generate personalized, competency-based question sets for students using AI. The application follows Google PAIR HCAI (Human-Centered AI) principles to ensure responsible and transparent AI interactions.

## Features

- **Multi-Student Support**: Create and manage student profiles with learning styles, interests, and support needs
- **AI-Powered Question Generation**: Generate 6-level question sets aligned to the SOT scale (Not started, Emerging, Developing, Secure, Mastering, Extending)
- **Template Presets**: Quick-start with pre-defined curriculum templates
- **Chat Interface**: Refine and iterate on question sets through natural language interactions
- **Export Options**: Download question sets as JSON or copy as Markdown
- **Privacy Controls**: Optional history suppression and data minimization
- **Accessibility**: WCAG AA compliant with keyboard navigation and screen reader support

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** (comes with Node.js) or **yarn**
- **OpenAI API Key** (get one from [OpenAI](https://platform.openai.com/api-keys))

## Installation

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd Prompt_Engineering_Project
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```

4. **Edit `.env.local`** and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4.1-mini
   ```
   
   Replace `your_openai_api_key_here` with your actual OpenAI API key.

## Running the Application

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

3. **Build for production** (optional):
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
Prompt_Engineering_Project/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API endpoint for OpenAI integration
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main application page
├── components/
│   ├── Badges.tsx                # Quality indicator badges
│   ├── ErrorDisplay.tsx          # Error handling UI
│   ├── FeedbackBlock.tsx         # Feedback form component
│   ├── HelpAbout.tsx             # Help/About modal
│   ├── QuestionCard.tsx          # Individual question card
│   └── QuickRefinementChips.tsx  # Quick refinement options
├── data/
│   └── presets.ts                # Template presets
├── types/
│   └── questions.ts              # TypeScript type definitions
├── lib/
│   └── openai.ts                 # OpenAI client configuration
├── ai/
│   └── systemPrompt.ts           # System prompt for AI
├── .env.local.example            # Environment variables template
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## Usage Guide

### Getting Started

1. **Add Students**:
   - Click the "+ Add" button in the Students section
   - Fill in student name, learning style, interests, and support needs
   - Click "Save"

2. **Select Students**:
   - Click on student cards to select them (they'll be highlighted in purple)
   - Use "Select all" / "Deselect all" for quick selection

3. **Generate Question Sets**:
   - On the initial screen, optionally select a template from "Template Starter"
   - Enter Topic and Competency (or use a template)
   - Configure privacy and accessibility options
   - Click "Generate for X students"
   - Wait for the AI to generate personalized question sets

4. **Refine Questions**:
   - After generation, use the chat input at the bottom to refine questions
   - Example: "Make the Developing level more visual" or "Add real-world scenarios"

5. **Export Results**:
   - Each question set has export buttons: "Copy JSON", "Download JSON", "Copy Markdown"

### Key Features

- **Template Starter**: Pre-fill common topics and competencies
- **Plain Language Mode**: Simplifies question wording
- **History Management**: Toggle to prevent storing conversation history
- **Quality Badges**: See curriculum alignment, reading level estimates, and level diversity
- **Feedback System**: Rate and comment on generated question sets

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI Responses API
- **State Management**: React Hooks

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `OPENAI_MODEL` | Model to use (default: `gpt-4.1-mini`) | No |

## Troubleshooting

### Common Issues

1. **"Missing OPENAI_API_KEY" error**:
   - Ensure `.env.local` exists and contains your API key
   - Restart the development server after adding environment variables

2. **Port 3000 already in use**:
   - Use a different port: `npm run dev -- -p 3001`
   - Or stop the process using port 3000

3. **Dependencies not installing**:
   - Clear cache: `npm cache clean --force`
   - Delete `node_modules` and `package-lock.json`, then run `npm install` again

4. **API errors**:
   - Verify your OpenAI API key is valid and has credits
   - Check the browser console for detailed error messages

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript strict mode enabled
- ESLint configured for Next.js
- Tailwind CSS for styling

## Privacy & Security

- **No Analytics**: The application does not track or analyze user behavior
- **Local Storage**: All data (students, sessions) is stored in browser memory only
- **API Calls**: Only the information you provide is sent to OpenAI
- **Best Practice**: Use first names or aliases only; avoid sensitive student details

## Documentation

For detailed information about HCAI (Human-Centered AI) implementation, see:
- `HCAI_NOTES.md` - Comprehensive mapping of Google PAIR patterns to implementation

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Verify your OpenAI API key and account status

## License

This project is for educational purposes as part of the Seminar: Prompt Engineering - Innovation Through Generative AI course.

---

**Note**: This application uses the OpenAI Responses API. Ensure you have appropriate API access and credits before use.

# Competency_Question_Generator
