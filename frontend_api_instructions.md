# Frontend API Instructions for Lehrplan 21 Worksheet Generator

This document provides detailed instructions for frontend developers on how to interact with the backend API to build a seamless user interface for the worksheet generator.

## Base URL

The API is running locally at `http://localhost:5000`.

---

## Typical Workflow

A typical frontend implementation would follow these steps to guide the user through creating a worksheet:

1.  **Fetch Initial Data**: On page load, call `GET /api/subjects` and `GET /api/cycles` to populate dropdown menus for subject and cycle selection.
2.  **Select Subject and Cycle**: When the user selects a subject and cycle, call `GET /api/competencies/<cycle_id>?subject=<subject_id>` to get a list of relevant competencies for the user to choose from.
3.  **Gather User Input**: Provide a form for the user to enter the `learning_objective` and other contextual information (e.g., `materials_available`, `time_available`).
4.  **Configure Generation**: Allow the user to configure the generation settings, such as which difficulty levels to include (`include_beginner`, `include_intermediate`, `include_advanced`) and whether to generate lesson ideas (`include_lesson_ideas`).
5.  **Generate Worksheet**: Once all information is gathered, send it to the `POST /api/generate_worksheet` endpoint.
6.  **Display Results**: Parse the response from `POST /api/generate_worksheet` and display the generated `activities` and `lesson_ideas` to the user.

---

## API Endpoints

### 1. Health Check

-   **Endpoint:** `GET /api/health`
-   **Description:** Checks if the API server is running. Useful for a status indicator on the frontend.
-   **Example Response:**
    ```json
    {
      "model": "llama3.2",
      "status": "healthy",
      "version": "1.0"
    }
    ```
-   **Example Fetch:**
    ```javascript
    fetch('http://localhost:5000/api/health')
      .then(response => response.json())
      .then(data => console.log(data));
    ```

### 2. Get Subjects

-   **Endpoint:** `GET /api/subjects`
-   **Description:** Retrieves the list of available subject domains to populate a subject selection UI.
-   **Example Response:**
    ```json
    {
      "subjects": [
        { "id": "media", "name": "Media" },
        { "id": "informatics", "name": "Informatics" }
      ]
    }
    ```
-   **Example Fetch:**
    ```javascript
    fetch('http://localhost:5000/api/subjects')
      .then(response => response.json())
      .then(data => {
        // Populate your subject dropdown with data.subjects
        console.log(data.subjects);
      });
    ```

### 3. Get Cycles

-   **Endpoint:** `GET /api/cycles`
-   **Description:** Retrieves the list of available school cycles to populate a cycle selection UI.
-   **Example Response:**
    ```json
    {
      "cycles": [
        { "id": "1", "name": "Cycle 1 (Kindergarten-Grade 2)" },
        { "id": "2", "name": "Cycle 2 (Grades 3-6)" },
        { "id": "3", "name": "Cycle 3 (Grades 7-9)" }
      ]
    }
    ```
-   **Example Fetch:**
     ```javascript
    fetch('http://localhost:5000/api/cycles')
      .then(response => response.json())
      .then(data => {
        // Populate your cycle dropdown with data.cycles
        console.log(data.cycles);
      });
    ```

### 4. Get Competencies by Cycle and Subject

-   **Endpoint:** `GET /api/competencies/<cycle_id>?subject=<subject_id>`
-   **Description:** Retrieves competencies filtered by a specific cycle and subject. This is the primary way to get the list of competencies for the user to choose from.
-   **URL Parameters:**
    -   `cycle_id`: The ID of the selected cycle (e.g., `2`).
    -   `subject`: The ID of the selected subject (e.g., `media`).
-   **Example Request:** `GET http://localhost:5000/api/competencies/2?subject=media`
-   **Example Response:**
    ```json
    {
      "cycle": "2",
      "competencies": [
        {
          "id": "MI_MEDIEN_1",
          "name": "Orientation and Behaviour in Media Environments",
          "domain": "media",
          "cycles": ["1", "2", "3"]
        },
        ...
      ]
    }
    ```
-   **Example Fetch:**
    ```javascript
    const cycleId = '2';
    const subjectId = 'media';
    fetch(`http://localhost:5000/api/competencies/${cycleId}?subject=${subjectId}`)
      .then(response => response.json())
      .then(data => {
        // Populate your competency dropdown with data.competencies
        console.log(data.competencies);
      });
    ```

### 5. Generate Worksheet

-   **Endpoint:** `POST /api/generate_worksheet`
-   **Description:** The main endpoint to generate lesson activities and ideas. It takes a JSON object with the teacher's requirements and returns the generated content.
-   **Request Body (JSON):**
    ```json
    {
      "competency_id": "MI_MEDIEN_1",
      "learning_objective": "Students will learn to identify and critically evaluate fake news.",
      "materials_available": "Projector, computers with internet access.",
      "time_available": "50 minutes",
      "class_size_composition": "20 students, mixed abilities",
      "num_questions_per_level": 2,
      "include_beginner": true,
      "include_intermediate": true,
      "include_advanced": false,
      "include_lesson_ideas": true
    }
    ```
-   **Response Body (JSON):**
    The response contains the `competency_id`, `learning_objective`, a flat array of `activities`, and an optional array of `lesson_ideas`.
    ```json
    {
      "competency_id": "MI_MEDIEN_1",
      "learning_objective": "Students will learn to identify and critically evaluate fake news.",
      "activities": [
        {
          "title": "What is Fake News?",
          "difficulty_level": "Beginner",
          "estimated_duration": 15,
          "materials_needed": ["Whiteboard", "Markers"],
          "min_number_students": 1,
          "max_number_students": 20,
          "description": "A short introduction to the concept of fake news, with a simple Q&A session."
        },
        {
          "title": "Spot the Fake Headline",
          "difficulty_level": "Intermediate",
          "estimated_duration": 25,
          "materials_needed": ["Projector", "List of real and fake headlines"],
          "min_number_students": 2,
          "max_number_students": 20,
          "description": "Students work in groups to identify which headlines are fake and explain their reasoning."
        }
      ],
      "lesson_ideas": [
        {
            "title": "Fake News Detective Agency",
            "learning_objectives": "Identify key characteristics of fake news articles.",
            "activity_description": "Students become 'detectives' for a day. They are given a mix of real and fake news articles and a checklist of things to look for (e.g., source, author, date, emotional language). They work in groups to solve the 'case' of which articles are fake.",
            "materials_needed": ["Printed articles (real and fake)", "Detective checklist"],
            "estimated_duration": "45 minutes"
        }
      ]
    }
    ```
-   **Example Fetch:**
    ```javascript
    const worksheetRequest = {
      competency_id: "MI_MEDIEN_1",
      learning_objective: "Students will learn to identify and critically evaluate fake news.",
      materials_available: "Projector, computers with internet access.",
      time_available: "50 minutes",
      class_size_composition: "20 students, mixed abilities",
      num_questions_per_level": 2,
      include_beginner: true,
      include_intermediate: true,
      include_advanced": false,
      include_lesson_ideas": true
    };

    fetch('http://localhost:5000/api/generate_worksheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(worksheetRequest),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Generated Activities:', data.activities);
      console.log('Generated Lesson Ideas:', data.lesson_ideas);
      // Render the activities and lesson ideas in the UI
    })
    .catch((error) => {
      console.error('Error:', error);
    });
    ```

## Note on File Uploads

The `uploaded_materials` field in the `POST /api/generate_worksheet` request expects an array of **local file paths** that are accessible from the server's file system. This is not suitable for a standard web frontend.

For a web-based frontend, a file upload mechanism needs to be implemented:
1.  Create a new endpoint on the server (e.g., `POST /api/upload`) that accepts multipart/form-data file uploads.
2.  This endpoint should save the uploaded file to a temporary directory on the server.
3.  The endpoint should return the server-side file path of the saved file.
4.  The frontend would first upload the files to this new endpoint, collect the returned file paths, and then include these paths in the `uploaded_materials` array when calling `POST /api/generate_worksheet`.

This feature is not yet implemented in the current version of the API.