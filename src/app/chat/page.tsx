"use client";
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Person {
  id: number;
  name: string;
  prompt: string;
  photo: string;
}

export default function Chat() {
  const searchParams = useSearchParams();
  const people: Person[] = require('../people.json');
  const [transcript, setTranscript] = useState(['Start the conversation! Send a message!']);
  const [members, setMembers] = useState<Person[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = searchParams.get('ids');
    if (params != null) {
      const peopleFromParams: Person[] = [];
      params.toString().split(',').forEach((item) => {
        peopleFromParams.push(people[Number(item)]);
      });
      setMembers(peopleFromParams);
    }
  }, []);

  const isMe = (message: any) => {
    if (typeof message === 'string') {
      return message.startsWith('You:');
    }
    return false; // Return false for non-string messages
  }

  async function getChat() {
    try {
      setQuery('');
      setIsLoading(true);

      const response = await fetch('https://ai-l011.onrender.com/getChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          council: members.map((item) => item.prompt).join(' - '),
          query,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const resArray = result.response.message.content.split('---');
        console.log(resArray)
        setTranscript([...transcript, `You: ${query}`, ...resArray]);
      } else {
        throw new Error(`Error calling your backend API: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
      return 'An error occurred while processing your request.';
    } finally {
      setIsLoading(false);
    }
  }

  const handleSend = () => {
    console.log('Sending:', query);
    setIsLoading(true);
    setTranscript([...transcript, `You: ${query}`]);

    getChat();
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900 text-white">
      <div className="p-2 m-2 flex flex-row items-center content-between bg-gray-800 w-fit rounded-lg">
        {members.map((member) => (
          <div key={member.id} className="m-1">
            <img src={member.photo} alt={member.name} className="w-11 h-11 rounded-full object-cover" />
          </div>
        ))}
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {transcript.map((message, index) => (
          <div
            key={index}
            className={`rounded-lg p-2 text-white mb-4 self-${isMe(message) ? 'end' : 'start'} text-lg bg-${
              isMe(message) ? 'blue-500' : 'gray-800'
            }`}
          >
            {message}
          </div>
        ))}
      </div>
      <div className="p-4 flex items-center">
        <input
          type="text"
          id="prompt"
          placeholder="Type here..."
          className="p-2 rounded-lg border bg-gray-800 text-white w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isLoading ? (
          <div className="ml-2 px-4 py-2 bg-blue-950 rounded-lg text-white">
            Loading...
          </div>
        ) : (
          <button
            className="ml-2 px-4 py-2 rounded-lg text-white bg-blue-500"
            onClick={handleSend}
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
