import React, { useEffect, useState } from 'react';
import api from '../api';

const BackendStatus = () => {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    let mounted = true;
    api.get('/health')
      .then(() => mounted && setStatus('backend: ok'))
      .catch(() => mounted && setStatus('backend: offline'));
    return () => { mounted = false; };
  }, []);

  return (
    <span style={{ fontSize: 12, color: status.includes('ok') ? '#22c55e' : '#ef4444' }}>
      {status}
    </span>
  );
};

export default BackendStatus;


