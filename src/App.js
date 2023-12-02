import React, { useState } from 'react';
import './index.css';


console.log(process.env.SAN);

function App() {
  const [base64Image, setBase64Image] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  const handleImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      encodeImage(file);
    }
  };

  const encodeImage = (imageFile) => {
    const reader = new FileReader();
    reader.onloadend = function () {
      setBase64Image(reader.result.split(',')[1]);
    };
    reader.readAsDataURL(imageFile);
  };

  function sendRequest(message) {
    const apiKey = process.env.REACT_APP_API_KEY;
     const apiUrl = "https://api.openai.com/v1/chat/completions";
   
     const headers = {
       "Content-Type": "application/json",
       "Authorization": `Bearer ${apiKey}`
     };
   
     const payload = {
       model: "gpt-4-vision-preview",
       messages: [
         {
           role: message.type,
           content: [
             {
               type: "text",
               text: message.content.text
             },
             {
               type: "image_url",
               image_url: {
                 url: `data:image/jpeg;base64,${message.content.image}`
               }
             }
           ]
         }
       ],
       max_tokens: 30
     };
   
     fetch(apiUrl, {
       method: 'POST',
       headers: headers,
       body: JSON.stringify(payload)
     })
     .then(response => {
       if (!response.ok) {
         throw new Error(`HTTP error! Status: ${response.status}`);
       }
       return response.json();
     })
     .then(data => {
       displayResponse(data);
     })
     .catch(error => console.error('Error:', error));
   }
   
   function displayResponse(responseData) {
     const responseContent = responseData.choices[0].message.content;
     const chatElement = document.getElementById('chat');
     const messageElement = document.createElement('div');
     messageElement.className = 'assistant-message';
     messageElement.innerHTML = responseContent;
     chatElement.appendChild(messageElement);
   }
   
   function displayUserMessageWithImage(userInput) {
     const chatElement = document.getElementById('chat');
     const messageElement = document.createElement('div');
     messageElement.className = 'user-message';
     const imgElement = document.createElement('img');
     imgElement.src = `data:image/jpeg;base64,${base64Image}`;
     imgElement.classList.add('user-image');
     messageElement.appendChild(imgElement);
     messageElement.innerHTML += userInput;
     chatElement.appendChild(messageElement);
     document.getElementById('userInput').value = '';
   }
   
   function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (userInput.trim() !== '' && base64Image !== null) {
      displayUserMessageWithImage(userInput);
      sendRequest({ type: 'user', content: { text: userInput, image: base64Image } });
      setBase64Image(null); 
    }
  }
  
   
   function uploadImage() {
     const inputElement = document.getElementById('imageInput');
     inputElement.click();
   }



  return (
    <div className="App">
      <div id="chat-container">
        <div id="chat">
          {}
        </div>
        <div>
          <input type="file" id="imageInput" onChange={handleImage} />
          <input
            type="text"
            id="userInput"
            placeholder="Type your question..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button onClick={uploadImage}>Upload Image</button>
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
      <div className="development-note">
            Note: Still in development. Maximum tokens: 20.
          </div>
    </div>
  );
}

export default App;
