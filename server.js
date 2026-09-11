const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Раздаём статические файлы из папки public
app.use(express.static('public'));

// Если видео в корне, добавим и его
app.use('/video', express.static(__dirname));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Маршрут для получения погоды
app.get('/api/weather', async (req, res) => {
    const lat = 43.115;
    const lon = 131.885;
    
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia/Vladivostok`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.current_weather) {
            const temp = Math.round(data.current_weather.temperature);
            const weatherCode = data.current_weather.weathercode;
            
            let desc = '';
            let icon = '';
            
            if (weatherCode === 0) { desc = 'ясно'; icon = '☀️'; }
            else if (weatherCode === 1 || weatherCode === 2) { desc = 'преимущественно ясно'; icon = '🌤️'; }
            else if (weatherCode === 3) { desc = 'облачно'; icon = '☁️'; }
            else if (weatherCode >= 45 && weatherCode <= 48) { desc = 'туман'; icon = '🌫️'; }
            else if (weatherCode >= 51 && weatherCode <= 55) { desc = 'морось'; icon = '🌧️'; }
            else if (weatherCode >= 61 && weatherCode <= 65) { desc = 'дождь'; icon = '🌧️'; }
            else if (weatherCode >= 71 && weatherCode <= 75) { desc = 'снег'; icon = '❄️'; }
            else if (weatherCode === 80 || weatherCode === 81) { desc = 'ливень'; icon = '🌧️'; }
            else if (weatherCode >= 95 && weatherCode <= 99) { desc = 'гроза'; icon = '⛈️'; }
            else { desc = 'переменная облачность'; icon = '⛅'; }
            
            res.json({
                success: true,
                temp: temp,
                desc: desc,
                icon: icon
            });
        } else {
            throw new Error('Нет данных');
        }
    } catch (error) {
        console.error('Ошибка получения погоды:', error);
        res.json({
            success: false,
            temp: 4,
            desc: 'облачно',
            icon: '☁️'
        });
    }
});

// Отдаём index.html для всех остальных маршрутов (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚌 Автобусное табло МАЗ 206 | Маршрут 24к`);
    console.log(`============================================`);
    console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
    console.log(`🌡️  API погоды: http://localhost:${PORT}/api/weather`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    console.log(`============================================\n`);
});