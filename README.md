# Nescka Lead Tracker

A modern, minimalist web dashboard for tracking leads from Upwork, LinkedIn, and Email. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Centralized Lead Management**: Track leads from multiple sources in one place
- **Smart Filtering**: Filter by source, status, and priority
- **Search Functionality**: Quick search across lead names and messages
- **Responsive Design**: Mobile-friendly with responsive table → stacked cards layout
- **Status Badges**: Visual indicators for Hot, Warm, and Cold leads
- **Priority System**: High, Medium, and Low priority classification
- **Add Lead Modal**: Easy-to-use form for adding new leads
- **Accessibility**: Semantic HTML and ARIA labels throughout

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool and dev server

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd my-leads-ai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Project Structure

```
my-leads-ai/
├── src/
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Tailwind base styles
├── infrastructure/       # AWS CDK infrastructure
│   ├── bin/
│   │   └── app.ts       # CDK app entry point
│   ├── lib/
│   │   ├── n8n-fargate-stack.ts    # n8n on Fargate
│   │   └── api-gateway-stack.ts    # API Gateway setup
│   └── package.json     # CDK dependencies
├── index.html            # HTML template
├── amplify.yml           # AWS Amplify config
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## AWS Infrastructure

This project includes AWS CDK infrastructure for deploying n8n automation workflows:

- **n8n on Fargate**: Serverless container for automation workflows
- **API Gateway**: Managed API endpoint for n8n webhooks
- **Application Load Balancer**: Routes traffic to n8n services
- **AWS Amplify**: Hosts the React frontend

See [infrastructure/README.md](infrastructure/README.md) for detailed setup instructions.

## Future Enhancements

- [ ] Integrate AI summarization pipeline (n8n API)
- [ ] Connect to DynamoDB/Airtable backend
- [ ] Add login with Clerk/Auth0
- [ ] Real-time lead updates
- [ ] Export functionality
- [ ] Analytics dashboard

## License

MIT

