import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import StockChart from "./StockChart";

interface StockData {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

const StockData: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<StockData[]>(
          `${import.meta.env.VITE_API_URL}/api/stock/${ticker}`
        );
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching data");
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Stock Data for {ticker}</h1>
      <StockChart data={data} />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default StockData;
