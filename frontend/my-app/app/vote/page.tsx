"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import axios from "axios";
import Header from "../../components/header";
import { redirect, useSearchParams, useRouter } from 'next/navigation';

interface VotingItem {
  id: number;
  item: string;
}

// Create a separate component that uses the search params
function VoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const question = searchParams.get('question');
  const [topPlayers, setTopPlayers] = useState<string[]>([]);
  const [votingData, setVotingData] = useState<VotingItem[]>([]);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const isInTopPlayers = (itemName: string) => {
    return topPlayers.includes(itemName);
  };

  useEffect(() => {
    const getVotingList = async () => {
      const voteList = "https://tcbackend.backendboosterbeast.com/voting-elements/voting_list/";
      const voteSet = id;

      const url = voteList + voteSet;

      try {
        let response;
        axios.get(url)
          .then(res => {
            response = res.data;
            console.log(response);
            setVotingData(response); // Correctly sets voting data
          })
          .catch(error => {
            console.error(error);
          });
      } catch (error) {
        console.error("Error fetching voting list:", error);
      }
    };

    getVotingList();
  }, [id]);

  const handleDragStart = (event: React.DragEvent, player: string) => {
    event.dataTransfer.setData("player", player);
  };

  const handleDrop = (event: React.DragEvent) => {
    const player = event.dataTransfer.getData("player");

    if (player && !topPlayers.includes(player) && topPlayers.length < 10) {
      setTopPlayers((prevTopPlayers) => [...prevTopPlayers, player]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDelete = (playerToDelete: string) => {
    setTopPlayers(topPlayers.filter((player) => player !== playerToDelete));
  };

  const handleSubmit = () => {
    if (topPlayers.length <= 10) {
      Push();  // Call Push when submission is valid
    } else {
      alert("Please select 10 players or less before submitting.");
    }
  };

  function Push() {
    const pushData = async () => {
      try {
        let token = localStorage.getItem('firebaseToken');
        
        // Convert player names to their IDs
        const playerIds = topPlayers.map(playerName => {
          const player = votingData.find(item => item.item === playerName);
          return player ? player.id : null;
        }).filter(id => id !== null);

        console.log(playerIds.toString());
        // Make sure we have all IDs
        if (playerIds.length === topPlayers.length) {
          const response = await axios.post(
            `https://tcbackend.backendboosterbeast.com/current-votes`,
            {
              ranking: playerIds.toString(),
              voting_id: parseInt(id as string)
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          console.log("Vote submitted successfully:", response.data);
          setShowSuccessPopup(true); // Show the success popup instead of redirecting
        } else {
          console.error("Some players couldn't be mapped to IDs");
        }
      } catch (error) {
        console.error("Error posting voting list:", error);
      }
    };

    pushData();
  }

  // Function to handle closing the popup and redirecting
  const handlePopupClose = () => {
    setShowSuccessPopup(false);
    router.push('/vote');
  };

  const onDragStartTopPlayers = (event: React.DragEvent, index: number) => {
    dragItem.current = index;
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragEnterTopPlayers = (event: React.DragEvent, index: number) => {
    if (index !== dragItem.current) {
      dragOverItem.current = index;
    }
  };

  const onDragEndTopPlayers = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const updatedList = [...topPlayers];
      const draggedItemContent = updatedList[dragItem.current];
      updatedList.splice(dragItem.current, 1);
      updatedList.splice(dragOverItem.current, 0, draggedItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      setTopPlayers(updatedList);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="text-center pt-30">
        <h1 className="text-4xl">{question}</h1>
      </div>
      
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Success!</h2>
            <p className="mb-6">Your vote has been submitted successfully.</p>
            <button 
              onClick={handlePopupClose}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}
      
      <div className="vote-page">
        <div className="left-side" onDrop={handleDrop} onDragOver={handleDragOver}>
          <h2 className="top-players-header">Top 10 Items</h2>
          <div className="top-players-list">
            {topPlayers.length === 0 ? (
              <p>No items selected yet. Drag and drop here!</p>
            ) : (
              topPlayers.map((player, index) => (
                <div
                  key={player}
                  className="top-player-item"
                  draggable
                  onDragStart={(e) => onDragStartTopPlayers(e, index)}
                  onDragEnter={(e) => onDragEnterTopPlayers(e, index)}
                  onDragEnd={onDragEndTopPlayers}
                >
                  <span>{index + 1}. {player}</span>
                  <button onClick={() => handleDelete(player)} className="delete-button">
                    ✖️
                  </button>
                </div>
              ))
            )}
          </div>
          <button onClick={handleSubmit} className="submit-button">Submit</button>
        </div>

        <div className="right-side">
          <div className="items">
            <p>Items</p>
          </div>

          {votingData && (
            <div className="players-container">
              <div className="players-list">
                {votingData.map((item: any) => (
                  !isInTopPlayers(item.item) && (
                    <div
                      key={item.id}
                      className="player-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.item)}
                    >
                      <p>{item.item}</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function LoadingVote() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading vote...</p>
      </div>
    </div>
  );
}

// Main page component using Suspense
export default function VotePage() {
  return (
    <Suspense fallback={<LoadingVote />}>
      <VoteContent />
    </Suspense>
  );
}
