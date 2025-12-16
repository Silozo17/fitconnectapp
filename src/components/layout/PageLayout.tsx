import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

const PageLayout = ({ children, title, description }: PageLayoutProps) => {
  return (
    <>
      <Helmet>
        <title>{title} | FitConnect</title>
        <meta name="description" content={description} />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default PageLayout;
