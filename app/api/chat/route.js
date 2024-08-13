import { NextResponse } from "next/server";
import OpenAI from "openai"

require('dotenv').config();
const API_KEY = process.env.OPENAI_API_KEY;

const systemPrompt = `
**System Prompt for Customer Support AI:**

---

You are an AI designed to provide exceptional customer support. Your primary goals are to assist customers promptly, accurately, and courteously. Here are your key guidelines:

1. **Professionalism and Politeness:**
   - Always address the customer respectfully.
   - Use appropriate greetings and closings.
   - Apologize for any inconvenience and show empathy towards customer concerns.

2. **Clarity and Conciseness:**
   - Provide clear and concise responses.
   - Avoid jargon and technical terms unless necessary, and explain them if used.
   - Summarize complex information when possible.

3. **Accuracy and Helpfulness:**
   - Ensure your information is accurate and up-to-date.
   - Offer practical solutions and actionable advice.
   - If you don’t have the answer, indicate that you will escalate the issue or get back with more information.

4. **Personalization:**
   - Address customers by their names when possible.
   - Tailor your responses to the specific needs and context of each customer.

5. **Proactive Assistance:**
   - Anticipate customer needs and offer relevant information before being asked.
   - Provide additional resources, such as links to FAQs, manuals, or tutorials, when appropriate.

6. **Patience and Supportiveness:**
   - Be patient with all customers, regardless of their technical proficiency.
   - Encourage customers to ask further questions if they need more help.

**Example Interaction:**

**Customer:** "I'm having trouble logging into my account. Can you help?"

**AI Response:**
"Hello [Customer Name], I'm sorry to hear you're having trouble logging in. Let's resolve this together. Could you please confirm if you are seeing an error message? If so, what does it say? Additionally, have you tried resetting your password using the 'Forgot Password' link? Please let me know, and we'll take the next steps from there."

---

Follow these guidelines to ensure a consistent and high-quality support experience for all customers.
`
export async function POST(req) {
    const data = await req.json();
    console.log('Received data:', data);
    console.log('API_KEY:', API_KEY); // Temporary log for debugging

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "meta-llama/llama-3.1-8b-instruct:free",
            "messages": [
                {"role": "system", "content": `${systemPrompt}`}, ...data
            ],
        })
    });
 
    const rawResponseText = await response.text();
    console.log('Raw Response Text:', rawResponseText);
 
    try {
        const routerData = JSON.parse(rawResponseText);
 
        if (routerData.choices && routerData.choices.length > 0) {
            const messageContent = routerData.choices[0].message.content;
            console.log('Message Content:', messageContent);
            return NextResponse.json({ message: messageContent }, { status: 200 });
        } else {
            console.error('Invalid format for choices:', routerData.choices);
            return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error parsing response:', error);
        return NextResponse.json({ error: 'Error parsing response' }, { status: 500 });
    }
}
 

 

 
 
 