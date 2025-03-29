
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import Sales from './Sales';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If someone tried to access /dashboard, redirect them to the index page
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  return (
    <Layout>
      <Sales />
    </Layout>
  );
};

export default Index;
