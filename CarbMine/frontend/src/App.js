import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Display from './pages/Display';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Analysis from './pages/Analysis';
import View from './components/View';
import Predict from './pages/Predict';
import Recommendations from './pages/Recommendations';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/calculation' element={<ProtectedRoute element={Display} />} />
        <Route path='/estimate' element={<ProtectedRoute element={Analysis} />} />
        <Route path='/predict' element={<ProtectedRoute element={Predict} />} />
        <Route path='/recommendations' element={<ProtectedRoute element={Recommendations} />} />
        <Route path='/dashboard' element={<ProtectedRoute element={Dashboard} />} />
        <Route path='/view' element={<ProtectedRoute element={View} />} />
      </Routes>
    </Layout>
  );
}

export default App;