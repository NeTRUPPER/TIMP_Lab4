import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/reports
export const createReport = async (req, res) => {
  const { incident_id, content } = req.body;
  const author_id = req.user; // Получен из токена через middleware

  if (!incident_id || !content) {
    return res.status(400).json({ error: "incident_id и content обязательны" });
  }

  try {
    // Сначала проверяем существование инцидента
    const incident = await prisma.incidents.findUnique({
      where: { id: Number(incident_id) }
    });

    if (!incident) {
      return res.status(404).json({ error: "Инцидент не найден" });
    }

    // Создаем отчет с включением информации о пользователе
    const report = await prisma.reports.create({
      data: {
        content,
        incident_id: Number(incident_id),
        author_id: Number(author_id),
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({ message: "Отчёт успешно создан", report });
  } catch (error) {
    console.error("Ошибка создания отчёта:", error);
    res.status(500).json({ error: "Ошибка при создании отчёта" });
  }
};

// GET /api/reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await prisma.reports.findMany({
      include: {
        incidents: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Ошибка при получении отчётов:", error);
    res.status(500).json({ error: "Ошибка при получении отчётов" });
  }
};
