import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Получение всех рейсов
export const getAllFlights = async (req, res) => {
  try {
    const flights = await prisma.flights.findMany({
      include: {
        airports_flights_departure_airport_idToairports: true,
        airports_flights_arrival_airport_idToairports: true,
        aircrafts: true
      }
    });
    res.json(flights);
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ error: 'Ошибка при получении рейсов' });
  }
}; 