import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import './App.css';

const SensorDataChart = () => {
  const [sensorData, setSensorData] = useState([]);
  const [chartInstances, setChartInstances] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(null);

  const sendSensorData = async () => {
    const dadosSensor = {
      sensor_id: 1,
      temperatura: Math.random() * 50,
      umidade: Math.random() * 100,
      vibracao: Math.random() * 10,
      tensao: Math.random() * 220
    };

    try {
      const response = await fetch('http://localhost:3000/inserir-dados-sensor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosSensor)
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar dados do sensor: ' + response.statusText);
      }

      console.log('Dados do sensor enviados com sucesso.');
    } catch (error) {
      console.error('Erro ao enviar dados do sensor:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/dados-sensores');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados: ' + response.statusText);
        }
        const data = await response.json();
        setSensorData(data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const updateChartData = async () => {
      try {
        await sendSensorData();

        const response = await fetch('http://localhost:3000/dados-sensores');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados: ' + response.statusText);
        }
        const data = await response.json();
        setSensorData(data);

        Object.values(chartInstances).forEach(chart => chart.destroy());

        const ctxTemperatura = document.getElementById('temperatura-chart');
        const ctxUmidade = document.getElementById('umidade-chart');
        const ctxVibracao = document.getElementById('vibracao-chart');
        const ctxTensao = document.getElementById('tensao-chart');

        const chartOptions = {
          type: 'line',
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            },
            plugins: {
              legend: {
                labels: {
                  color: darkMode ? 'white' : 'black'
                }
              }
            }
          }
        };

        const newChartInstances = {
          temperatura: new Chart(ctxTemperatura, {
            ...chartOptions,
            data: {
              labels: data.map(entry => new Date(entry.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })),
              datasets: [{
                label: 'Temperatura',
                data: data.map(entry => entry.temperatura),
                borderColor: 'rgb(227, 15, 89)',
              }]
            }
          }),
          umidade: new Chart(ctxUmidade, {
            ...chartOptions,
            data: {
              labels: data.map(entry => new Date(entry.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })),
              datasets: [{
                label: 'Umidade',
                data: data.map(entry => entry.umidade),
                borderColor: 'rgb(54, 162, 235)',
              }]
            }
          }),
          vibracao: new Chart(ctxVibracao, {
            ...chartOptions,
            data: {
              labels: data.map(entry => new Date(entry.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })),
              datasets: [{
                label: 'Vibração',
                data: data.map(entry => entry.vibracao),
                borderColor: 'rgb(75, 192, 192)',
              }]
            }
          }),
          tensao: new Chart(ctxTensao, {
            ...chartOptions,
            data: {
              labels: data.map(entry => new Date(entry.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })),
              datasets: [{
                label: 'Tensão',
                data: data.map(entry => entry.tensao),
                borderColor: 'rgb(255, 206, 86)',
              }]
            }
          })
        };

        setChartInstances(newChartInstances);
      } catch (error) {
        console.error('Erro ao buscar ou atualizar dados:', error);
      }
    };

    const interval = setInterval(updateChartData, 10000);
    setUpdateInterval(interval);

    return () => clearInterval(interval);
  }, [chartInstances, darkMode]);

  const stopUpdates = () => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="button-container">
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
        <button onClick={stopUpdates}>Stop Updates</button>
      </div>
      <div className="charts-container">
        <div className="chart-wrapper">
          <canvas id="temperatura-chart"></canvas>
        </div>
        <div className="chart-wrapper">
          <canvas id="umidade-chart"></canvas>
        </div>
        <div className="chart-wrapper">
          <canvas id="vibracao-chart"></canvas>
        </div>
        <div className="chart-wrapper">
          <canvas id="tensao-chart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default SensorDataChart;
