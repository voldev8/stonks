import React, { useEffect, useState } from "react";
import axios from "axios";

interface ApiResponse {
  message: string;
}

const FlaskMain: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await axios.get<ApiResponse>("/api");
        setMessage(response.data.message);
        setLoading(false);
      } catch (err) {
        setError("Error fetching data");
        setLoading(false);
      }
    };

    fetchMessage();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return <div>{message}</div>;
};

export default FlaskMain;
