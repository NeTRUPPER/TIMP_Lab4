import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Создание инцидента
export const createIncident = async (req, res) => {
  const { title, description, severity, location, flight_id } = req.body;
  const userId = req.user;

  try {
    // Проверяем существование рейса
    const flight = await prisma.flights.findUnique({
      where: { id: parseInt(flight_id) }
    });

    if (!flight) {
      return res.status(404).json({ 
        error: {
          code: 404,
          message: "Рейс не найден"
        }
      });
    }

    const incident = await prisma.incidents.create({
      data: {
        title,
        description,
        severity,
        location,
        reported_by: userId,
        flight_id: parseInt(flight_id)
      },
      include: {
        flights: true
      }
    });
    res.status(201).json(incident);
  } catch (error) {
    console.error("Ошибка создания инцидента:", error);
    res.status(500).json({ 
      error: {
        code: 500,
        message: "Ошибка сервера"
      }
    });
  }
};

// Получение всех инцидентов
export const getAllIncidents = async (req, res) => {
  try {
    const incidents = await prisma.incidents.findMany({
      include: {
        title: true,
        description: true,
        severity: true,
        location: true,
        reported_by: true,
      },
    });
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ 
      error: {
        code: 500,
        message: "Ошибка сервера"
      }
    });
  }
};

export const getIncidentById = async (req, res) => {
  const { id } = req.params;

  try {
    const incident = await prisma.incidents.findUnique({
      where: { id: parseInt(id) },
      include: {
        reports: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          },
          orderBy: { created_at: "desc" }
        },
        flights: {
          include: {
            aircrafts: true,
            airports_flights_departure_airport_idToairports: true,
            airports_flights_arrival_airport_idToairports: true,
          },
        },
        users: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
    });

    if (!incident) return res.status(404).json({ 
      error: {
        code: 404,
        message: "Инцидент не найден"
      }
    });
    res.json(incident);
  } catch (error) {
    console.error("Ошибка при получении инцидента:", error);
    res.status(500).json({ 
      error: {
        code: 500,
        message: "Ошибка сервера"
      }
    });
  }
};


// Обновление инцидента
export const updateIncident = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, severity } = req.body;

  try {
    const updated = await prisma.incidents.update({
      where: { id: parseInt(id) },
      data: { title, description, status, severity },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ 
      error: {
        code: 500,
        message: "Ошибка обновления"
      }
    });
  }
};

// Удаление инцидента
export const deleteIncident = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.incidents.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Инцидент удалён" });
  } catch (error) {
    res.status(500).json({ 
      error: {
        code: 500,
        message: "Ошибка удаления"
      }
    });
  }
};

export const getIncidents = async (req, res) => {
  try {
    const incidents = await prisma.incidents.findMany({
      include: {
        flights: {
          include: {
            aircrafts: true,
            airports_flights_departure_airport_idToairports: true,
            airports_flights_arrival_airport_idToairports: true,
          },
        },
        airports: true,
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        reports: true,
      },
    });
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ 
      error: {
        code: 500,
        message: "Ошибка при получении инцидентов"
      }
    });
  }
};
