import { useState, useRef, useEffect } from 'react'

// Types
type Source = 'All' | 'Upwork' | 'LinkedIn' | 'Email'
type Status = 'All' | 'Hot' | 'Warm' | 'Cold'
type Priority = 'All' | 'High' | 'Medium' | 'Low'
type Tone = 'Professional' | 'Friendly' | 'Casual' | 'Concise' | 'Enthusiastic'

interface Lead {
  id: string
  name: string
  source: 'Upwork' | 'LinkedIn' | 'Email'
  messageSummary: string
  status: 'Hot' | 'Warm' | 'Cold'
  priority: 'High' | 'Medium' | 'Low'
  nextAction: string
  estimatedRate?: string
  contractDuration?: string
  conversionLikelihood?: number
  aiSummary?: string
  aiRecommendation?: string
  dialogue?: Array<{
    id: string
    sender: string
    message: string
    timestamp: string
  }>
}

interface Message {
  id: string
  text: string
  isAi: boolean
  timestamp: Date
}

// Mock data
const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    source: 'Upwork',
    messageSummary: 'Looking for a full-stack developer for a 6-month project',
    status: 'Hot',
    priority: 'High',
    nextAction: 'Follow up in 1 day',
    estimatedRate: '$75-95/hr',
    contractDuration: '6 months',
    conversionLikelihood: 85,
    aiSummary: 'Sarah is actively hiring and impressed with your portfolio. She mentioned budget flexibility and needs to move quickly. Her communication is professional and decisive.',
    aiRecommendation: 'Send the proposal document today with specific timeline. Offer a quick call to discuss technical architecture. This lead is ready to convert with the right proposal.',
    dialogue: [
      { id: '1', sender: 'Sarah Chen', message: 'Hi! I saw your profile on Upwork and was impressed with your React and Node.js work. I need a full-stack developer for a 6-month project building a SaaS platform.', timestamp: '2024-01-15 09:00' },
      { id: '2', sender: 'You', message: 'Thanks Sarah! I\'d love to learn more about your platform. What\'s the timeline and what features are you looking to build?', timestamp: '2024-01-15 09:15' },
      { id: '3', sender: 'Sarah Chen', message: 'We need to launch an MVP in 3 months, then scale features over the next 3 months. Key features: user auth, subscription billing, dashboard analytics, and API integrations.', timestamp: '2024-01-15 09:30' },
      { id: '4', sender: 'You', message: 'Sounds exciting! I\'ve built similar platforms before. I can work 40 hours/week and provide daily updates. Would you like to see my portfolio samples?', timestamp: '2024-01-15 10:00' },
      { id: '5', sender: 'Sarah Chen', message: 'Yes please! Also, what\'s your rate range? Budget is flexible for the right developer.', timestamp: '2024-01-15 10:30' }
    ]
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    source: 'LinkedIn',
    messageSummary: 'Interested in discussing a potential collaboration',
    status: 'Warm',
    priority: 'Medium',
    nextAction: 'Follow up in 3 days',
    estimatedRate: '$60-80/hr',
    contractDuration: '3-4 months',
    conversionLikelihood: 60,
    aiSummary: 'Michael is exploring options and considering multiple developers. He\'s budget-conscious but appreciates quality. The project is still in early planning stages.',
    aiRecommendation: 'Send a detailed case study showing ROI from similar projects. Offer a free 30-minute consultation to discuss his vision. Focus on demonstrating long-term value.',
    dialogue: [
      { id: '1', sender: 'Michael Rodriguez', message: 'Hi! I found your LinkedIn profile and saw you specialize in e-commerce platforms. I\'m looking to revamp our online store.', timestamp: '2024-01-14 14:20' },
      { id: '2', sender: 'You', message: 'Hi Michael! Happy to help. What\'s the current state of your store and what improvements are you looking for?', timestamp: '2024-01-14 15:00' },
      { id: '3', sender: 'Michael Rodriguez', message: 'We\'re using an old Magento setup. Looking to modernize to a React-based solution with better mobile experience.', timestamp: '2024-01-14 16:15' },
      { id: '4', sender: 'You', message: 'Got it! I have experience migrating legacy e-commerce to modern stacks. Could we schedule a call to discuss your specific requirements?', timestamp: '2024-01-14 17:00' },
      { id: '5', sender: 'Michael Rodriguez', message: 'Let me check with my team first. I\'ll get back to you soon with more details.', timestamp: '2024-01-14 18:30' }
    ]
  },
  {
    id: '3',
    name: 'Emily Johnson',
    source: 'Email',
    messageSummary: 'Need help with AI integration in existing platform',
    status: 'Hot',
    priority: 'High',
    nextAction: 'Follow up in 2 days',
    estimatedRate: '$85-100/hr',
    contractDuration: '4 months',
    conversionLikelihood: 90,
    aiSummary: 'Emily has a clear understanding of what she needs and has budget approved. She respects your expertise and is open to your recommendations. This is a high-value project.',
    aiRecommendation: 'Provide a detailed technical proposal within 48 hours. Highlight your AI/ML experience with specific examples. She\'s ready to make a decision quickly.',
    dialogue: [
      { id: '1', sender: 'Emily Johnson', message: 'Hello! We met at the AI conference last month. I need someone to help integrate ChatGPT API into our customer service platform.', timestamp: '2024-01-13 11:00' },
      { id: '2', sender: 'You', message: 'Hi Emily! Great to hear from you. What\'s your current tech stack and what kind of AI features are you envisioning?', timestamp: '2024-01-13 11:30' },
      { id: '3', sender: 'Emily Johnson', message: 'We use Node.js backend with PostgreSQL. Looking to add intelligent ticket routing, automated responses, and sentiment analysis for our support team.', timestamp: '2024-01-13 12:00' },
      { id: '4', sender: 'You', message: 'Perfect! I\'ve built exactly this kind of system. I can integrate OpenAI APIs, build the routing logic, and create a dashboard for monitoring. Budget approved?', timestamp: '2024-01-13 13:00' },
      { id: '5', sender: 'Emily Johnson', message: 'Yes, budget is set aside. Can you send me a proposal with timeline by EOW? We want to start asap.', timestamp: '2024-01-13 14:00' }
    ]
  },
  {
    id: '4',
    name: 'David Kim',
    source: 'Upwork',
    messageSummary: 'Quick question about pricing for web development',
    status: 'Cold',
    priority: 'Low',
    nextAction: 'Follow up in 5 days',
    estimatedRate: '$40-50/hr',
    contractDuration: '2 weeks',
    conversionLikelihood: 30,
    aiSummary: 'David appears to be shopping around for the lowest price. His project scope is unclear and budget seems limited. Not much engagement.',
    aiRecommendation: 'Send a standard price range and template portfolio link. Don\'t invest much time unless he clarifies scope and shows serious intent.',
    dialogue: [
      { id: '1', sender: 'David Kim', message: 'Hi, how much do you charge for web development?', timestamp: '2024-01-12 09:00' },
      { id: '2', sender: 'You', message: 'Hi David! It depends on the project. Could you tell me more about what you\'re looking to build?', timestamp: '2024-01-12 10:00' },
      { id: '3', sender: 'David Kim', message: 'Just a simple website. What\'s your rate?', timestamp: '2024-01-12 14:00' },
      { id: '4', sender: 'You', message: 'For simple sites, typically $50-75/hr. What kind of site are you envisioning? Portfolio, e-commerce, business?', timestamp: '2024-01-12 15:00' },
      { id: '5', sender: 'David Kim', message: 'Ok thanks, I\'ll let you know', timestamp: '2024-01-12 16:00' }
    ]
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    source: 'LinkedIn',
    messageSummary: 'Potential long-term project starting next quarter',
    status: 'Warm',
    priority: 'Medium',
    nextAction: 'Follow up in 7 days',
    estimatedRate: '$70-85/hr',
    contractDuration: '6-12 months',
    conversionLikelihood: 70,
    aiSummary: 'Lisa is planning ahead for Q2. She values long-term partnerships and quality work. Early discussions show good alignment on approach.',
    aiRecommendation: 'Stay in touch monthly with valuable insights. Share relevant articles about her industry. Build relationship for the Q2 opportunity.',
    dialogue: [
      { id: '1', sender: 'Lisa Thompson', message: 'Hello! I saw your post about API architecture - very insightful! We might have a project starting in Q2.', timestamp: '2024-01-10 10:00' },
      { id: '2', sender: 'You', message: 'Hi Lisa! That sounds interesting. What kind of project are you planning?', timestamp: '2024-01-10 11:00' },
      { id: '3', sender: 'Lisa Thompson', message: 'Rebuilding our legacy system with microservices. Looking for someone who can architect the solution and lead implementation.', timestamp: '2024-01-10 12:00' },
      { id: '4', sender: 'You', message: 'That\'s right in my wheelhouse! I\'ve architected several microservices transformations. Would love to discuss your current stack.', timestamp: '2024-01-10 13:00' },
      { id: '5', sender: 'Lisa Thompson', message: 'Perfect! Let me connect you with our CTO. Q2 kickoff, but we can start planning now.', timestamp: '2024-01-10 14:00' }
    ]
  },
  {
    id: '6',
    name: 'James Wilson',
    source: 'Email',
    messageSummary: 'Requesting a quote for mobile app development',
    status: 'Hot',
    priority: 'High',
    nextAction: 'Follow up in 1 day',
    estimatedRate: '$90-110/hr',
    contractDuration: '5 months',
    conversionLikelihood: 80,
    aiSummary: 'James has a well-defined project with funding secured. He\'s tech-savvy and asks good questions. Strong interest in working with you.',
    aiRecommendation: 'Send detailed proposal tomorrow. Include wireframes or mockups if available. He\'s evaluating 2-3 developers - stand out with specificity.',
    dialogue: [
      { id: '1', sender: 'James Wilson', message: 'Hi! I got your contact from a mutual friend. Need an iOS/Android app developer for a fintech startup.', timestamp: '2024-01-16 08:00' },
      { id: '2', sender: 'You', message: 'Hi James! Exciting space. Tell me about the app concept and tech requirements.', timestamp: '2024-01-16 09:00' },
      { id: '3', sender: 'James Wilson', message: 'We\'re building a P2P lending app using React Native. Need banking integrations, KYC verification, real-time payments. Series A funded.', timestamp: '2024-01-16 10:00' },
      { id: '4', sender: 'You', message: 'Sounds like a great project! I\'ve worked with banking APIs and payment systems before. When do you plan to launch?', timestamp: '2024-01-16 11:00' },
      { id: '5', sender: 'James Wilson', message: 'Beta in 4 months, full launch in 6. We need someone full-time. Can you start in 2 weeks?', timestamp: '2024-01-16 12:00' },
      { id: '6', sender: 'You', message: 'Yes, I have capacity. Would love to discuss the full scope and see wireframes. I\'m available for a call this week.', timestamp: '2024-01-16 13:00' }
    ]
  },
  {
    id: '7',
    name: 'Rachel Green',
    source: 'Upwork',
    messageSummary: 'Brief inquiry about availability',
    status: 'Cold',
    priority: 'Low',
    nextAction: 'Follow up in 10 days',
    estimatedRate: 'Not discussed',
    contractDuration: 'Unknown',
    conversionLikelihood: 20,
    aiSummary: 'Rachel sent a generic inquiry with minimal details. Limited engagement and unclear project scope. Low urgency signals.',
    aiRecommendation: 'Send a brief availability update. If no detailed response, mark as cold after 2 weeks.',
    dialogue: [
      { id: '1', sender: 'Rachel Green', message: 'Hi, are you available for a project?', timestamp: '2024-01-11 15:00' },
      { id: '2', sender: 'You', message: 'Hi Rachel! I might be. What kind of project are you working on?', timestamp: '2024-01-11 16:00' },
      { id: '3', sender: 'Rachel Green', message: 'Just checking availability. I\'ll reach out if I need help.', timestamp: '2024-01-11 17:00' }
    ]
  },
  {
    id: '8',
    name: 'Thomas Anderson',
    source: 'LinkedIn',
    messageSummary: 'Interested in your portfolio, let\'s connect',
    status: 'Warm',
    priority: 'Medium',
    nextAction: 'Follow up in 4 days',
    estimatedRate: '$65-80/hr',
    contractDuration: '3 months',
    conversionLikelihood: 55,
    aiSummary: 'Thomas is networking and building connections. He has an interesting project idea but is still in the research phase.',
    aiRecommendation: 'Continue LinkedIn engagement. Share relevant work samples. Nurture the relationship - he could convert when ready.',
    dialogue: [
      { id: '1', sender: 'Thomas Anderson', message: 'Great portfolio! Love your design work. Let\'s connect - might have something interesting.', timestamp: '2024-01-09 10:00' },
      { id: '2', sender: 'You', message: 'Thanks Thomas! What kind of work are you doing?', timestamp: '2024-01-09 11:00' },
      { id: '3', sender: 'Thomas Anderson', message: 'Building a SaaS for creators. Still in ideation but love your aesthetic. Will keep you posted!', timestamp: '2024-01-09 12:00' }
    ]
  }
]

// Status badge component
const StatusBadge = ({ status }: { status: 'Hot' | 'Warm' | 'Cold' }) => {
  const styles = {
    Hot: 'bg-red-100 text-red-800',
    Warm: 'bg-yellow-100 text-yellow-800',
    Cold: 'bg-blue-100 text-blue-800'
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status]}`}>
      {status}
    </span>
  )
}

// Priority badge component
const PriorityBadge = ({ priority }: { priority: 'High' | 'Medium' | 'Low' }) => {
  const styles = {
    High: 'text-red-600 font-bold',
    Medium: 'text-yellow-600 font-semibold',
    Low: 'text-gray-600'
  }
  
  return (
    <span className={styles[priority]}>
      {priority}
    </span>
  )
}

// Sample response generator
const generateSampleResponse = (lead: Lead, tone: Tone): string => {
  const lastDialogue = lead.dialogue && lead.dialogue.length > 0 
    ? lead.dialogue[lead.dialogue.length - 1]
    : null
  
  let response = ''
  
  switch (tone) {
    case 'Professional':
      response = `Dear ${lead.name.split(' ')[0]},\n\nThank you for reaching out regarding the ${lead.messageSummary.toLowerCase()}.\n\nBased on your requirements, I'm confident we can deliver a solution that meets your needs. I would appreciate the opportunity to discuss this project in detail and provide you with a comprehensive proposal.\n\nI'm available for a call this week at your convenience. Please let me know what time works best for you.\n\nBest regards,\n[Your Name]`
      break
    
    case 'Friendly':
      response = `Hi ${lead.name.split(' ')[0]}! 👋\n\nThanks for getting in touch about ${lead.messageSummary.toLowerCase()}! I'm excited about the opportunity to work together.\n\nI'd love to learn more about your vision and how I can help bring it to life. Would you be open to a quick call this week? I'm flexible with timing!\n\nLooking forward to chatting!\n\nBest,\n[Your Name]`
      break
    
    case 'Casual':
      response = `Hey ${lead.name.split(' ')[0]}!\n\nJust saw your message about the project - sounds cool! I've worked on similar stuff before and would be stoked to help out.\n\nWanna hop on a quick call this week to discuss? Happy to work around your schedule.\n\nCheers!\n[Your Name]`
      break
    
    case 'Concise':
      response = `${lead.name.split(' ')[0]},\n\nInterested in discussing your project. Available for a call this week.\n\nBest,\n[Your Name]`
      break
    
    case 'Enthusiastic':
      response = `Hi ${lead.name.split(' ')[0]}!\n\nThis is fantastic! 🎉 Your project sounds amazing and I'm genuinely excited about the possibility of working together.\n\n${lead.messageSummary} is exactly the kind of challenge I love taking on! I'd be thrilled to dive deeper into your vision and show you how I can make this a reality.\n\nLet's schedule a call ASAP - I'm eager to get started!\n\nExcited to connect,\n[Your Name] 💪`
      break
  }
  
  return response
}

// Generate HTML email summary
const generateEmailSummary = (lead: Lead): string => {
  const conversionColor = lead.conversionLikelihood && lead.conversionLikelihood >= 70 ? '#10b981' : 
                         lead.conversionLikelihood && lead.conversionLikelihood >= 50 ? '#f59e0b' : '#ef4444'
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lead Summary: ${lead.name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Nescka Lead Tracker</h1>
              <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">Lead Summary Report</p>
            </td>
          </tr>
          
          <!-- Lead Header -->
          <tr>
            <td style="padding: 30px; border-bottom: 2px solid #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="60" valign="middle">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 24px; font-weight: 700;">
                      ${lead.name.charAt(0)}
                    </div>
                  </td>
                  <td valign="middle" style="padding-left: 20px;">
                    <h2 style="margin: 0 0 5px 0; font-size: 24px; color: #1f2937; font-weight: 700;">${lead.name}</h2>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">${lead.source} Lead</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Key Metrics -->
          <tr>
            <td style="padding: 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td width="50%" style="padding: 15px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; margin-right: 10px;">
                    <div style="font-size: 12px; color: #1e40af; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Conversion Likelihood</div>
                    <div style="font-size: 32px; color: #1e3a8a; font-weight: 700; margin-bottom: 8px;">${lead.conversionLikelihood}%</div>
                    <div style="width: 100%; background: #93c5fd; border-radius: 10px; height: 8px; overflow: hidden;">
                      <div style="width: ${lead.conversionLikelihood}%; background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); height: 100%;"></div>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 15px; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; margin-bottom: 10px;">
                          <div style="font-size: 11px; color: #065f46; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Estimated Rate</div>
                          <div style="font-size: 20px; color: #064e3b; font-weight: 700;">${lead.estimatedRate || 'TBD'}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px; background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border-radius: 12px;">
                          <div style="font-size: 11px; color: #6b21a8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Duration</div>
                          <div style="font-size: 20px; color: #581c87; font-weight: 700;">${lead.contractDuration || 'TBD'}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Status & Priority -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-right: 15px;">
                    <div style="background: ${lead.status === 'Hot' ? '#fee2e2' : lead.status === 'Warm' ? '#fef3c7' : '#dbeafe'}; border-radius: 12px; padding: 20px;">
                      <div style="font-size: 12px; color: ${lead.status === 'Hot' ? '#dc2626' : lead.status === 'Warm' ? '#d97706' : '#2563eb'}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Status</div>
                      <div style="display: inline-block; padding: 6px 16px; background: ${lead.status === 'Hot' ? '#fca5a5' : lead.status === 'Warm' ? '#fcd34d' : '#93c5fd'}; color: ${lead.status === 'Hot' ? '#991b1b' : lead.status === 'Warm' ? '#92400e' : '#1e40af'}; border-radius: 20px; font-size: 14px; font-weight: 700;">${lead.status}</div>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 15px;">
                    <div style="background: #f0fdf4; border-radius: 12px; padding: 20px;">
                      <div style="font-size: 12px; color: #16a34a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Priority</div>
                      <div style="color: ${lead.priority === 'High' ? '#dc2626' : lead.priority === 'Medium' ? '#d97706' : '#6b7280'}; font-size: 16px; font-weight: 700;">${lead.priority}</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- AI Analysis -->
          ${lead.aiSummary ? `
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border-radius: 12px; padding: 25px; border-left: 4px solid #6366f1;">
                <div style="font-size: 14px; color: #4f46e5; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  AI Analysis
                </div>
                <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6;">${lead.aiSummary}</p>
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- Recommended Action -->
          ${lead.aiRecommendation ? `
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; padding: 25px; border-left: 4px solid #10b981;">
                <div style="font-size: 14px; color: #059669; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                  Recommended Action
                </div>
                <p style="margin: 0; color: #064e3b; font-size: 14px; line-height: 1.6;">${lead.aiRecommendation}</p>
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- Project Summary -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background: #ffffff; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px;">
                <div style="font-size: 14px; color: #1f2937; font-weight: 700; margin-bottom: 12px;">Project Summary</div>
                <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">${lead.messageSummary}</p>
              </div>
            </td>
          </tr>
          
          <!-- Next Action -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 25px; border-left: 4px solid #f59e0b;">
                <div style="font-size: 14px; color: #92400e; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Next Action
                </div>
                <p style="margin: 0; color: #78350f; font-size: 14px; font-weight: 600;">${lead.nextAction}</p>
              </div>
            </td>
          </tr>
          
          ${lead.dialogue && lead.dialogue.length > 0 ? `
          <!-- Conversation History -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background: #ffffff; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px;">
                <div style="font-size: 14px; color: #1f2937; font-weight: 700; margin-bottom: 15px;">Recent Conversation</div>
                ${lead.dialogue.slice(-3).map(msg => `
                  <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: ${msg.sender === 'You' ? 'flex-end' : 'flex-start'};">
                      <div style="max-width: 80%;">
                        <div style="background: ${msg.sender === 'You' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6'}; padding: 12px 16px; border-radius: 16px;">
                          <div style="font-size: 11px; color: ${msg.sender === 'You' ? '#e0e7ff' : '#6b7280'}; font-weight: 600; margin-bottom: 6px;">${msg.sender} • ${msg.timestamp}</div>
                          <div style="color: ${msg.sender === 'You' ? '#ffffff' : '#1f2937'}; font-size: 13px; line-height: 1.5;">${msg.message}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- Sample Response Options -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #a7f3d0; border-radius: 12px; padding: 25px;">
                <div style="font-size: 14px; color: #065f46; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  Sample Response Suggestions
                </div>
                
                <!-- Professional Response -->
                <div style="background: #ffffff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                  <div style="font-size: 12px; color: #1e40af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">Professional</div>
                  <p style="margin: 0; color: #4b5563; font-size: 13px; line-height: 1.6; white-space: pre-line;">Dear ${lead.name.split(' ')[0]},\\n\\nThank you for reaching out regarding the ${lead.messageSummary.toLowerCase()}.\\n\\nBased on your requirements, I'm confident we can deliver a solution that meets your needs. I would appreciate the opportunity to discuss this project in detail and provide you with a comprehensive proposal.\\n\\nI'm available for a call this week at your convenience. Please let me know what time works best for you.\\n\\nBest regards,\\n[Your Name]</p>
                </div>
                
                <!-- Enthusiastic Response -->
                <div style="background: #ffffff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                  <div style="font-size: 12px; color: #dc2626; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">Enthusiastic</div>
                  <p style="margin: 0; color: #4b5563; font-size: 13px; line-height: 1.6; white-space: pre-line;">Hi ${lead.name.split(' ')[0]}!\\n\\nThis is fantastic! 🎉 Your project sounds amazing and I'm genuinely excited about the possibility of working together.\\n\\n${lead.messageSummary} is exactly the kind of challenge I love taking on! I'd be thrilled to dive deeper into your vision and show you how I can make this a reality.\\n\\nLet's schedule a call ASAP - I'm eager to get started!\\n\\nExcited to connect,\\n[Your Name] 💪</p>
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 2px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">Generated by Nescka Lead Tracker</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">This is an automated summary of your lead. Login to your dashboard for full details.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

// Mock AI response generator
const generateAIResponse = (userMessage: string, leads: Lead[]): string => {
  const lowerMessage = userMessage.toLowerCase()
  
  // Check for lead count queries
  if (lowerMessage.includes('how many') || lowerMessage.includes('count') || lowerMessage.includes('total')) {
    if (lowerMessage.includes('hot')) {
      const hotLeads = leads.filter(l => l.status === 'Hot')
      return `You have ${hotLeads.length} hot leads currently. Should I break down who needs immediate attention?`
    }
    if (lowerMessage.includes('warm')) {
      const warmLeads = leads.filter(l => l.status === 'Warm')
      return `You have ${warmLeads.length} warm leads. These are great opportunities to nurture!`
    }
    if (lowerMessage.includes('cold')) {
      const coldLeads = leads.filter(l => l.status === 'Cold')
      return `You have ${coldLeads.length} cold leads. Consider a re-engagement campaign.`
    }
    return `You have ${leads.length} total leads in your pipeline. Want details on any specific status?`
  }
  
  // Check for priority queries
  if (lowerMessage.includes('priority') || lowerMessage.includes('urgent')) {
    const highPriorityLeads = leads.filter(l => l.priority === 'High')
    return `You have ${highPriorityLeads.length} high-priority leads: ${highPriorityLeads.map(l => l.name).join(', ')}. These need immediate follow-up!`
  }
  
  // Check for next action queries
  if (lowerMessage.includes('next') || lowerMessage.includes('follow up') || lowerMessage.includes('action')) {
    const todayFollowUps = leads.filter(l => l.nextAction.includes('1 day'))
    return `You have ${todayFollowUps.length} leads needing immediate follow-up today. Consider starting with ${todayFollowUps[0]?.name || 'your highest priority lead'}!`
  }
  
  // Check for source queries
  if (lowerMessage.includes('upwork') || lowerMessage.includes('linkedin') || lowerMessage.includes('email') || lowerMessage.includes('source')) {
    const sourceCounts = {
      Upwork: leads.filter(l => l.source === 'Upwork').length,
      LinkedIn: leads.filter(l => l.source === 'LinkedIn').length,
      Email: leads.filter(l => l.source === 'Email').length
    }
    return `Your leads are distributed across:\n• Upwork: ${sourceCounts.Upwork}\n• LinkedIn: ${sourceCounts.LinkedIn}\n• Email: ${sourceCounts.Email}\n\nWhich channel is performing best for you?`
  }
  
  // Check for greeting
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    return `Hey there! 👋 I'm Alexis, your AI lead assistant. I can help you track and manage your leads. Want to know how many hot leads you have, or what needs follow-up today?`
  }
  
  // Check for help
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you') || lowerMessage.includes('what do you')) {
    return `I can help you with:\n• Lead counts by status or source\n• Priority tracking\n• Follow-up reminders\n• Lead insights\n\nJust ask me anything about your leads!`
  }
  
  // Search for specific lead by name
  const nameMatch = leads.find(lead => 
    lead.name.toLowerCase().includes(lowerMessage) || 
    lowerMessage.includes(lead.name.toLowerCase())
  )
  if (nameMatch) {
    return `Here's what I know about ${nameMatch.name}:\n• Source: ${nameMatch.source}\n• Status: ${nameMatch.status}\n• Priority: ${nameMatch.priority}\n• Message: ${nameMatch.messageSummary}\n• ${nameMatch.nextAction}`
  }
  
  // Default response
  return `I understand you're asking about "${userMessage}". I can help you track your leads, check follow-ups, analyze your pipeline by status or source. What would you like to know?`
}

function App() {
  // State management
  const [leads] = useState<Lead[]>(mockLeads)
  const [sourceFilter, setSourceFilter] = useState<Source>('All')
  const [statusFilter, setStatusFilter] = useState<Status>('All')
  const [priorityFilter, setPriorityFilter] = useState<Priority>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  
  // AI Chat state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey! I'm Alexis 👋, your AI lead assistant. I can help you manage your leads, check follow-ups, and analyze your pipeline. What would you like to know?",
      isAi: true,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  // Sample response state
  const [tone, setTone] = useState<Tone>('Professional')
  const [generatedResponse, setGeneratedResponse] = useState<string>('')
  const [showResponse, setShowResponse] = useState(false)
  
  // Toast state
  const [showToast, setShowToast] = useState(false)
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Show toast notification
  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSource = sourceFilter === 'All' || lead.source === sourceFilter
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter
    const matchesPriority = priorityFilter === 'All' || lead.priority === priorityFilter
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.messageSummary.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSource && matchesStatus && matchesPriority && matchesSearch
  })

  // Handle sending messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userMessage,
      isAi: false,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    // Simulate AI delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage, leads)
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isAi: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMsg])
      setIsLoading(false)
    }, 500)
  }

  // Handle generating sample response
  const handleGenerateResponse = () => {
    if (!selectedLead) return
    const response = generateSampleResponse(selectedLead, tone)
    setGeneratedResponse(response)
    setShowResponse(true)
  }

  // Reset response when tone changes
  useEffect(() => {
    if (showResponse && selectedLead) {
      const response = generateSampleResponse(selectedLead, tone)
      setGeneratedResponse(response)
    }
  }, [tone, selectedLead, showResponse])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Nescka Lead Tracker
              </h1>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full shadow-sm">
                Powered by Nescka AI
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* AI Assistant Button */}
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-purple-300"
                aria-label="Open AI assistant chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="hidden sm:inline font-semibold">Talk to Alexis</span>
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle filters menu"
                aria-expanded={isMobileMenuOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside 
            className={`lg:w-64 transition-all duration-300 ${
              isMobileMenuOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
              {/* Source Filter */}
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Source
                </h2>
                <div className="space-y-2">
                  {(['All', 'Upwork', 'LinkedIn', 'Email'] as Source[]).map((source) => (
                    <button
                      key={source}
                      onClick={() => setSourceFilter(source)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        sourceFilter === source
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      aria-label={`Filter by ${source} source`}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Status
                </h2>
                <div className="space-y-2">
                  {(['All', 'Hot', 'Warm', 'Cold'] as Status[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        statusFilter === status
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      aria-label={`Filter by ${status} status`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Priority
                </h2>
                <div className="space-y-2">
                  {(['All', 'High', 'Medium', 'Low'] as Priority[]).map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setPriorityFilter(priority)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        priorityFilter === priority
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      aria-label={`Filter by ${priority} priority`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  aria-label="Search leads"
                />
                <svg 
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Results count */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredLeads.length} of {leads.length} leads
            </div>

            {/* Table (Desktop) */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Message Summary
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Next Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLeads.map((lead) => (
                      <tr 
                        key={lead.id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {lead.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{lead.source}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-md">
                            {lead.messageSummary}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PriorityBadge priority={lead.priority} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {lead.nextAction}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cards (Mobile) */}
            <div className="lg:hidden space-y-4">
              {filteredLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  className="bg-white rounded-2xl shadow-md p-6 space-y-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                    <StatusBadge status={lead.status} />
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Source:</span>{' '}
                      <span className="text-gray-600">{lead.source}</span>
                    </div>
                    
                    <div>
                      <span className="font-semibold text-gray-700">Priority:</span>{' '}
                      <PriorityBadge priority={lead.priority} />
                    </div>
                    
                    <div>
                      <span className="font-semibold text-gray-700">Message:</span>
                      <p className="text-gray-600 mt-1">{lead.messageSummary}</p>
                    </div>
                    
                    <div>
                      <span className="font-semibold text-gray-700">Next Action:</span>{' '}
                      <span className="text-gray-600">{lead.nextAction}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {filteredLeads.length === 0 && (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <svg 
                  className="mx-auto h-12 w-12 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No leads found</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add Lead Floating Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label="Add new lead"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsModalOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Add New Lead</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter lead name"
                />
              </div>

              <div>
                <label htmlFor="source" className="block text-sm font-semibold text-gray-700 mb-2">
                  Source
                </label>
                <select
                  id="source"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="Upwork">Upwork</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Email">Email</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message Summary
                </label>
                <textarea
                  id="message"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Enter message summary"
                />
              </div>

              <div>
                <label htmlFor="nextAction" className="block text-sm font-semibold text-gray-700 mb-2">
                  Next Action
                </label>
                <input
                  type="text"
                  id="nextAction"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Follow up in 2 days"
                />
              </div>

              {/* TODO: Integrate AI summarization pipeline (n8n API) */}
              {/* TODO: Connect to DynamoDB/Airtable backend */}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md"
                >
                  Add Lead
                </button>
              </div>
            </form>

            {/* TODO: Add login with Clerk/Auth0 later */}
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {selectedLead && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={() => setSelectedLead(null)}
          aria-modal="true"
          role="dialog"
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 my-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {selectedLead.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedLead.name}</h2>
                  <p className="text-sm text-gray-600">{selectedLead.source}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="text-sm text-blue-700 font-semibold mb-1">Conversion Likelihood</div>
                <div className="text-3xl font-bold text-blue-900">{selectedLead.conversionLikelihood}%</div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${selectedLead.conversionLikelihood}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="text-sm text-green-700 font-semibold mb-1">Estimated Rate</div>
                <div className="text-2xl font-bold text-green-900">{selectedLead.estimatedRate || 'TBD'}</div>
                <div className="text-xs text-green-600 mt-1">Per hour</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="text-sm text-purple-700 font-semibold mb-1">Duration</div>
                <div className="text-2xl font-bold text-purple-900">{selectedLead.contractDuration || 'TBD'}</div>
                <div className="text-xs text-purple-600 mt-1">Contract length</div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100">
                <div className="text-sm text-yellow-700 font-semibold mb-1">Status</div>
                <StatusBadge status={selectedLead.status} />
                <PriorityBadge priority={selectedLead.priority} />
              </div>
            </div>

            {/* AI Summary */}
            {selectedLead.aiSummary && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="font-bold text-indigo-900">AI Analysis</h3>
                </div>
                <p className="text-gray-800 leading-relaxed">{selectedLead.aiSummary}</p>
              </div>
            )}

            {/* AI Recommendation */}
            {selectedLead.aiRecommendation && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <h3 className="font-bold text-green-900">Recommended Action</h3>
                </div>
                <p className="text-gray-800 leading-relaxed">{selectedLead.aiRecommendation}</p>
              </div>
            )}

            {/* Message Summary */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">Project Summary</h3>
              <p className="text-gray-700 leading-relaxed">{selectedLead.messageSummary}</p>
            </div>

            {/* Dialogue */}
            {selectedLead.dialogue && selectedLead.dialogue.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Conversation History</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {selectedLead.dialogue.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${msg.sender === 'You' ? 'ml-auto' : 'mr-auto'}`}>
                        <div className={`rounded-2xl px-4 py-3 ${
                          msg.sender === 'You' 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="text-xs font-semibold mb-1 opacity-80">
                            {msg.sender} • {msg.timestamp}
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Action */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="font-bold text-yellow-900">Next Action</h3>
              </div>
              <p className="text-gray-800 mb-4">{selectedLead.nextAction}</p>
              
              {/* Email Me Next Steps Button */}
              <button
                onClick={() => {
                  const emailHtml = generateEmailSummary(selectedLead)
                  const dataUri = 'data:text/html;charset=utf-8,' + encodeURIComponent(emailHtml)
                  window.open(dataUri, '_blank')
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all font-semibold shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Me Next Steps
              </button>
            </div>

            {/* Generate Sample Response */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h3 className="font-bold text-blue-900">Generate Sample Response</h3>
              </div>
              
              {/* Tone Selector */}
              <div className="flex flex-wrap gap-2">
                {(['Professional', 'Friendly', 'Casual', 'Concise', 'Enthusiastic'] as Tone[]).map((toneOption) => (
                  <button
                    key={toneOption}
                    onClick={() => setTone(toneOption)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      tone === toneOption
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {toneOption}
                  </button>
                ))}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateResponse}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all font-semibold shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate {tone} Response
              </button>

              {/* Generated Response Display */}
              {showResponse && (
                <div className="mt-4 bg-white rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Generated Response</h4>
                    <button
                      onClick={() => setShowResponse(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{generatedResponse}</p>
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard(generatedResponse)}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Modal */}
      {isChatOpen && (
        <div 
          className="fixed bottom-20 right-4 sm:right-8 w-[calc(100vw-2rem)] sm:w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-title"
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 id="chat-title" className="font-bold text-lg">Alexis AI</h3>
                <p className="text-xs text-purple-100">Your Lead Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-white hover:bg-opacity-20"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isAi ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.isAi
                      ? 'bg-white border border-gray-200'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                  }`}
                >
                  {message.isAi && (
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-xs font-semibold text-purple-600">Alexis</span>
                    </div>
                  )}
                  <p className={`text-sm whitespace-pre-wrap ${message.isAi ? 'text-gray-800' : 'text-white'}`}>
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about your leads..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                aria-label="Type your message"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">Copied to clipboard!</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

