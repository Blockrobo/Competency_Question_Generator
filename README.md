# Tekko Lesson Design Assistant

A Next.js application for teachers to generate competency-aligned lesson designs with scaffolded activities for different difficulty levels. The application uses AI to create lesson ideas displayed on an interactive sticky-note canvas, aligned with Swiss Lehrplan 21 curriculum standards.

## Overview

The Tekko Lesson Design Assistant helps teachers:
- **Design competency-based lessons** aligned with Swiss Lehrplan 21
- **Generate scaffolded activities** for Beginner, Intermediate, and Advanced levels
- **Create lesson ideas** displayed on an interactive canvas
- **Capture teaching context** including class size, materials, time constraints, and student needs
- **Export lesson designs** as JSON for sharing or lesson libraries

## Features

- **Guided Planning Workflow**: Step-by-step wizard that captures teaching context while keeping teachers in control
- **Interactive Sticky-Note Canvas**: Drag, organize, and refine lesson ideas on a visual canvas
- **Multi-Level Support**: Generate activities for Beginner, Intermediate, Advanced, and optional General lesson ideas
- **Context-Aware Generation**: AI considers class size, materials available, time constraints, and teaching preferences
- **Lehrplan 21 Integration**: Built-in competency database aligned with Swiss curriculum standards
- **Export Options**: Download lesson designs as JSON or copy lesson ideas
- **Refinement Interface**: Refine and regenerate lesson ideas through natural language prompts
- **Session History**: Track and manage multiple lesson design sessions

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required
- **Node.js** (version 18.0 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **OpenAI API Key** - [Get one from OpenAI](https://platform.openai.com/api-keys)

### Optional (for Python Backend)
- **Python 3.10 or higher** - [Download Python](https://www.python.org/downloads/)
- **pip** (Python package manager)

## Installation & Setup

Follow these steps to get the application running on your local machine:

### Step 1: Clone or Download the Repository

If you haven't already, navigate to the project directory:

```bash
cd Prompt_Engineering_Project
```

### Step 2: Install Frontend Dependencies

Install all required Node.js packages:

```bash
npm install
```

This will install all dependencies listed in `package.json`, including:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- OpenAI SDK

**Troubleshooting**: If you encounter errors:
- Make sure you're using Node.js 18 or higher: `node --version`
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Step 3: Set Up Environment Variables

Create a `.env.local` file in the root directory of the project:

```bash
# On macOS/Linux:
touch .env.local

# On Windows:
# Create a new file named .env.local
```

Add the following content to `.env.local`:

```env
# Required: Your OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Specify the OpenAI model to use (default: gpt-4.1-mini)
OPENAI_MODEL=gpt-4.1-mini

# Optional: Python backend URL (only needed if using the Python backend)
# If not set, the frontend will try to connect to http://localhost:4000
NEXT_PUBLIC_LEGACY_BACKEND_URL=http://localhost:4000
```

**Important**: 
- Replace `your_openai_api_key_here` with your actual OpenAI API key
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- Restart the development server after changing environment variables

### Step 4: (Optional) Set Up Python Backend

The application can work with or without the Python backend. The frontend will attempt to use the backend if it's available, but it's not required for basic functionality.

If you want to use the Python backend:

1. **Navigate to the backend directory**:
   ```bash
   cd Backend_Prompt
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   # On macOS/Linux:
   python3 -m venv venv
   source venv/bin/activate

   # On Windows:
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up backend environment variables**:
   Create a `.env` file in the `Backend_Prompt` directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4.1-mini
   ```

5. **Start the backend server**:
   ```bash
   cd src
   python api_server.py
   ```
   
   The backend will run on `http://localhost:4000` by default.

### Step 5: Start the Development Server

From the root directory of the project, start the Next.js development server:

```bash
npm run dev
```

You should see output similar to:
```
▲ Next.js 14.2.35
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

### Step 6: Open the Application

Open your web browser and navigate to:

```
http://localhost:3000
```

You should see the Tekko Lesson Design Assistant homepage with the option to "Create a lesson design".

## Usage Guide

### Creating Your First Lesson Design

1. **Start a New Design**:
   - Click "Create a lesson design" on the homepage
   - Or navigate directly to `/design?new=1`

2. **Fill in the Wizard**:
   - **Subject Domain**: Select the subject (e.g., "Media and Computer Science")
   - **Competency**: Choose a Lehrplan 21 competency (e.g., "MI_MEDIEN_2")
   - **Learning Objective**: Describe what students should learn
   - **Difficulty Levels**: Select Beginner, Intermediate, Advanced, and/or General ideas
   - **Class Context**: Provide information about:
     - Class size
     - Class composition (ability levels)
     - Time available
     - Materials available
     - Teaching ideas or notes

3. **Generate Lesson Ideas**:
   - Click "Generate Lesson Design"
   - Wait for the AI to generate activities and lesson ideas
   - The ideas will appear as sticky notes on the canvas

4. **Interact with the Canvas**:
   - **Drag sticky notes** to reorganize them
   - **Zoom in/out** using mouse wheel or trackpad
   - **Pan the canvas** by clicking and dragging the background
   - **View details** by clicking on sticky notes

5. **Refine Your Design**:
   - Use the refinement input at the bottom to request changes
   - Example prompts:
     - "Make the Beginner level more hands-on"
     - "Add more group work activities"
     - "Focus on digital tools for the Intermediate level"

6. **Export Your Design**:
   - Click "Export JSON" to download the lesson design
   - Use the export for lesson libraries or sharing with colleagues

### Key Features Explained

- **Sticky-Note Canvas**: Visual workspace where lesson ideas appear as draggable sticky notes organized by difficulty level
- **Session History**: Access previous lesson designs from the sidebar
- **Context Summary**: Side panel shows your learning objective, class context, and selected levels
- **Refinement**: Continuously improve your lesson design through natural language prompts

## Project Structure

```
Prompt_Engineering_Project/
├── app/
│   ├── design/
│   │   └── page.tsx              # Main lesson design interface
│   ├── designer/
│   │   └── page.tsx              # Alternative designer interface
│   ├── home/                      # Home page routes
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/
│   ├── LessonCanvas.tsx          # Interactive sticky-note canvas
│   ├── StickyNote.tsx            # Individual sticky note component
│   ├── HelpAbout.tsx             # Help/About modal
│   └── ErrorDisplay.tsx          # Error handling UI
├── data/
│   ├── lehrplan21_media_informatics.json  # Competency database
│   └── level_descriptors.json    # Level descriptions
├── lib/
│   └── lessonIdeas.ts            # Lesson idea processing utilities
├── types/
│   └── questions.ts              # TypeScript type definitions
├── Backend_Prompt/               # Optional Python backend
│   ├── src/
│   │   ├── api_server.py         # Flask API server
│   │   └── worksheet_backend.py  # Backend logic
│   └── requirements.txt          # Python dependencies
├── .env.local                    # Environment variables (create this)
├── package.json                  # Node.js dependencies
└── README.md                     # This file
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes | - |
| `OPENAI_MODEL` | OpenAI model to use | No | `gpt-4.1-mini` |
| `NEXT_PUBLIC_LEGACY_BACKEND_URL` | Python backend URL | No | `http://localhost:4000` |

## Available Scripts

From the project root directory:

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start production server (run `npm run build` first)
- `npm run lint` - Run ESLint to check code quality

## Troubleshooting

### Common Issues

#### 1. "Missing OPENAI_API_KEY" Error

**Problem**: The application can't find your OpenAI API key.

**Solutions**:
- Ensure `.env.local` exists in the root directory
- Verify the file contains `OPENAI_API_KEY=your_actual_key_here`
- Make sure there are no spaces around the `=` sign
- Restart the development server after creating/modifying `.env.local`
- Check that your API key is valid and has credits on your OpenAI account

#### 2. Port 3000 Already in Use

**Problem**: Another application is using port 3000.

**Solutions**:
- Stop the other application using port 3000
- Or use a different port: `npm run dev -- -p 3001`
- Then access the app at `http://localhost:3001`

#### 3. Dependencies Not Installing

**Problem**: `npm install` fails or has errors.

**Solutions**:
- Check Node.js version: `node --version` (should be 18+)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again
- On macOS/Linux, try with `sudo` if permission errors occur

#### 4. API Errors or Generation Fails

**Problem**: Lesson generation doesn't work or returns errors.

**Solutions**:
- Verify your OpenAI API key is valid: Check [OpenAI Dashboard](https://platform.openai.com/)
- Ensure you have API credits available
- Check the browser console (F12) for detailed error messages
- Try a different model in `.env.local` (e.g., `gpt-4o-mini`)
- Check your internet connection

#### 5. Backend Connection Errors

**Problem**: Frontend can't connect to Python backend.

**Solutions**:
- The Python backend is optional - the frontend can work without it
- If you want to use the backend:
  - Make sure the backend is running: `cd Backend_Prompt/src && python api_server.py`
  - Verify it's running on port 4000
  - Check that `NEXT_PUBLIC_LEGACY_BACKEND_URL` in `.env.local` matches the backend URL
- If you don't need the backend, you can ignore these errors

#### 6. TypeScript Errors

**Problem**: TypeScript compilation errors.

**Solutions**:
- Run `npm install` to ensure all type definitions are installed
- Check that you're using TypeScript 5.3+ (comes with the project)
- Restart your IDE/editor
- Run `npm run lint` to see specific errors

#### 7. Canvas Not Loading or Sticky Notes Not Appearing

**Problem**: The lesson canvas is empty or not interactive.

**Solutions**:
- Check browser console for JavaScript errors
- Try refreshing the page
- Clear browser cache
- Make sure you've completed the wizard and clicked "Generate Lesson Design"
- Check that the generation completed successfully (no error messages)

### Getting Help

If you encounter issues not covered here:

1. **Check the browser console** (Press F12 → Console tab) for error messages
2. **Check the terminal** where `npm run dev` is running for server errors
3. **Verify your OpenAI API key** is valid and has credits
4. **Review environment variables** in `.env.local`
5. **Check Node.js version** matches requirements (18+)

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI API
- **State Management**: React Hooks
- **Optional Backend**: Python 3.10+ with Flask

## Privacy & Security

- **No Analytics**: The application does not track or analyze user behavior
- **Local Storage**: All session data is stored in browser memory only
- **API Calls**: Only the information you provide is sent to OpenAI
- **Best Practice**: Use general descriptions; avoid sensitive student details
- **Environment Variables**: Never commit `.env.local` to version control

## Documentation

For additional information:

- **HCAI Implementation**: See `HCAI_NOTES.md` for Human-Centered AI principles
- **Backend Documentation**: See `Backend_Prompt/frontend_api_instructions.md` for backend API details
- **Project Summary**: See `Backend_Prompt/project_summary.md` for project overview

## License

This project is for educational purposes as part of the Seminar: Prompt Engineering - Innovation Through Generative AI course at the University of Zurich.

---

## Quick Start Checklist

Use this checklist to ensure you have everything set up:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Repository cloned/downloaded
- [ ] Dependencies installed (`npm install` completed successfully)
- [ ] `.env.local` file created in root directory
- [ ] OpenAI API key added to `.env.local`
- [ ] Development server started (`npm run dev`)
- [ ] Application opens in browser at http://localhost:3000
- [ ] (Optional) Python backend set up and running

**Note**: This application uses the OpenAI API. Ensure you have appropriate API access and credits before use. API usage may incur costs based on your OpenAI plan.
