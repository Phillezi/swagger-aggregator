import React, { useState, useEffect } from "react";

interface TimeAgoProps {
  timestamp: number; // Unix timestamp in seconds
}

const TimeAgo: React.FC<TimeAgoProps> = ({ timestamp }) => {
  const [elapsedTime, setElapsedTime] = useState<string>("");

  const getTimeAgo = () => {
    const now = Date.now() / 1000; // Current time in seconds
    const diff = now - timestamp;

    if (diff < 60) {
      // Less than a minute
      return `${Math.floor(diff)} seconds ago`;
    } else if (diff < 3600) {
      // Less than an hour
      return `${Math.floor(diff / 60)} minutes ago`;
    } else if (diff < 86400) {
      // Less than a day
      return `${Math.floor(diff / 3600)} hours ago`;
    } else {
      // More than a day
      return `${Math.floor(diff / 86400)} days ago`;
    }
  };

  useEffect(() => {
    // Update every second
    const interval = setInterval(() => {
      setElapsedTime(getTimeAgo());
    }, 1000);

    setElapsedTime(getTimeAgo());

    return () => clearInterval(interval);
  }, [timestamp]);

  return <span>{elapsedTime}</span>;
};

export default TimeAgo;
