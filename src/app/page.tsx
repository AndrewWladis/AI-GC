"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Person {
  id: number;
  name: string;
  prompt: string;
  photo: string;
}

export default function Home() {
  const people: Person[] = require('./people.json');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPeople, setFilteredPeople] = useState(people);
  const [chatMembers, setChatMembers] = useState<Person[]>([]); // State to store chat members
  const router = useRouter();
  
  useEffect(() => {
    const filtered = people.filter((person) =>
      person.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPeople(filtered.reverse());
  }, [searchQuery]);

  // Function to add a person to the chat members
  const addToChat = (person: Person) => {
    if (!chatMembers.includes(person) && chatMembers.length < 8) {
      setChatMembers([...chatMembers, person]);
    }
  };

  const removeFromChat = (person: Person) => {
    setChatMembers(chatMembers.filter((member) => member.id !== person.id));
  };

  const showStartChatButton = chatMembers.length >= 1;

  const startChat = () => {

    const chatMemberIds = chatMembers.map((member) => member.id).join(',');
    
    router.push(`/chat?ids=${chatMemberIds}`);
  };

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-semibold mb-4">AI GC</h1>
      <input
        type="text"
        placeholder="Search People"
        className="w-full p-2 rounded-lg mb-4 text-slate-950"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div style={{height: 400}} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-scroll">
        {filteredPeople.map((person) => (
          <div
            key={person.id}
            className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
              <img
                src={person.photo}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold">{person.name}</h2>
            <button
              className="mt-2 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => addToChat(person)}
            >
              Invite to Chat
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Chat Members:</h2>
        <ul>
          {chatMembers.map((member) => (
            <li key={member.id} className="mb-2 flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {member.name}
              <button
                className="ml-2 px-2 py-1 rounded-md bg-red-500 text-white hover:bg-red-600"
                onClick={() => removeFromChat(member)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
      {showStartChatButton && (
        <button
          className="mt-8 px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 font-semibold"
          onClick={() => startChat()}
        >
          Start Chat
        </button>
      )}
    </div>
  );
}