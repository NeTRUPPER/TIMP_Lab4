import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем текущую директорию
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем директорию для логов, если её нет
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Функция для логирования
const logError = (error, context = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    error: {
      message: error.message,
      stack: error.stack
    },
    context
  };

  // Записываем в файл
  fs.appendFileSync(
    path.join(logsDir, 'errors.log'),
    JSON.stringify(logEntry, null, 2) + '\n'
  );

  // Выводим в консоль
  console.error(`[${timestamp}] Error:`, error.message);
  console.error('Context:', context);
};

export { logError }; 