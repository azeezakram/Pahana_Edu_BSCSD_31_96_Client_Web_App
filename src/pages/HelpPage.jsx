import helpVideo from '../assets/videos/pahana-edu-tutorial.mp4'

import React from "react";

const HelpPage = () => {
  return (
    <div className="p-8 bg-white shadow-lg rounded-lg w-full h-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Help & Training</h1>
      <p className="text-gray-600 mb-6">
        Welcome to the staff training panel! 🎉  
        Please watch the video below to learn how to use the system effectively.
      </p>

      <div className="flex justify-center">
        {/* Local video (place your video in public/ folder, e.g., public/help-video.mp4) */}
        <video
          controls
          className="w-full max-w-3xl rounded-lg shadow-lg"
        >
          <source src={helpVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* If you want YouTube embed instead, replace video tag with iframe */}
      {/* 
      <div className="flex justify-center">
        <iframe
          width="100%"
          height="500"
          className="max-w-3xl rounded-lg shadow-lg"
          src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
          title="Training Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      */}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Quick Tips:</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>Use the <b>Add New Item</b> button to create new records.</li>
          <li>Search items using name, brand, category, or stock in the search bar.</li>
          <li>Click the <b>Edit</b> (✏️) button to update item details.</li>
          <li>Click the <b>Delete</b> (🗑️) button to remove an item.</li>
          <li>Always double-check before deleting an item as it cannot be undone.</li>
        </ul>
      </div>
    </div>
  );
};

export default HelpPage;
