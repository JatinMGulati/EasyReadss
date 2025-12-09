/**
 * AI Assistant Controller
 * Handles chat requests and provides book-related assistance
 */

import OpenAI from 'openai'

// Initialize OpenAI client only if API key is available
let openai = null
if (process.env.OPENAI_API_KEY) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  } catch (error) {
    console.warn('Failed to initialize OpenAI client:', error.message)
    openai = null
  }
}

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are a helpful AI assistant for EasyReads, an online bookstore platform. 
Your role is to help users with:
- Finding books, e-books, and audiobooks
- Answering questions about the EasyReads platform
- Providing book recommendations
- Explaining features of the platform
- Helping with navigation and usage

Be friendly, concise, and helpful. If you don't know something specific about the platform, 
provide general helpful information or suggest the user contact support.

Available book categories: Fiction, Science, Biography, Fantasy, History, Technology, Romance
The platform also offers e-books and audiobooks through Google Books API.

Keep responses concise (2-3 sentences max) and focused on helping users navigate and use EasyReads effectively.`

/**
 * Chat with AI Assistant
 * POST /api/ai/chat
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string'
      })
    }

    // Check if OpenAI is available and configured
    if (!openai || !process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not configured, using rule-based responses')
      const response = generateAIResponse(message.trim())
      return res.json({
        success: true,
        response: response
      })
    }

    // Use OpenAI API
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message.trim() }
        ],
        max_tokens: 200,
        temperature: 0.7
      })

      res.json({
        success: true,
        response: completion.choices[0].message.content
      })
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError)
      // Fallback to rule-based responses if OpenAI fails
      const response = generateAIResponse(message.trim())
      res.json({
        success: true,
        response: response
      })
    }
  } catch (error) {
    console.error('AI chat error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process chat request',
      message: error.message
    })
  }
}

/**
 * Generate AI Response
 * This is a simple rule-based system. Replace with actual AI API call in production.
 * 
 * To use OpenAI:
 * 1. Install: npm install openai
 * 2. Add OPENAI_API_KEY to .env
 * 3. Replace this function with OpenAI API call
 */
function generateAIResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase()

  // Book search queries
  if (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('book')) {
    if (lowerMessage.includes('fiction')) {
      return 'You can find fiction books in the Books page under the Fiction category. You can also browse all books on the Home page or use the Books page to filter by category.'
    }
    if (lowerMessage.includes('science')) {
      return 'Science books are available in the Books page under the Science category. Browse the Home page to see featured science books, or visit the Books page to explore all science titles.'
    }
    if (lowerMessage.includes('ebook') || lowerMessage.includes('e-book')) {
      return 'E-books are available on the Digital Books page and also shown on the Home page. You can preview e-books directly from Google Books. Just click the Preview button on any e-book card.'
    }
    if (lowerMessage.includes('audiobook')) {
      return 'Audiobooks are available on the Digital Books page and also shown on the Home page. You can listen to previews by clicking the Listen button on any audiobook card.'
    }
    return 'You can find books in several ways:\n1. Browse by category on the Books page\n2. Check recommendations on the Home page\n3. Search for specific titles\n4. View e-books and audiobooks on the Digital Books page'
  }

  // Platform questions
  if (lowerMessage.includes('how') && (lowerMessage.includes('use') || lowerMessage.includes('work'))) {
    return 'EasyReads is easy to use! Here\'s how:\n1. Browse books by category on the Books page\n2. Check out recommendations on the Home page\n3. View e-books and audiobooks on Digital Books\n4. Request books that aren\'t available on the Requests page\n5. Use the search to find specific titles'
  }

  // Recommendations
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return 'I can help you find great books! Here are some options:\n1. Check the Recommendations section on the Home page - it shows books based on categories you\'ve visited\n2. Browse by category: Fiction, Science, Biography, Fantasy, History, Technology, or Romance\n3. Explore e-books and audiobooks on the Digital Books page\n\nWhat genre are you interested in?'
  }

  // Categories
  if (lowerMessage.includes('category') || lowerMessage.includes('categories')) {
    return 'EasyReads offers books in 7 main categories:\n1. Fiction\n2. Science\n3. Biography\n4. Fantasy\n5. History\n6. Technology\n7. Romance\n\nYou can browse all categories on the Books page or Home page.'
  }

  // Request books
  if (lowerMessage.includes('request') || lowerMessage.includes('not available')) {
    return 'If a book you want isn\'t available, you can request it! Go to the Requests page and fill out the book request form with the book name, author, and optional ISBN. Admins will review your request and notify you when it\'s available.'
  }

  // Features
  if (lowerMessage.includes('feature') || lowerMessage.includes('what can')) {
    return 'EasyReads offers:\n✅ Browse books by category\n✅ Personalized recommendations\n✅ E-books and audiobooks\n✅ Book previews\n✅ Request unavailable books\n✅ Admin dashboard for management\n\nExplore the Home page to see all features!'
  }

  // Greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return 'Hello! I\'m here to help you with EasyReads. You can ask me about:\n- Finding books\n- Book categories\n- E-books and audiobooks\n- How to use the platform\n- Book recommendations\n\nWhat would you like to know?'
  }

  // Default response
  return 'I\'m here to help you with EasyReads! You can ask me about:\n- Finding books by category\n- E-books and audiobooks\n- Book recommendations\n- How to use the platform\n- Requesting books\n\nWhat would you like to know?'
}

/**
 * Example: OpenAI Integration (uncomment and configure to use)
 * 
 * import OpenAI from 'openai'
 * 
 * const openai = new OpenAI({
 *   apiKey: process.env.OPENAI_API_KEY
 * })
 * 
 * export const chatWithAI = async (req, res) => {
 *   try {
 *     const { message } = req.body
 * 
 *     if (!message || typeof message !== 'string' || message.trim().length === 0) {
 *       return res.status(400).json({
 *         success: false,
 *         error: 'Message is required'
 *       })
 *     }
 * 
 *     const completion = await openai.chat.completions.create({
 *       model: 'gpt-3.5-turbo',
 *       messages: [
 *         { role: 'system', content: SYSTEM_PROMPT },
 *         { role: 'user', content: message }
 *       ],
 *       max_tokens: 200,
 *       temperature: 0.7
 *     })
 * 
 *     res.json({
 *       success: true,
 *       response: completion.choices[0].message.content
 *     })
 *   } catch (error) {
 *     console.error('AI chat error:', error)
 *     res.status(500).json({
 *       success: false,
 *       error: 'Failed to process chat request',
 *       message: error.message
 *     })
 *   }
 * }
 */

