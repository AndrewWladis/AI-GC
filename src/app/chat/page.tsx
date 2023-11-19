"use client";
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

interface Person {
  id: number;
  name: string;
  prompt: string;
  photo: string;
}

export default function Chat() {
  const chatContainerRef = useRef<any>(null);
  const searchParams = useSearchParams();
  const [people, setPeople] = useState<Person[]>([]);
  const [transcript, setTranscript] = useState(['Start the conversation! Send a message!']);
  const [members, setMembers] = useState<Person[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("https://poised-hen-leg-warmers.cyclic.app/people")
    .then(data => data.json())
    .then((data) => {
      setPeople(data.people)
      const params = searchParams.get('ids');
      if (params != null) {
        const peopleFromParams: Person[] = [];
        params.toString().split(',').forEach((item) => {
          peopleFromParams.push(data.people[Number(item)]);
        });
        setMembers(peopleFromParams);
      }
    })
  }, []);

  useEffect(() => {
    if (chatContainerRef.current != null) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [transcript]);

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

      const response = await fetch('https://poised-hen-leg-warmers.cyclic.app/getChat', {
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
        let resArray = result.response.message.content.split('---');
        console.log(resArray)
        if (resArray.length > 1) {
          resArray = resArray.map((item: string) => item.trim()).filter((item: string) => !item.startsWith('You:'));
        } else {
          resArray[0] = resArray[0].trim();
          if (resArray[0].startsWith('You:')) {
            resArray.splice(0, 1); // Remove the item if it starts with 'You:'
          }
        }
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
      <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto scroll-smooth">
        {transcript.map((message, index) => (
          <div
            key={index}
            className={`rounded-lg p-2 text-white mb-4 self-${isMe(message) ? 'end' : 'start'} text-lg bg-${isMe(message) ? 'blue-500' : 'gray-800'
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
          onSubmit={handleSend}
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
