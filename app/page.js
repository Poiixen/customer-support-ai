'use client'
import { Box, Stack, TextField, Button } from "@mui/material";
import { useState, useRef, useEffect } from "react";

export default function Home() {
    const [messages, setMessages] = useState([{
        role: "assistant", 
        content: "Hi, I am the High Performance Programmer Support Agent, how can I assist you today?"
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

    // Function to split text into chunks, ensuring chunks end at sentence boundaries
    const splitTextIntoChunks = (text, maxLength) => {
        const chunks = [];
        let currentChunk = '';
        const sentences = text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/);

        sentences.forEach(sentence => {
            if ((currentChunk + (currentChunk ? ' ' : '') + sentence).length <= maxLength) {
                currentChunk += (currentChunk ? ' ' : '') + sentence;
            } else {
                chunks.push(currentChunk);
                currentChunk = sentence;
            }
        });

        if (currentChunk) {
            chunks.push(currentChunk);
        }
        
        return chunks;
    };

    const limitTextToSentences = (text, maxSentences) => {
        const sentences = text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/); // Split by sentence
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
            // Clean the response to remove any internal instructions or system prompts
            const cleanText = data.message.replace(/^\*\*.*\*\*[\s\S]*?---\s+/, ''); // Remove system prompt part

            // Limit the response to 5 sentences
            const limitedText = limitTextToSentences(cleanText, MAX_SENTENCES);

            // Add a prompt asking if the user wants to know more
            const responseText = `${limitedText} Would you like to know more?`;

            // Split the response content into smaller chunks
            const chunks = splitTextIntoChunks(responseText, MAX_BUBBLE_LENGTH);

            // Update messages state with each chunk
            setMessages((messages) => [
                ...messages.slice(0, -1),
                ...chunks.map(chunk => ({
                    role: "assistant",
                    content: chunk
                }))
            ]);
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
        >
            <Stack 
                direction="column"
                width="600px"
                height="700px"
                border="1px solid black"
                p={2}
                spacing={3}
            >
                <Stack direction="column" 
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
                                    message.role === "assistant" ? "primary.main" : "secondary.main"
                                }
                                color="white"
                                borderRadius={16}
                                p={3}
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
                    />
                    <Button variant="contained" onClick={sendMessage}>Send</Button>
                </Stack>
            </Stack>
        </Box>
    );
}
