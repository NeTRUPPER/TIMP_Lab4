import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { incidentsApi, flightsApi } from '../api/api';

const IncidentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flights, setFlights] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    location: '',
    flight_id: ''
  });

  const fetchFlights = useCallback(async () => {
    try {
      const data = await flightsApi.getAll();
      setFlights(data);
    } catch (err) {
      setError({ code: 'FETCH_ERROR', message: 'Ошибка загрузки рейсов' });
    }
  }, []);

  const fetchIncident = useCallback(async () => {
    try {
      const data = await incidentsApi.getById(id);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        severity: data.severity || 'medium',
        location: data.location || '',
        flight_id: data.flight_id || ''
      });
    } catch (err) {
      setError(err);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchIncident();
    }
    fetchFlights();
  }, [id, fetchIncident, fetchFlights]);

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError({ code: 400, message: 'Название обязательно для заполнения' });
      return false;
    }
    if (!formData.description.trim()) {
      setError({ code: 400, message: 'Описание обязательно для заполнения' });
      return false;
    }
    if (!formData.location.trim()) {
      setError({ code: 400, message: 'Местоположение обязательно для заполнения' });
      return false;
    }
    if (!formData.flight_id) {
      setError({ code: 400, message: 'Выберите рейс' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        severity: formData.severity,
        flight_id: parseInt(formData.flight_id)
      };

      if (id) {
        await incidentsApi.update(id, dataToSend);
      } else {
        await incidentsApi.create(dataToSend);
      }
      navigate('/incidents');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="card">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {id ? 'Редактирование инцидента' : 'Создание инцидента'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-4 py-5 sm:px-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <span className="font-medium">Ошибка {error.code}:</span> {error.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Название *
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            minLength={3}
            maxLength={100}
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Введите название инцидента"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Описание *
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            required
            minLength={10}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Опишите инцидент подробно"
          />
        </div>

        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
            Приоритет *
          </label>
          <select
            name="severity"
            id="severity"
            required
            value={formData.severity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Местоположение *
          </label>
          <input
            type="text"
            name="location"
            id="location"
            required
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Укажите местоположение инцидента"
          />
        </div>

        <div>
          <label htmlFor="flight_id" className="block text-sm font-medium text-gray-700">
            Рейс *
          </label>
          <select
            name="flight_id"
            id="flight_id"
            required
            value={formData.flight_id}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Выберите рейс</option>
            {flights.map(flight => (
              <option key={flight.id} value={flight.id}>
                Рейс {flight.id} - {flight.departure_airport} → {flight.arrival_airport}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/incidents')}
            className="btn-secondary"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Сохранение...' : (id ? 'Сохранить' : 'Создать')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IncidentFormPage; 