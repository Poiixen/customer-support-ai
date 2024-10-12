'use client'
import { Box, Stack, TextField, Button, Typography } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react"

export default function Home() {
    <Analytics />
    const [messages, setMessages] = useState([{
        role: "assistant", 
        content: "Hi, I am your Support Agent, how can I assist you today?"
    }]);

    const [message, setMessage] = useState('');
    
    const MAX_BUBBLE_LENGTH = 500; // Define the maximum length for each bubble
    const MAX_SENTENCES = 5; // Limit to 5 sentences

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const splitTextIntoChunks = (text, maxLength) => {
        const chunks = [];
        let currentChunk = '';
        const lines = text.split('\n');
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                // Handle bullet points
                const bulletPoint = `${trimmedLine}\n`;
                if ((currentChunk + bulletPoint).length <= maxLength) {
                    currentChunk += bulletPoint;
                } else {
                    chunks.push(currentChunk);
                    currentChunk = bulletPoint;
                }
            } else {
                // Handle regular lines
                if ((currentChunk + (currentChunk ? ' ' : '') + line).length <= maxLength) {
                    currentChunk += (currentChunk ? ' ' : '') + line;
                } else {
                    chunks.push(currentChunk);
                    currentChunk = line;
                }
            }
        });

        if (currentChunk) {
            chunks.push(currentChunk);
        }
        
        return chunks;
    };

    const limitTextToSentences = (text, maxSentences) => {
        const sentences = text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/);
        return sentences.slice(0, maxSentences).join(' ');
    };

    const sendMessage = async () => {
        setMessage("");
        setMessages((messages) => [
            ...messages, 
            { role: "user", content: message }, 
            { role: "assistant", content: "" },
        ]);
        
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify([...messages, { role: "user", content: message }])
        });

        const data = await response.json();
        console.log('API Response:', data);

        if (data.message) {
            const cleanText = data.message.replace(/^\*\*.*\*\*[\s\S]*?---\s+/, ''); 
            const limitedText = limitTextToSentences(cleanText, MAX_SENTENCES);
            const responseText = `${limitedText} Would you like to know more?`;
            const chunks = splitTextIntoChunks(responseText, MAX_BUBBLE_LENGTH);

            setMessages((messages) => [
                ...messages.slice(0, -1),
                ...chunks.map(chunk => ({
                    role: "assistant",
                    content: chunk
                }))
            ]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { // enter key pressed without Shift (i.e., not a newline)
            e.preventDefault(); // prevents the default newline behavior
            sendMessage(); // trigger the send action
        }
    };

    return (
        <Box 
            width="100vw" 
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            bgcolor="#f5f5f5"
        >
            <Box 
                width="100%" 
                bgcolor="#ff6f61" 
                color="white" 
                p={2} 
                textAlign="center"
            >
                <Typography variant="h5" fontSize={{ xs: '1.2rem', sm: '1.5rem', md: '2rem' }}>Customer Service AI</Typography>
            </Box>
            
            <Stack 
                direction="column"
                width={{ xs: '90%', sm: '80%', md: '600px' }} 
                height={{ xs: '80%', md: '700px' }}
                border="1px solid #ddd"
                bgcolor="white"
                p={2}
                spacing={3}
                borderRadius={4}
                boxShadow="0 4px 8px rgba(0,0,0,0.1)"
                mt={2}
            >
                <Stack 
                    direction="column" 
                    spacing={2}
                    flexGrow={1}
                    overflow="auto"
                    maxHeight="100%"
                >
                    {
                        messages.map((message, index) => (
                            <Box key={index} display="flex" justifyContent={
                                message.role === "assistant" ? "flex-start" : "flex-end"
                            }>
                                <Box bgcolor={
                                    message.role === "assistant" ? "#f5deb3" : "#ffebcd"
                                }
                                color="black"
                                borderRadius={16}
                                p={3} 
                                maxWidth="85%" 
                                boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                                sx={{ wordBreak: 'break-word' }}
                                >
                                    {message.content}
                                </Box>
                            </Box>
                        ))
                    }
                    <div ref={messagesEndRef} />
                </Stack>
                <Stack direction="row" spacing={2}>
                    <TextField 
                        label="Message"
                        fullWidth
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        variant="outlined"
                        InputProps={{
                            sx: { fontSize: { xs: '0.8rem', sm: '1rem' } }
                        }}
                    />
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={sendMessage}
                        sx={{ 
                            fontSize: { xs: '0.8rem', sm: '1rem' }, 
                            px: { xs: 1, sm: 2 } 
                        }}
                    >
                        Send
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}