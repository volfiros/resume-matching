# Agentic Resume Screening & Shortlisting Assistant

A smart AI-powered system that automates resume screening by matching candidates with job requirements using a multi-agent architecture.

🔗 **Live Demo**: [https://assignment-rithvik.vercel.app/](https://assignment-rithvik.vercel.app/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Agent Design](#agent-design)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Trade-offs & Assumptions](#trade-offs--assumptions)
- [Error Handling](#error-handling)
- [Future Improvements](#future-improvements)

---

## 🎯 Overview

This system receives a resume (PDF/DOCX) and job description (TXT) as input, then processes them through a pipeline of specialized AI agents to produce a structured hiring recommendation. Each agent handles a specific task, passing information to the next agent in the pipeline.

### What Makes It "Agentic"

Rather than one monolithic function, the system uses **5 specialized agents**:
- Each agent has a clear, single responsibility
- Agents pass structured data between each other through a shared state
- Decision-making happens at multiple points based on intermediate outputs
- The system handles uncertainty by flagging cases for human review

---

## 🏗️ Architecture

```
┌─────────────────┐
│   User Input    │
│ Resume + Job    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│              ORCHESTRATOR                           │
│  (runScreeningPipeline)                             │
└─────────────────────────────────────────────────────┘
         │
         ├──► 1. Document Parser Agent
         │    ├─ Extracts text from PDF/DOCX
         │    └─ State: { resumeText, jobDescription }
         │
         ├──► 2. Skill Extractor Agent
         │    ├─ Analyzes resume using Gemini 2.5 Flash
         │    └─ State: { extractedSkills, experience, education }
         │
         ├──► 3. Job Analyzer Agent
         │    ├─ Extracts requirements from job description
         │    └─ State: { jobRequirements }
         │
         ├──► 4. Matcher Agent
         │    ├─ Compares candidate profile with requirements
         │    └─ State: { matchDetails }
         │
         └──► 5. Decision Maker Agent
              ├─ Makes final hiring recommendation
              └─ Returns: ScreeningResult
```

### State Management

The system uses a **stateful pipeline** where each agent enriches a shared `AgentState` object:

```typescript
interface AgentState {
  resumeText?: string;
  jobDescription?: string;
  extractedSkills?: string[];
  experience?: string;
  education?: string;
  jobRequirements?: {
    requiredSkills: string[];
    preferredSkills: string[];
    experienceYears?: number;
    education?: string;
    isVague?: boolean; // Flags unclear job descriptions
  };
  matchDetails?: {
    skillMatches: string[];
    skillGaps: string[];
    experienceMatch: boolean;
    educationMatch: boolean;
  };
}
```

---

## 🛠️ Tech Stack

### Core Framework
- **Next.js 16.1.2** - React framework for the web interface
- **React 19.2.3** - UI library
- **TypeScript 5.x** - Type safety and better developer experience

### AI & Processing
- **Google Generative AI (Gemini 2.5 Flash)** - LLM for intelligent text analysis
  - Model: `gemini-2.5-flash`
  - Used for: skill extraction, job analysis, candidate matching, decision making
- **pdf2json** - PDF text extraction
- **mammoth** - DOCX text extraction

### Styling & UI
- **Tailwind CSS 4.x** - Utility-first CSS framework

### File Handling
- **formidable** - Parse multipart form data on the server

---

## 🤖 Agent Design

### 1. Document Parser Agent
**Responsibility**: Convert resume files to text

```typescript
Input:  Buffer (PDF/DOCX), filename
Output: { resumeText, jobDescription }
```

**Logic**:
- Detects file format from extension
- Routes to appropriate parser (pdf2json or mammoth)
- Validates extracted text length
- Handles parsing failures gracefully

### 2. Skill Extractor Agent
**Responsibility**: Extract skills, experience, and education from resume

```typescript
Input:  { resumeText }
Output: { extractedSkills, experience, education }
```

**Prompt Strategy**:
- Asks Gemini to extract structured data as JSON
- Focuses on technical skills, tools, and frameworks
- Requests brief summaries for experience and education

### 3. Job Analyzer Agent
**Responsibility**: Extract requirements from job description and detect vague postings

```typescript
Input:  { jobDescription }
Output: { jobRequirements (including isVague flag) }
```

**Prompt Strategy**:
- Distinguishes between required and preferred skills
- Extracts years of experience and education requirements
- Returns structured JSON for easy comparison

**Vague Job Detection**:
The agent automatically detects unclear job descriptions based on:
- **No specific required skills** extracted
- **Generic keywords only**: "coding", "programming", "team player", "communication"
- **Very short descriptions**: Less than 100 characters
- **Insufficient detail**: Fewer than 3 specific technical skills

When a vague job description is detected, the system immediately flags it for manual review and stops further processing.

### 4. Matcher Agent
**Responsibility**: Compare candidate profile with job requirements

```typescript
Input:  { extractedSkills, experience, education, jobRequirements }
Output: { matchDetails }
```

**Matching Logic**:
- Identifies skill overlaps and gaps
- Evaluates experience and education alignment
- Returns boolean flags for key criteria

### 5. Decision Maker Agent
**Responsibility**: Make final hiring recommendation

```typescript
Input:  { matchDetails, experience, education, jobRequirements }
Output: ScreeningResult
```

**Decision Flow**:

1. **First Check**: Is the job description vague?
   - If `jobRequirements.isVague === true`:
     - Return "Needs manual review"
     - Set `match_score: 0`, `confidence: 0`, `requires_human: true`
     - Provide detailed explanation of what's missing

2. **If job description is clear**, proceed with standard evaluation:

**Decision Criteria**:
- **Score > 0.6**: "Proceed to interview"
- **Score 0.4-0.6**: "Needs manual review"
- **Score < 0.4**: "Reject"
- Sets `requires_human: true` for borderline cases

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 20+ 
- Google Gemini API Key ([Get one here](https://ai.google.dev/))

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd hiring-agent
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open the app**
Navigate to `http://localhost:3000` in your browser

---

## 💻 Usage

### Web Interface

1. **Upload Job Description** (.txt file)
   - Click "Upload Job Description"
   - Select a plain text file containing the job posting

2. **Upload Resume** (.pdf, .doc, or .docx)
   - Click "Upload Resume"
   - Select the candidate's resume

3. **Check Match**
   - Click "Check Match" button
   - Wait for the AI agents to process (typically 5-10 seconds)

4. **Review Results**
   - See match score (0.0-1.0)
   - Read recommendation (Proceed/Reject/Manual Review)
   - Check if human review is required
   - View confidence level
   - Read detailed reasoning

### API Endpoint

**POST** `/api/match`

**Request**:
```typescript
FormData {
  resume: File (PDF/DOCX)
  jobDescription: string (or file)
}
```

**Response**:
```json
{
  "match_score": 0.76,
  "recommendation": "Proceed to technical interview",
  "requires_human": true,
  "confidence": 0.81,
  "reasoning_summary": "Strong backend skills with Python and Django. Limited exposure to large-scale system design. Recommend interview to assess scaling knowledge."
}
```

---

## 🧪 Testing

### Manual Testing Strategy

The current implementation can be tested manually using the provided sample files:

1. **Test with Sample Resume**
   - Use: `resume_01_priya_sharma.pdf` (provided in documents)
   - Expected: Should extract Python, Django, FastAPI skills
   - Status: ✅ Works as expected

2. **Test with Vague Job Description**
   - Use: `jd_04_vague_ambiguous.txt` (provided in documents)
   - Expected: Should detect vague requirements and flag for manual review
   - Status: ✅ Implemented - System detects and flags vague job descriptions

### Recommended Automated Testing Approach

To make the system testable in the future:

#### 1. Unit Tests for Each Agent

```typescript
// Example test structure
describe('Skill Extractor Agent', () => {
  it('should extract skills from resume text', async () => {
    const mockState = {
      resumeText: 'Python developer with 3 years of Django experience'
    };
    const result = await skillExtractorAgent(mockState);
    expect(result.extractedSkills).toContain('Python');
    expect(result.extractedSkills).toContain('Django');
  });
});
```

**Testing Tools**: Jest, @testing-library/react

#### 2. Integration Tests for Pipeline

```typescript
describe('Screening Pipeline', () => {
  it('should process valid resume and job description', async () => {
    const resumeBuffer = fs.readFileSync('./test-fixtures/sample-resume.pdf');
    const jobDescription = 'Backend engineer with Python...';
    
    const result = await runScreeningPipeline(
      resumeBuffer, 
      'sample-resume.pdf', 
      jobDescription
    );
    
    expect(result.match_score).toBeGreaterThan(0);
    expect(result.recommendation).toBeDefined();
  });
});
```

#### 3. Mocking AI Responses

Since Gemini API calls cost money and have rate limits, use mocking:

```typescript
// Mock Gemini responses for consistent testing
jest.mock('@/lib/utils/gemini', () => ({
  callGemini: jest.fn().mockResolvedValue(
    JSON.stringify({
      skills: ['Python', 'Django'],
      experience: '3 years backend',
      education: 'B.Tech Computer Science'
    })
  ),
  parseAIResponse: jest.fn(JSON.parse)
}));
```

#### 4. End-to-End Tests

Use Playwright or Cypress to test the full user flow:

```typescript
test('complete screening workflow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.setInputFiles('input[type="file"]', 'test-resume.pdf');
  await page.fill('textarea', 'Python developer needed...');
  await page.click('button:has-text("Check Match")');
  await expect(page.locator('.match-result')).toBeVisible();
});
```

#### 5. Error Scenario Testing

Test edge cases:
- Empty resume files
- Corrupted PDFs
- Missing job descriptions
- API failures
- Rate limiting

---

## ⚖️ Trade-offs & Assumptions

### Trade-offs

1. **AI Model Choice: Gemini 2.5 Flash**
   - ✅ Fast response times (~2-3 seconds)
   - ✅ Free tier available with generous limits
   - ✅ Good JSON output quality
   - ❌ Not as powerful as GPT-4 for complex reasoning
   - ❌ Requires internet connection

2. **Sequential vs Parallel Agent Execution**
   - Current: Sequential (one agent after another)
   - ✅ Easier to debug and understand
   - ✅ Clear data flow
   - ❌ Slower than parallel execution
   - **Future**: Could parallelize Job Analyzer and Skill Extractor

3. **File Format Support**
   - Supports: PDF, DOCX, DOC
   - ❌ No support for images (screenshot resumes)
   - ❌ No OCR for scanned PDFs
   - **Reason**: Balancing complexity vs common use cases

4. **No Database/Persistence**
   - All processing is stateless
   - ✅ Simpler deployment
   - ✅ No data privacy concerns
   - ❌ Can't track historical decisions
   - ❌ No learning from past matches

### Assumptions

1. **Resume Quality**
   - Assumes resumes are text-based PDFs/DOCX
   - Assumes reasonable formatting (not overly stylized)

2. **Job Descriptions**
   - Assumes plain text format
   - Assumes descriptions include skills, experience requirements

3. **Scoring Thresholds**
   - Score > 0.6 = Good match (arbitrary but reasonable)
   - Could be tuned based on company hiring standards

4. **Language**
   - Assumes English language inputs
   - Gemini can handle other languages but prompts are English-optimized

---

## 🛡️ Error Handling

The system implements **graceful degradation** at every step:

### 1. File Parsing Errors
```typescript
// If PDF parsing fails
catch (error) {
  return {
    recommendation: "Needs manual review",
    requires_human: true,
    reasoning_summary: "Failed to parse resume: [error]. Please verify file format."
  };
}
```

### 2. AI API Failures
- Catches network errors
- Handles invalid JSON responses
- Returns manual review recommendation on failure

### 3. Vague Job Descriptions
```typescript
// Automatically detected and flagged
if (jobRequirements.isVague) {
  return {
    recommendation: "Needs manual review",
    requires_human: true,
    reasoning_summary: "Job description lacks specific technical requirements..."
  };
}
```

### 4. Input Validation
- Checks file extensions before processing
- Validates buffer sizes
- Ensures text extraction produced content

### 5. State Recovery
Each agent catches its own errors and returns a fallback state, preventing the entire pipeline from crashing.

---

## 🚀 Future Improvements

### If I Had More Time

1. **LangGraph Integration** ⭐
   - Replace custom orchestrator with LangGraph
   - Enable conditional routing (skip agents based on confidence)
   - Add retry logic for failed agents

2. **Human-in-the-Loop Features**
   - Web interface for HR to review flagged cases
   - Edit and approve AI decisions
   - Track decision history

3. **Enhanced Matching**
   - Semantic similarity scoring (embeddings)
   - Weighted skill matching (critical vs nice-to-have)
   - Industry-specific scoring models

4. **Performance Optimization**
   - Cache parsed resumes
   - Parallel agent execution where possible
   - Batch processing for multiple candidates

5. **Advanced File Support**
   - OCR for scanned PDFs
   - Image resume parsing
   - LinkedIn profile import

6. **Analytics Dashboard**
   - Track match score distributions
   - Monitor agent performance
   - A/B test different prompts

7. **Multi-Language Support**
   - Detect resume language
   - Translate to English for processing
   - Return results in original language

8. **Testing Infrastructure**
   - Comprehensive unit tests for all agents
   - Integration tests with mock AI responses
   - E2E tests with Playwright
   - Continuous monitoring of AI output quality

---

## 👤 Author

Created by Rithvik for the Pitcrew hiring process.

**Contact**: rithvik.padma@gmail.com  
**GitHub**: https://github.com/volfiros/assignment-rithvik

---

## 🙏 Acknowledgments

- **Pitcrew Team** for the well-designed assignment
- **Google** for Gemini API
- **GitHub Copilot** for assistance with agent parameter design and code structure
- **Next.js Team** for the excellent framework
- **Open Source Community** for pdf2json, mammoth, and other libraries

---

## 📚 Assignment Compliance Checklist

- ✅ Multi-agent architecture with clear responsibilities
- ✅ Agents pass structured data between each other
- ✅ Decision points based on intermediate outputs
- ✅ Handles uncertainty with human review flags
- ✅ Detects and flags vague job descriptions for manual review
- ✅ Clear reasoning and explainability
- ✅ Smart use of AI tools (Gemini)
- ✅ Error handling with graceful failures
- ✅ Comprehensive README with architecture overview
- ✅ Sample inputs and outputs demonstrated
- ✅ Runs locally with clear setup instructions
- ✅ Uses free AI tools (Gemini free tier)
