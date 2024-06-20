import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface PageTitleProps {
  title?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title = "Stonks" }) => {
  const location = useLocation();

  useEffect(() => {
    document.title = `Stonks | ${title}`;
  }, [location, title]);

  return null;
};

export default PageTitle;
