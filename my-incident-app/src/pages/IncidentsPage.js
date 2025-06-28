// src/pages/IncidentsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incidentsApi } from '../api/api';

const IncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, handleAuthError } = useAuth();

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        console.log('Starting to fetch incidents...');
        console.log('Current user:', user);
        
        const data = await incidentsApi.getAll();
        console.log('Successfully fetched incidents:', data);
        
        setIncidents(data);
        setError('');
      } catch (err) {
        console.error('Error fetching incidents:', err);
        console.error('Error details:', {
          code: err.code,
          message: err.message,
          response: err.response
        });
        
        if (err.code === 401) {
          console.log('Handling 401 error...');
          handleAuthError(err);
        } else {
          setError(err.message || 'Не удалось загрузить инциденты');
        }
      } finally {
        console.log('Finishing fetch operation...');
        setLoading(false);
      }
    };

    if (user) {
      console.log('User is authenticated, fetching incidents...');
      fetchIncidents();
    } else {
      console.log('No user found, skipping fetch...');
      setLoading(false);
      handleAuthError({
        code: 401,
        message: 'Требуется авторизация'
      });
    }
  }, [user, handleAuthError]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'Открыт';
      case 'in_progress':
        return 'В работе';
      case 'resolved':
        return 'Решен';
      case 'closed':
        return 'Закрыт';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <span className="font-medium">{error}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
    <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Инциденты</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Список всех инцидентов</p>
        </div>
        <Link
          to="/incidents/new"
          className="btn-primary"
        >
          Создать инцидент
        </Link>
      </div>
      <ul className="divide-y divide-gray-200">
        {incidents.map((incident) => (
          <li key={incident.id}>
            <Link to={`/incidents/${incident.id}`} className="block hover:bg-gray-50">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-primary-600 truncate">
                      {incident.title}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(incident.status)}`}>
                        {getStatusText(incident.status)}
                      </p>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="text-sm text-gray-500">
                      {new Date(incident.created_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {incident.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IncidentsPage;
