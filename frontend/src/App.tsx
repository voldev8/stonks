import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import StockData from "./components/StockData";
import FlaskMain from "./components/FlaskMain";

const router = createBrowserRouter([
  {
    path: "/",
    element: <FlaskMain />,
  },
  {
    path: "/stock/:ticker",
    element: <StockData />,
  },
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
