// src/pages/IncidentDetailsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { incidentsApi, reportsApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

const IncidentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleAuthError } = useAuth();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [reportError, setReportError] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const fetchIncident = useCallback(async () => {
    try {
      const data = await incidentsApi.getById(id);
      console.log('Полученные данные инцидента:', JSON.stringify(data, null, 2));
      setIncident(data);
      setError('');
    } catch (err) {
      if (err.code === 401) {
        handleAuthError(err);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [id, handleAuthError]);

  useEffect(() => {
    fetchIncident();
  }, [fetchIncident]);

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот инцидент?')) {
      return;
    }

    try {
      await incidentsApi.delete(id);
      navigate('/incidents');
    } catch (err) {
      if (err.code === 401) {
        handleAuthError(err);
      } else {
        setError(err.message);
      }
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportError(null);
    setReportLoading(true);

    try {
      const response = await reportsApi.create({
          incident_id: id,
        content: reportContent,
      });

      setReportContent("");
      setIncident(prev => ({
        ...prev,
        reports: [response.report, ...prev.reports]
      }));
      setReportError('');
    } catch (error) {
      if (error.code === 401) {
        handleAuthError(error);
      } else {
        setReportError(error.message);
      }
    } finally {
      setReportLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'low':
      case 'низкий':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
      case 'средний':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
      case 'высокий':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'low':
      case 'низкий':
        return 'Низкий';
      case 'medium':
      case 'средний':
        return 'Средний';
      case 'high':
      case 'высокий':
        return 'Высокий';
      default:
        return priority || 'Не указан';
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
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Инцидент не найден</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
    <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Детали инцидента
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              ID: {incident.id}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/incidents/${id}/edit`}
              className="btn-primary"
            >
              Редактировать
            </Link>
            <button
              onClick={handleDelete}
              className="btn-danger"
            >
              Удалить
    </button>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Название</dt>
              <dd className="mt-1 text-sm text-gray-900">{incident.title}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Приоритет</dt>
              <dd className="mt-1">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(incident.severity)}`}>
                  {getPriorityText(incident.severity)}
                </span>
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Аэропорт</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {incident.flights?.airports_flights_departure_airport_idToairports ? (
                  <div className="flex items-center">
                    <span className="font-medium">{incident.flights.airports_flights_departure_airport_idToairports.name}</span>
                    <span className="ml-2 text-gray-500">({incident.flights.airports_flights_departure_airport_idToairports.code})</span>
                  </div>
                ) : incident.flights?.airports_flights_arrival_airport_idToairports ? (
                  <div className="flex items-center">
                    <span className="font-medium">{incident.flights.airports_flights_arrival_airport_idToairports.name}</span>
                    <span className="ml-2 text-gray-500">({incident.flights.airports_flights_arrival_airport_idToairports.code})</span>
                  </div>
                ) : (
                  'Не указан'
                )}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Самолет</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {incident.flights?.aircrafts ? (
                  <div className="flex items-center">
                    <span className="font-medium">{incident.flights.aircrafts.model}</span>
                    <span className="ml-2 text-gray-500">{incident.flights.aircrafts.registration}</span>
  </div>
) : (
                  'Не указан'
                )}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Дата создания</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(incident.created_at).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Описание</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {incident.description}
              </dd>
            </div>

            {(incident.flights?.airports_flights_departure_airport_idToairports || incident.flights?.airports_flights_arrival_airport_idToairports) && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Подробная информация об аэропорте</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h4 className="text-lg leading-6 font-medium text-gray-900">
                        {incident.flights.airports_flights_departure_airport_idToairports?.name || incident.flights.airports_flights_arrival_airport_idToairports?.name}
                      </h4>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {incident.flights.airports_flights_departure_airport_idToairports?.code || incident.flights.airports_flights_arrival_airport_idToairports?.code}
                      </p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Расположение</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {incident.flights.airports_flights_departure_airport_idToairports?.location || 
                             incident.flights.airports_flights_arrival_airport_idToairports?.location || 
                             'Не указано'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </dd>
              </div>
            )}

            {incident.flights?.aircrafts && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Подробная информация о самолете</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h4 className="text-lg leading-6 font-medium text-gray-900">
                        {incident.flights.aircrafts.model}
                      </h4>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {incident.flights.aircrafts.registration_number}
                      </p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Производитель</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {incident.flights.aircrafts.manufacturer || 'Не указан'}
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Вместимость</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {incident.flights.aircrafts.capacity || 'Не указана'} мест
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </dd>
              </div>
)}
          </dl>
        </div>
      </div>

      {/* Форма создания отчета */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Добавить отчет
          </h3>
          <form onSubmit={handleReportSubmit} className="mt-5 space-y-4">
            {reportError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{reportError}</p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label htmlFor="report" className="block text-sm font-medium text-gray-700">
                Содержание отчета
              </label>
        <textarea
                id="report"
                name="report"
          rows={4}
          required
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Введите содержание отчета"
        />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={reportLoading}
                className="btn-primary"
              >
                {reportLoading ? 'Отправка...' : 'Отправить отчет'}
              </button>
            </div>
      </form>
        </div>
      </div>

      {/* Список отчетов */}
      {incident.reports && incident.reports.length > 0 && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Отчеты</h3>
            <div className="reports-list space-y-4">
          {incident.reports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-600">
                      {new Date(report.created_at).toLocaleString('ru-RU', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {report.users?.username || 'Неизвестный пользователь'}
                    </div>
                  </div>
                  <div className="text-gray-800 whitespace-pre-wrap">
                    {report.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDetailsPage;
