# Lead Scoring API Service 🚀

This is a backend service built for a hiring assignment. It accepts product details and a CSV of business leads, then scores each lead's buying intent using a hybrid model that combines a rule-based engine and AI-powered reasoning from the Google Gemini API. The service is built with Node.js, Express, and MongoDB, and is deployed on Render.

---

## Features

* **RESTful API**: Clean, well-documented API for all operations.
* **Persistent Storage**: Uses MongoDB to store offer details, leads, and scored results.
* **Hybrid Scoring Engine**: Combines a 50-point rule-based system with a 50-point AI analysis for nuanced lead qualification.
* **CSV Processing**: Accepts and parses leads from a standard CSV file.
* **Result Export**: (Bonus) Provides an endpoint to download scored leads as a CSV file.
* **Database Reset**: Includes a utility endpoint to clear all data for a fresh start.

---

##  Live API Base URL

The application is deployed on Render and is ready for testing.

**Base URL**: `https://lead-scoring-1.onrender.com/api/v1`

---

## 📝 API Endpoints Documentation

Here is a complete guide to using the API, similar to a Postman collection.

### 1. Set Offer Details

This endpoint saves the product/offer details that will be used for scoring the leads. It overwrites any previously saved offer.

* **Endpoint**: `POST /offer`
* **Request Body**: `JSON`
    ```json
    {
      "name": "AI Outreach Automation",
      "value_props": ["24/7 outreach", "6x more meetings"],
      "ideal_use_cases": ["B2B SaaS", "Fintech"]
    }
    ```
* **cURL Example**:
    ```bash
    curl -X POST [https://lead-scoring-1.onrender.com/api/v1/offer](https://lead-scoring-1.onrender.com/api/v1/offer) \
    -H "Content-Type: application/json" \
    -d '{
      "name": "AI Outreach Automation",
      "value_props": ["24/7 outreach", "6x more meetings"],
      "ideal_use_cases": ["B2B SaaS", "Fintech"]
    }'
    ```

### 2. Upload Leads CSV

This endpoint accepts a CSV file containing leads. It clears any previously uploaded leads and results.

* **Endpoint**: `POST /leads/upload`
* **Request Body**: `form-data`
    * **Key**: `file`
    * **Value**: Your `.csv` file. The CSV must have the columns: `name,role,company,industry,location,linkedin_bio`.
* **cURL Example**:
    ```bash
    curl -X POST [https://lead-scoring-1.onrender.com/api/v1/leads/upload](https://lead-scoring-1.onrender.com/api/v1/leads/upload) \
    -F "file=@/path/to/your/leads.csv"
    ```

### 3. Run Scoring Process

This endpoint triggers the scoring pipeline. It processes all uploaded leads against the saved offer and saves the results to the database.

* **Endpoint**: `POST /score`
* **cURL Example**:
    ```bash
    curl -X POST [https://lead-scoring-1.onrender.com/api/v1/score](https://lead-scoring-1.onrender.com/api/v1/score)
    ```

### 4. Get Scored Results (JSON)

This endpoint retrieves the list of all scored leads in JSON format.

* **Endpoint**: `GET /results`
* **cURL Example**:
    ```bash
    curl -X GET [https://lead-scoring-1.onrender.com/api/v1/results](https://lead-scoring-1.onrender.com/api/v1/results)
    ```

### 5. Export Results as CSV (Bonus)

This endpoint downloads the scored results as a `scored_leads.csv` file.

* **Endpoint**: `GET /results/export`
* **cURL Example**:
    ```bash
    # This command downloads the file and saves it as scored_leads.csv
    curl -X GET [https://lead-scoring-1.onrender.com/api/v1/results/export](https://lead-scoring-1.onrender.com/api/v1/results/export) -o scored_leads.csv
    ```

### 6. Reset Database

This utility endpoint clears all data from the `offers`, `leads`, and `scoredLeads` collections.

* **Endpoint**: `POST /reset`
* **cURL Example**:
    ```bash
    curl -X POST [https://lead-scoring-1.onrender.com/api/v1/reset](https://lead-scoring-1.onrender.com/api/v1/reset)
    ```

---

## ⚙️ Local Setup and Installation

To run this project on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file** in the root directory and add the following environment variables:
    ```
    # Your MongoDB connection string
    MONGO_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/yourDatabase"

    # Your Google Gemini API Key
    GEMINI_API_KEY="your_api_key_here"
    ```

4.  **Run the application in development mode:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:3000`.

---

## 🛠️ Technology Stack

* **Backend**: Node.js, Express.js
* **Database**: MongoDB with Mongoose
* **AI**: Google Gemini API (`gemini-1.5-flash-latest`)
* **Deployment**: Render

---

## 🧠 Scoring Logic Explanation

Each lead is scored out of 100 points, broken down into two layers:

### Rule Layer (Max 50 Points)
* **Role Relevance (20 pts)**: `+20` for decision-makers (e.g., CEO, VP, Head of), `+10` for influencers (e.g., Manager, Senior).
* **Industry Match (20 pts)**: `+20` if the lead's industry is an ideal match based on the offer's `ideal_use_cases`.
* **Data Completeness (10 pts)**: `+10` if all required fields in the lead's data are present and not empty.

### AI Layer (Max 50 Points)
* The service sends the offer details and the lead's profile to the **Google Gemini** model.
* The prompt asks the AI to classify the lead's buying intent as **High, Medium, or Low** and provide a brief justification.
* The AI's response is mapped to points: `High` = 50, `Medium` = 30, `Low` = 10.

**Final Score = `rule_score` + `ai_points`**
