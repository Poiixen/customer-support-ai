
"use client"


import { useState } from "react";
import { Box, Modal, Stack, TextField, Typography, Button, List } from "@mui/material";
import { deepPurple, lightBlue} from '@mui/material/colors';
import { light } from "@mui/material/styles/createPalette";

export default function Home() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi, I'm the customer support assistant. How can I help you today?"
  }])

  const userTextBackgroundColor = deepPurple['A400'] 
 

  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    // Clear the input field
    setMessage('');
    
    // Add the user's message to the messages array
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: '' },
    ]);
  
    try {
      // Send the user's message to the server
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });
  
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
  
      // Get the server's response
      const data = await response.json();
      const serverMessage = data.message;
  
      // Update the assistant's message with the server's response
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
  
        return [
          ...otherMessages,
          {
            ...lastMessage,
            content: serverMessage
          },
        ];
      });
  
    } catch (error) {
      console.error('Error fetching and processing data:', error);
    }
  };
  

  return (
    <Box
    width="100vw"
    height="100vh"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center">

      <Stack direction={'column'} width="500px" height="700px" border="1px solid black" p={2}  overflow='auto'>
        <Stack direction={"column"} spacing={2} flexGrow={1}>
          {
            messages.map( (message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={message.role == 'assistant' ? 'flex-start' : 'flex-end'}
              >
                <Box
                bgcolor={message.role == 'assistant' ? 'primary.main' : userTextBackgroundColor}
                color = "white"
                borderRadius={16}
                p={2}
                >
                  {message.content}
                </Box>

              </Box>
            ))
          }
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField label="Message" fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}/>
          <Button variant="contained" 
           onClick={sendMessage}
           sx={{
            backgroundColor: "#039be5"
           }}
          > Send</Button>
        </Stack>
      </Stack>

    </Box>
  );
}