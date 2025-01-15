import React from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Main from '../Main/Main';
import Footer from '../Footer/Footer';
import { SidebarProvider } from '../../context/SidebarContext';
import '../../Dashboard.css';

const DashboardLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="grid-container">
        <Header />
        <Sidebar />
        <Main>
          {children}
        </Main>
        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;