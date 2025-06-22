# Gut Balance Buddy

## Rationale Behind the App
Gut Balance Buddy was developed to empower users with personalized insights into their gut health, leveraging an image recognition model (ChatGPT-4.1) for food and stool analysis, and embedding models (openai/gpt-4o-mini) to understand user data contextually. We incorporated Retrieval-Augmented Generation (RAG) to tailor recommendations and advice based on individual user profiles and food history, ensuring a highly personalized experience——we believe at least user health record and food-stool history contextualises the gut health chat. Vibe coding (lovable) played a crucial role in rapidly prototyping and iterating on the app's user interface, allowing us to create an intuitive and engaging platform that resonates with users' needs.

## Overview
Gut Balance Buddy is a comprehensive web application designed to help users monitor and improve their gut health. With features like food diary tracking, stool analysis, symptom logging, and personalized coaching, the app provides actionable insights and recommendations. Built with modern technologies, it ensures a seamless and secure user experience.

## Project Info
**URL**: https://lovable.dev/projects/2f364e26-5511-4f61-9f40-af28dba2ea7c

## Key Features
- **Food Diary**: Log and analyze your meals to understand their impact on gut health.
- **Stool Tracker**: Record stool characteristics with the Bristol Stool Chart and image analysis for deeper insights.
- **Symptom Tracker**: Monitor symptoms to correlate with dietary and lifestyle factors.
- **Gut Health Coach**: Receive personalized advice and recommendations via an AI-driven chat.
- **Test Results Upload**: Upload and analyze health test results for a comprehensive health profile.
- **Educational Hub**: Access resources to learn more about gut health and wellness.

## How to Edit This Code
There are several ways to edit the Gut Balance Buddy application:

**Use Lovable**
Simply visit the [Lovable Project](https://lovable.dev/projects/2f364e26-5511-4f61-9f40-af28dba2ea7c) and start prompting. Changes made via Lovable will be committed automatically to this repo.

**Use Your Preferred IDE**
If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable. The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

Follow these steps:
```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a File Directly in GitHub**
- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit them.

**Use GitHub Codespaces**
- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once done.

## Technologies Used
This project is built with:
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (for backend and database management)

## How to Deploy This Project
Simply open [Lovable](https://lovable.dev/projects/2f364e26-5511-4f61-9f40-af28dba2ea7c) and click on Share -> Publish.

## Connecting a Custom Domain
To connect a domain, navigate to Project > Settings > Domains and click Connect Domain. Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
